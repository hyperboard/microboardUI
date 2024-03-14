import winston from "winston";
import { decode, verify } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { Config } from "shared/config/config";
import { Mailer } from "shared/modules/mailer/mailer";
import { AuthHelper } from "./AuthHelper";
import { Pool } from "pg";

type RegisterPayload = {
    email: string;
    password: string;
};

type LoginPayload = {
    email: string;
    password: string;
};

type RefreshPayload = {
    refreshToken: string;
};

type VerifyEmailPayload = {
    passcode: string;
    userId: number;
};

type ResendEmailPayload = {
    email: string;
    userId: number;
};

export class Auth {
    private authHelper: AuthHelper;

    constructor(
        private database: Pool,
        private logger: winston.Logger,
        private config: Config,
        private mailer: Mailer
    ) {
        this.authHelper = new AuthHelper(this.config);
    }

    async login(payload: LoginPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        const user = await this.database.query<{
            id: number;
            email: string;
            password: string;
            activated: boolean;
        }>(
            `
                select users.id               as id,
                       users.email            as email,
                       users.activated        as activated,
                       user_password.password as password
                from users
                         left join user_password on users.id = user_password.user_id
                where email = $1
            `,
            [payload.email]
        );

        if (!user.rows[0]) {
            throw new HttpException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (!user.rows[0].activated) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "User not activated"
            );
        }

        this.logger.log("info", user.rows[0].password, payload.password);
        const isValidPassword = await bcrypt.compare(
            payload.password,
            user.rows[0].password
        );

        if (!isValidPassword) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        const { accessToken, refreshToken } = this.authHelper.generateTokens(
            user.rows[0].email,
            user.rows[0].id
        );

        const salt = await bcrypt.genSalt(10);
        const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

        try {
            await this.database.query(
                `
                select save_token($1, $2)
                `,
                [user.rows[0].id, refreshTokenHash]
            );
        } catch (e) {
            this.logger.error(`save_token error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when saving refresh token"
            );
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    async register(
        payload: RegisterPayload
    ): Promise<{ email: string; id: number } | null> {
        const user = await this.database.query<{ email: string; id: number }>(
            "select email, id from users where email = $1",
            [payload.email]
        );

        const existedUser = user.rows[0];

        if (existedUser) {
            throw new HttpException(HttpStatus.CONFLICT, "User already exists");
        }

        try {
            await this.database.query("select add_user($1)", [payload.email]);
        } catch (e) {
            this.logger.error(`add_user error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when creating new user"
            );
        }

        const createdUser = await this.database.query<{
            id: number;
            email: string;
        }>(
            `
                select id, email
                from users
                where email = $1
            `,
            [payload.email]
        );

        if (!createdUser) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when creating new user"
            );
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(payload.password, salt);

        try {
            await this.database.query("select add_password($1, $2)", [
                createdUser.rows[0].id,
                password,
            ]);
        } catch (e) {
            this.logger.error(`add_user_password error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when setting new user password"
            );
        }

        const passcode = this.authHelper.generatePasscode();

        try {
            await this.database.query(
                `
            select add_passcode($1, $2)
            `,
                [createdUser.rows[0].id, passcode]
            );
        } catch (e) {
            this.logger.error(`add_user_passcode error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when setting new user passcode"
            );
        }

        try {
            console.log("user: ", createdUser.rows[0]);
            await this.mailer.sendMail(
                createdUser.rows[0].email,
                "Microboard: Verify your email",
                {
                    template: "verify-email",
                    context: {
                        passcode: passcode,
                        userId: createdUser.rows[0].id,
                    },
                }
            );
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
        }

        return createdUser.rows[0];
    }

    async refresh(payload: RefreshPayload): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        const decodedUser: RequestUser = decode(
            payload.refreshToken
        ) as RequestUser;

        const savedRefreshTokenHash = await this.database.query<{
            refresh_token: string;
        }>(
            `
                select refresh_token
                from users
                where id = $1
            `,
            [decodedUser.id]
        );

        if (!savedRefreshTokenHash.rows[0]) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "Refresh token is invalid or expired"
            );
        }

        /* FIXME: this statement always return true,
        but refresh token in DB updates every time so
        I expect: false with the same token in Auth header
        when it send more then once */
        const isRefreshTokensEqual = await bcrypt.compare(
            payload.refreshToken,
            savedRefreshTokenHash.rows[0].refresh_token
        );

        if (!isRefreshTokensEqual) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "Refresh token is invalid or expired"
            );
        }

        const verifiedUser = verify(
            payload.refreshToken,
            process.env.JWT_REFRESH_SECRET!
        );

        if (!verifiedUser) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "Refresh token is invalid or expired"
            );
        }

        const { accessToken, refreshToken } = this.authHelper.generateTokens(
            decodedUser.email,
            +decodedUser.id
        );

        const salt = await bcrypt.genSalt(10);
        const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

        try {
            await this.database.query(
                `
                select save_token($1, $2)
                `,
                [decodedUser.id, refreshTokenHash]
            );
        } catch (e) {
            this.logger.error(`save_token error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when saving refresh token"
            );
        }

        return {
            accessToken,
            refreshToken,
        };
    }

    async verifyEmail(payload: VerifyEmailPayload): Promise<any> {
        const checkPasscode = await this.database.query(
            `select check_passcode($1, $2)`,
            [payload.userId, payload.passcode]
        );

        if (!checkPasscode.rows[0].check_passcode) {
            throw new HttpException(
                HttpStatus.UNAUTHORIZED,
                "Invalid passcode"
            );
        }

        const updateUser = await this.database.query<{
            id: number;
            email: string;
        }>(
            `
            update users
            set activated = true
            where id = $1 returning id, email
        `,
            [payload.userId]
        );

        if (!updateUser) {
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when activating user"
            );
        }

        const tokens = this.authHelper.generateTokens(
            updateUser.rows[0].email,
            updateUser.rows[0].id
        );

        return tokens;
    }

    async resendEmail(payload: ResendEmailPayload): Promise<any> {
        const passcode = this.authHelper.generatePasscode();
        try {
            await this.database.query(
                `
                select add_passcode($1, $2)
                `,
                [payload.userId, passcode]
            );
        } catch (e) {
            this.logger.error(`add_user_passcode error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when setting new user passcode"
            );
        }

        try {
            await this.mailer.sendMail(
                payload.email,
                "Microboard: Verify your email",
                {
                    template: "verify-email",
                    context: {
                        passcode: passcode,
                        userId: payload.userId,
                    },
                }
            );
        } catch (e) {
            this.logger.error(`sendMail error: ${e}`);
            throw new HttpException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error occurred when sending verification email"
            );
        }
    }
}
