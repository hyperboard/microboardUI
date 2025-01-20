import express, { type Response } from "express";
import { body, validationResult } from "express-validator";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import { HttpStatus } from "shared/enums/http-status.enum";
import { HttpException } from "shared/exceptions/http-exception";
import winston from "winston";
import { Auth } from "./Auth";
import { REFRESH_TOKEN_EXPIRY } from "./AuthHelper";

import { catchAsync } from "shared/lib/catchAsync";
import type { Users } from "../Users";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

function setCookies(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });
}

export function getAuthRouter(authService: Auth, userService: Users, logger: winston.Logger): express.Router {
    const router = express.Router();

    router.post(
        "/auth/login",
        body("email").isEmail(),
        body("password").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email, password } = req.body;
            const jwts = await authService.login({ email, password });
            if (!jwts?.refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                });
            }
            setCookies(res, jwts.refreshToken);
            return res.json({ refreshToken: jwts.refreshToken, accessToken: jwts.accessToken });
        })
    );

    router.post(
        "/auth/register",
        body("name").isString().isLength({ min: 1 }),
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email, password, name, newsletter } = req.body;
            const user = await authService.register({
                email,
                password,
                name,
                newsletter
            });
            return res.json(user);
        })
    );

    router.post(
        "/auth/refresh",
        catchAsync(async (req, res) => {
            const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
            if (!refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                });
            }

            const jwtTokens = await authService.refresh({
                refreshToken,
            });

            if (!jwtTokens?.refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                });
            }
            setCookies(res, jwtTokens.refreshToken);
            return res.status(HttpStatus.CREATED).json(jwtTokens);
        })
    );

    router.post(
        "/auth/verify",
        body("email").isEmail().not().isEmpty(),
        body("passcode").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email, passcode } = req.body;
            const tokens = await authService.verifyEmail({
                email,
                passcode,
            });
            if (!tokens.refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                });
            }

            await userService.uploadAvatar(tokens.userId);

            setCookies(res, tokens.refreshToken);
            res.json({ refreshToken: tokens.refreshToken, accessToken: tokens.accessToken });
        })
    );

    router.post(
        "/auth/checkVerificationCodes",
        body("email").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email } = req.body;
            const answer = await authService.checkVerificationCodes({
                email,
            });

            res.json({ message: answer });
        })
    );

    router.post(
        "/auth/resendEmail",
        body("email").isEmail(),
        // body("userId").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email } = req.body;
            await authService.resendEmail({ email });
            res.json({ message: "Email sent" });
        })
    );

    router.put(
        "/auth/logout",
        jwtMiddleware(logger),
        validateRequest,
        catchAsync(async (req, res) => {
            const { token } = req;
            const userId = +token.sub;

            await authService.logout(userId);
            res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            res.json({ message: "User logged out" });
        })
    );

    router.post(
        "/auth/password/restore",
        body("token").not().isEmpty(),
        body("newPassword").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { newPassword, token } = req.body;

            await authService.restorePassword(token, newPassword);
            res.json({ message: "Password restored" });
        })
    );

    router.post(
        "/auth/password/restore/request",
        body("email").isEmail(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email } = req.body;

            await authService.requestPasswordRestoration(email);
            res.json({ message: "Email sent" });
        })
    );

    router.patch(
        "/auth/password/change",
        jwtMiddleware(logger),
        body("oldPassword").not().isEmpty(),
        body("newPassword").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { newPassword, oldPassword } = req.body;
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            if (!userId) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                });
            }

            const result = await authService.changePassword(userId, oldPassword, newPassword);

            return res.status(HttpStatus.OK).json({
                status: HttpStatus.OK,
                message: "Password changed",
            });
        })
    );

    return router;
}

function validateRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: errors.array().map((e) => e.msg),
        });
    }
    next();
}
