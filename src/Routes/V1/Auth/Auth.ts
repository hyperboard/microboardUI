import type { Request, Response } from "express";
import { AccessToken } from "Interface";
import { verifyToken } from "Tokens";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as Drizzle from "drizzle";
import { decode } from "jsonwebtoken";
import { Config } from "shared/config/config";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import { Mailer } from "shared/modules/mailer/mailer";
import winston from "winston";
import type { Users } from "../Users";
import { AuthHelper } from "./AuthHelper";
import {
    LoginPayload,
    Permissions,
    RefreshPayload,
    RegisterPayload,
    ResendEmailPayload,
    VerifyEmailPayload,
} from "./types";
import type { Lang } from "Middlewares/language.middleware";
import { verifyMessage } from "ethers";
import { db } from "drizzle/db";
import type { TokenPayload } from "google-auth-library";

export class Auth {
    private authHelper: AuthHelper;

    constructor(
        private logger: winston.Logger,
        private userService: Users,
        private config: Config,
        private mailer: Mailer
    ) {
        this.authHelper = new AuthHelper(this.config);
        this.handleNonce = this.handleNonce.bind(this);
        this.handleVerifySignature = this.handleVerifySignature.bind(this);
        this.handleRequestAddEmail = this.handleRequestAddEmail.bind(this);
        this.handleAddEmail = this.handleAddEmail.bind(this);
    }

    async login(payload: LoginPayload): Promise<{ accessToken: string; refreshToken: string; userId: number } | null> {
        const user = await Drizzle.getUserAuthInfo(payload.email);

        if (!user) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Invalid email or password");
        }

