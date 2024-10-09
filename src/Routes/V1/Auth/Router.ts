import express, { type Response } from "express";
import winston from "winston";
import { Auth } from "./Auth";
import { body, validationResult } from "express-validator";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";
import { jwtMiddleware } from "Middlewares/jwt.middleware";
import { REFRESH_TOKEN_EXPIRY } from "./AuthHelper";

import { catchAsync } from "shared/lib/catchAsync";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

function setCookies(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });
}


export function getAuthRouter(
    authService: Auth,
    logger: winston.Logger
): express.Router {
    const router = express.Router();

    router.post(
        "/auth/login",
        body("email").isEmail(),
        body("password").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            try {
                const { email, password } = req.body;
                const jwts = await authService.login({ email, password });
                if (!jwts?.refreshToken) {
                    return res.status(HttpStatus.UNAUTHORIZED).json({
                        status: HttpStatus.UNAUTHORIZED,
                        message: "Unauthorized",
                    });
                }
                setCookies(res, jwts.refreshToken);
                return res.json(jwts);
            } catch (err: HttpException | any) {
                return handleError(res, err);
            }
        }, logger
        ));

    router.post(
        "/auth/register",
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        validateRequest,
        catchAsync(async (req, res) => {
            try {
                const { email, password } = req.body;
                const user = await authService.register({
                    email,
                    password,
                });
                return res.json(user);
            } catch (err: HttpException | any) {
                return handleError(res, err);
            }
        }, logger)
    );

    router.post("/auth/refresh", catchAsync(async (req, res) => {
        try {
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
            setCookies(res, jwtTokens.refreshToken)
            return res.json(jwtTokens);
        } catch (err) {
            return handleError(res, err);
        }
    }, logger));

    router.post(
        "/auth/verify",
        body("email").not().isEmpty(),
        body("passcode").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email, passcode } = req.body;
            try {
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

                setCookies(res, tokens.refreshToken)
                res.json(tokens);
            } catch (err) {
                return handleError(res, err);
            }
        }, logger
    ));

    router.post(
        "/auth/checkVerificationCodes",
        body("email").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email } = req.body;
            try {
                const answer = await authService.checkVerificationCodes({
                    email,
                });

                res.json({ message: answer });
            } catch (err) {
                return handleError(res, err);
            }
        }, logger)
    );

    router.post(
        "/auth/resendEmail",
        body("email").isEmail(),
        // body("userId").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email } = req.body;
            try {
                await authService.resendEmail({ email });
                res.json({ message: "Email sent" });
            } catch (err) {
                return handleError(res, err);
            }
        }, logger)
    );

    router.put(
        "/auth/logout",
        jwtMiddleware(logger),
        validateRequest,
        catchAsync(async (req, res) => {
            const { token } = req;
            const userToken = await token;
            const userId = parseInt(userToken?.sub);

            try {
                await authService.logout(userId);
                res.clearCookie(REFRESH_TOKEN_COOKIE_NAME)
                res.json({ message: "User logged out" });
            } catch (err) {
                return handleError(res, err);
            }
        }, logger)
    );

    router.post(
        "/auth/password/restore",
        body("token").not().isEmpty(),
        body("newPassword").not().isEmpty(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { newPassword, token } = req.body;


            try {
                await authService.restorePassword(token, newPassword);
                res.json({ message: "Password restored" });
            } catch (err) {
                return handleError(res, err);
            }
        }, logger)
    );

    router.post(
        "/auth/password/restore/request",
        body("email").isEmail(),
        validateRequest,
        catchAsync(async (req, res) => {
            const { email } = req.body;

            try {
                await authService.requestPasswordRestoration(email);
                res.json({ message: "Email sent" });
            } catch (err) {
                return handleError(res, err);
            }
        }, logger)
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

            try {
                const result = await authService.changePassword(
                    userId,
                    oldPassword,
                    newPassword
                );

                return res.status(HttpStatus.OK).json({
                    status: HttpStatus.OK,
                    message: "Password changed",
                });
            } catch (err) {
                return handleError(res, err);
            }
        }, logger)
    );

    return router;
}

function validateRequest(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: HttpStatus.BAD_REQUEST,
            message: errors.array().map((e) => e.msg),
        });
    }
    next();
}

function handleError(
    res: express.Response,
    error: any,
    defaultStatus = HttpStatus.INTERNAL_SERVER_ERROR
) {
    const status = error.status || defaultStatus;

    return res.status(status).json({
        status,
        message: error.message,
    });
}
