import * as Drizzle from "drizzle";
import winston from "winston";
import { decode, verify } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { Config } from "shared/config/config";
import { Mailer } from "shared/modules/mailer/mailer";
import { AuthHelper } from "./AuthHelper";
import { AccessToken } from "Interface";
import {
    LoginPayload,
    Permissions,
    RefreshPayload,
    RegisterPayload,
    ResendEmailPayload,
    VerifyEmailPayload,
} from "./types";
import { verifyToken } from "Tokens";
import * as crypto from "crypto";
import type { Users } from "../Users";

export class Auth {
    private authHelper: AuthHelper;

    constructor(private logger: winston.Logger, private userService: Users, private config: Config, private mailer: Mailer) {
        this.authHelper = new AuthHelper(this.config);
    }

    async login(payload: LoginPayload): Promise<{ accessToken: string; refreshToken: string, userId: number } | null> {
        const user = await Drizzle.getUserAuthInfo(payload.email);

        if (!user) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Invalid email or password");
        }

        if (!user.activated) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "User not activated");
        }

        this.logger.log("info", user.password!, payload.password);
        const isValidPassword = await bcrypt.compare(payload.password, user.password!);

        if (!isValidPassword) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Invalid email or password");
        }

        const permissions = await this.getPermissions(user.id);

        const { accessToken, refreshToken } = await this.authHelper.generateTokens(user.id, { ...permissions });

        const salt = await bcrypt.genSalt(10);
        const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

        this.trySaveToken(user.id, refreshTokenHash);
        if (user.avatarGenerated) {
            await this.userService.uploadAvatar(user.id);

        }
        return {
            userId: user.id,
            accessToken,
            refreshToken,
        };
    }

    async register(payload: RegisterPayload): Promise<{ email: string; id: number, name: string } | null> {
        const user = await Drizzle.getUserByEmail(payload.email);

        if (user) {
            throw new HttpException(HttpStatus.CONFLICT, "User already exists");
        }

        try {
            await Drizzle.addUser(payload.email);
        } catch (e) {
            this.logger.error(`add_user error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when creating new user");
        }

        const createdUser = await Drizzle.getUserByEmail(payload.email);
        await Drizzle.addUsername(createdUser.userId, payload.name)

        if (!createdUser) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when creating new user");
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(payload.password, salt);

        try {
            await Drizzle.addPassword(createdUser.userId, password);
        } catch (e) {
            this.logger.error(`add_user_password error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when setting new user password");
        }

        const passcode = this.authHelper.generatePasscode();

        try {
            await Drizzle.addPasscode(createdUser.userId, passcode);
        } catch (e) {
            this.logger.error(`add_user_passcode error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when setting new user passcode");
        }

        try {
            await this.mailer.sendMail(createdUser.userEmail!, "Confirm Your Email Address", {
                template: "verify-email",
                context: {
                    passcode: encodeURIComponent(passcode),
                    userId: encodeURIComponent(createdUser.userId),
                    email: encodeURIComponent(createdUser.userEmail!),
                },
            });
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
        }

        return { id: createdUser.userId, email: createdUser.userEmail!, name: createdUser.name! };
    }

    async refresh(payload: RefreshPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        const claims: AccessToken = decode(payload.refreshToken) as AccessToken;
        const savedRefreshTokenHash = await Drizzle.getRefreshToken(+claims.sub);

        if (!savedRefreshTokenHash) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
        }

        /* FIXME: this statement always return true,
        but refresh token in DB updates every time so
        I expect: false with the same token in Auth header
        when it send more then once */
        const isRefreshTokensEqual = await bcrypt.compare(payload.refreshToken, savedRefreshTokenHash);

        if (!isRefreshTokensEqual) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
        }

        const verifiedUser = verifyToken(payload.refreshToken, "refresh");

        if (!verifiedUser) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
        }

        const permissions = await this.getPermissions(+claims.sub);

        const { accessToken, refreshToken } = await this.authHelper.generateTokens(+claims.sub, {
            owns: { ...claims.owns, ...permissions.owns },
            edits: { ...claims.edits, ...permissions.edits },
            reads: { ...claims.reads, ...permissions.reads },
        });

        const salt = await bcrypt.genSalt(10);
        const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

        this.trySaveToken(+claims.sub, refreshTokenHash);

        return {
            accessToken,
            refreshToken,
        };
    }

    async verifyEmail(payload: VerifyEmailPayload): Promise<any> {
        const { userId } = await Drizzle.getUserByEmail(payload.email);

        if (!userId) {
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        const checkPasscode = await Drizzle.checkPasscode(payload.passcode, userId);
        const lastPasscode = await Drizzle.getLastPasscode(userId);

        if (!lastPasscode) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Passcode not found");
        }

        const HOURS_24 = 24 * 60 * 60 * 1000;

        if (+lastPasscode.created! < Date.now() - HOURS_24) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Passcode expired");
        }
        if (+lastPasscode.remainingAttempts <= 0) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "PASSCODE_ATTEMPTS_EXCEEDED");
        }

        if (!checkPasscode) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid passcode");
        }

        const updateUser = await Drizzle.updateUserActiveStatus(userId);

        if (!updateUser) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when activating user");
        }

        const permissions = await this.getPermissions(updateUser.userId);

        const tokens = await this.authHelper.generateTokens(updateUser.userId, {
            owns: { ...permissions.owns },
            edits: { ...permissions.edits },
            reads: { ...permissions.reads },
        });

        const salt = await bcrypt.genSalt(10);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);

        this.trySaveToken(updateUser.userId, refreshTokenHash);

        return { ...tokens, userId: updateUser.userId };
    }

    async checkVerificationCodes({ email }: { email: string }): Promise<string> {
        const user = await Drizzle.getUserByEmail(email);

        if (!user) {
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (user.activated) {
            return 'USER_ALREADY_ACTIVATED';
        }

        const passcode = this.authHelper.generatePasscode();
        const lastPasscode = await Drizzle.getLastPasscode(user.userId);

        const HOURS_24 = 24 * 60 * 60 * 1000;

        if (lastPasscode && +lastPasscode.created! < Date.now() - HOURS_24) {
            await Drizzle.addPasscode(user.userId, passcode);
            return await this.trySendVerifyMail(user.userId, email, passcode);
        }

        return `PASSCODE_NOT_SENDED: ${+lastPasscode.created! - (Date.now() - 3 * 60 * 1000)}`
    }

    async resendEmail(payload: ResendEmailPayload): Promise<any> {
        const { userId } = await Drizzle.getUserByEmail(payload.email);

        if (!userId) {
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        const passcode = this.authHelper.generatePasscode();
        const lastPasscode = await Drizzle.getLastPasscode(userId);

        if (!lastPasscode) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Passcode not found");
        }

        const MINUTES_3 = 3 * 60 * 1000;

        if (lastPasscode && +lastPasscode.created! > Date.now() - MINUTES_3) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                `Can retry after 3 minutes: ${+lastPasscode.created! - (Date.now() - MINUTES_3)}`
            );
        }

        try {
            await Drizzle.addPasscode(userId, passcode);
        } catch (e) {
            this.logger.error(`add_user_passcode error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when setting new user passcode");
        }

        return await this.trySendVerifyMail(userId, payload.email, passcode);
    }

    async logout(userId: number) {
        try {
            await Drizzle.updateRefreshToken(userId);
        } catch (err) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when logging out");
        }

        return true;
    }

    async requestPasswordRestoration(email: string): Promise<void> {
        const user = await Drizzle.getUserByEmail(email);

        if (!user) {
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        const token = crypto.randomBytes(32).toString("hex");
        const HOURS_24 = 24 * 60 * 60 * 1000;

        // 24 hours from now
        const expirationTime = new Date(Date.now() + HOURS_24).toISOString();

        try {
            await Drizzle.createPasswordResetRequests(user.userId, `${token}`, new Date(expirationTime));
        } catch (err) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when requesting password restoration"
            );
        }

        try {
            await this.mailer.sendMail(email, "Password Reset Request", {
                template: "restore-password",
                context: {
                    token: token,
                },
            });
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
        }
    }

    async restorePassword(token: string, newPassword: string) {
        const { userId } = await Drizzle.getPasswordResetRequests(token);

        if (!userId) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when restoring password: invalid token or expired"
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        const oldPassword = await Drizzle.getPassword(userId);

        const isSamePassword = await bcrypt.compare(newPassword, oldPassword!);

        if (isSamePassword) {
            throw new HttpException(HttpStatus.CONFLICT, "New password is the same as the old one");
        }

        try {
            await Drizzle.deletePassword(userId);
            await Drizzle.addPassword(userId, hashedPassword);
        } catch (e) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when restoring password");
        }

        try {
            await Drizzle.deletePasswordResetRequests(userId);
        } catch (error) {
            this.logger.error(`Error deleting password reset request: ${error}`);
        }
    }

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const hashedPassword = await Drizzle.getPassword(userId);

        if (!hashedPassword) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when changing password: user not found"
            );
        }

        const isSamePassword = await bcrypt.compare(oldPassword, hashedPassword);

        if (!isSamePassword) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Wrong password");
        }

        const isNewSameAsOld = await bcrypt.compare(newPassword, hashedPassword);

        if (isNewSameAsOld) {
            throw new HttpException(HttpStatus.CONFLICT, "ERROR_SAME_PASSWORD");
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        try {
            await Drizzle.deletePassword(userId!);
            await Drizzle.addPassword(userId!, newHash);
        } catch (err) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when changing password");
        }
    }

    private async getPermissions(userId: number): Promise<Permissions> {
        const { author, canEdit, canView } = await Drizzle.getUserBoards(userId);

        const permissions: Permissions = {
            owns: {
                boards: author,
                catalogs: ["root"],
            },
            edits: {
                boards: canEdit,
                catalogs: ["root"],
            },
            reads: {
                boards: canView,
                catalogs: ["root"],
            },
        };

        return permissions;
    }

    private async trySaveToken(userId: number, refreshTokenHash: string) {
        try {
            await Drizzle.saveToken(userId, refreshTokenHash);
        } catch (e) {
            this.logger.error(`save_token error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when saving refresh token");
        }
    }

    private async trySendVerifyMail(userId: number, userEmail: string, passcode: string) {
        try {
            await this.mailer.sendMail(userEmail, "Confirm Your Email Address", {
                template: "verify-email",
                context: {
                    passcode: passcode,
                    userId: "" + userId,
                    email: userEmail,
                },
            });

            return "PASSCODE_SENDED";
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when sending verification email");
        }
    }
}