        if (!user.activated) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "User not activated");
        }

        this.logger.log("info", user?.password || "", payload.password);
        const isValidPassword = await bcrypt.compare(payload.password, user?.password || "");

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

    async register(
        payload: RegisterPayload,
        lang: Lang = "en"
    ): Promise<{ email: string; id: number; name: string } | null> {
        const user = await Drizzle.getUserByEmail(payload.email);

        if (user) {
            throw new HttpException(HttpStatus.CONFLICT, "User already exists");
        }

        try {
            await Drizzle.addUser(payload.email, payload.newsletter);
        } catch (e) {
            this.logger.error(`add_user error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when creating new user");
        }

        const createdUser = await Drizzle.getUserByEmail(payload.email);
        await Drizzle.addUsername(createdUser.userId, payload.name);

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
            await this.mailer.sendMail(
                createdUser.userEmail!,
                lang === "en" ? "Confirm Your Email Address" : "Подтвердите ваш Email",
                {
                    template: "verify-email",
                    context: {
                        passcode: encodeURIComponent(passcode),
                        userId: encodeURIComponent(createdUser.userId),
                        email: encodeURIComponent(createdUser.userEmail!),
                    },
                },
                lang
            );
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
        }

        return {
            id: createdUser.userId,
            email: createdUser.userEmail!,
            name: createdUser.userName!,
        };
    }

    async loginGoogleAccount(payload: TokenPayload) {
        if (!payload.email) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid google account");
        }
        const user = await Drizzle.getUserAuthInfo(payload.email);

        if (user) {
            if (!user.activated) {
                throw new HttpException(HttpStatus.UNAUTHORIZED, "User not activated");
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
        } else {
            await Drizzle.addUser(payload.email, false);
            const createdUser = await Drizzle.getUserByEmail(payload.email);
            if (payload.name) {
                await Drizzle.addUsername(createdUser.userId, payload.name);
            }
            await Drizzle.updateUserActiveStatus(createdUser.userId);
            const permissions = await this.getPermissions(createdUser.userId);
            const { accessToken, refreshToken } = await this.authHelper.generateTokens(createdUser.userId, {
                ...permissions,
            });

            const salt = await bcrypt.genSalt(10);
            const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

            this.trySaveToken(createdUser.userId, refreshTokenHash);
            await this.userService.uploadAvatar(createdUser.userId);

            return {
                userId: createdUser.userId,
                accessToken,
                refreshToken,
            };
        }
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

        if (user.activated) {
            return "USER_ALREADY_ACTIVATED";
        }

        const passcode = this.authHelper.generatePasscode();
        const lastPasscode = await Drizzle.getLastPasscode(user.userId);

        const HOURS_24 = 24 * 60 * 60 * 1000;

        if (lastPasscode && +lastPasscode.created! < Date.now() - HOURS_24) {
            await Drizzle.addPasscode(user.userId, passcode);
            return await this.trySendVerifyMail(user.userId, email, passcode);
        }

        return `PASSCODE_NOT_SENDED: ${+lastPasscode.created! - (Date.now() - 3 * 60 * 1000)}`;
    }

    async resendEmail(payload: ResendEmailPayload, lang: Lang = "en"): Promise<any> {
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

        return await this.trySendVerifyMail(userId, payload.email, passcode, lang);
    }

    async logout(userId: number) {
        try {
            await Drizzle.updateRefreshToken(userId);
        } catch (err) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when logging out");
        }

        return true;
    }

    async requestPasswordRestoration(email: string, lang: Lang = "en"): Promise<void> {
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
            await this.mailer.sendMail(
                email,
                lang === "en" ? "Password Reset Request" : "Запрос на сброс пароля",
                {
                    template: "restore-password",
                    context: {
                        token: token,
                    },
                },
                lang
            );
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

        const isSamePassword = await bcrypt.compare(newPassword, oldPassword || "");

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

    private async trySendVerifyMail(userId: number, userEmail: string, passcode: string, lang: Lang = "en") {
        try {
            await this.mailer.sendMail(
                userEmail,
                lang === "en" ? "Confirm Your Email Address" : "Подтвердите ваш Email",
                {
                    template: "verify-email",
                    context: {
                        passcode: passcode,
                        userId: "" + userId,
                        email: userEmail,
                    },
                },
                lang
            );

            return "PASSCODE_SENDED";
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred when sending verification email");
        }
    }

    async handleNonce(req: Request, res: Response) {
        const { address } = req.body;
        const uniqueMessage = `sign this message to log in. nonce: ${crypto
            .randomBytes(16)
            .toString("hex")}`.toLowerCase();
        await Drizzle.saveNonce(address, uniqueMessage);

        return res.status(HttpStatus.OK).json({ message: uniqueMessage });
    }

    handleVerifySignature(setCookies: (res: Response, refreshToken: string) => void) {
        return async (req: Request, res: Response) => {
            const { address, signature } = req.body;

            const lastNonce = await Drizzle.getLastNonce(address);
            if (!lastNonce) {
                throw new HttpException(HttpStatus.UNAUTHORIZED, "Nonce not found");
            }

            const HOURS_24 = 24 * 60 * 60 * 1000;
            if (+lastNonce.created < Date.now() - HOURS_24) {
                throw new HttpException(HttpStatus.UNAUTHORIZED, "Nonce expired");
            }
            if (lastNonce.remainingAttempts <= 0) {
                throw new HttpException(HttpStatus.UNAUTHORIZED, "PASSCODE_ATTEMPTS_EXCEEDED");
            }

            const recoveredAddress = verifyMessage(lastNonce.nonce, signature);
            const checkNonce = await Drizzle.checkNonce(lastNonce, address, recoveredAddress);

            if (!checkNonce) {
                throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid nonce");
            }

            const user = await Drizzle.getOrCreateUserByAddress(address);
            if (!user) {
                throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to get user");
            }

            const permissions = await this.getPermissions(user.userId);
            const tokens = await this.authHelper.generateTokens(user.userId, { ...permissions });
            const salt = await bcrypt.genSalt(10);
            const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);

            await this.trySaveToken(user.userId, refreshTokenHash);
            setCookies(res, tokens.refreshToken);

            if (user.avatarGenerated) {
                await this.userService.uploadAvatar(user.userId);
            }

            return res.status(HttpStatus.OK).json({ ...tokens, userId: user.userId });
        };
    }

    async handleRequestAddEmail(req: Request, res: Response) {
        const { email } = req.body;
        const { token } = req;
        const userToken = await token;
        const userId = parseInt(userToken?.sub);
        if (!userId) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        const user = await Drizzle.getUser(userId);
        if (!user) {
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        const passcode = this.authHelper.generatePasscode();

        console.log("GENERATED PASSCODE", passcode);
        await Drizzle.addPasscode(user.userId, passcode);
        console.log("ADDED");
        await this.mailer.sendMail(email, "Confirm Your Email Address", {
            template: "verify-email",
            context: {
                passcode: encodeURIComponent(passcode),
                userId: encodeURIComponent(user.userId),
                email: encodeURIComponent(email),
            },
        });

        return res.status(HttpStatus.OK).json({ message: "Passcode sent to email", email });
    }

    async handleAddEmail(req: Request, res: Response) {
        const { email, passcode } = req.body;

        const { token } = req;
        const userToken = await token;
        const userId = parseInt(userToken?.sub);
        if (!userId) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        const user = await Drizzle.getUser(userId);
        if (!user) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (user.userEmail) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        const isPasscodeValid = await Drizzle.checkPasscode(passcode, userId);
        if (!isPasscodeValid) {
            throw new HttpException(HttpStatus.UNAUTHORIZED, "Invalid passcode");
        }

        await Drizzle.addEmail(userId, email);

        return res.status(HttpStatus.OK).json({ message: "Email added successfully" });
    }
}
