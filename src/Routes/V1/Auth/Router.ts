import express from "express";
import { Auth } from "./Auth";
import { body, validationResult } from "express-validator";
import { HttpException } from "shared/exceptions/http-exception";
import { HttpStatus } from "shared/enums/http-status.enum";

export function getAuthRouter(authService: Auth): express.Router {
    const router = express.Router();

    router.post(
        "/auth/login",
        body("email").isEmail(),
        body("password").not().isEmpty(),
        validateRequest,
        async (req, res) => {
            try {
                const { email, password } = req.body;
                const jwts = await authService.login({ email, password });
                return res.json(jwts);
            } catch (err: HttpException | any) {
                return handleError(res, err);
            }
        }
    );

    router.post(
        "/auth/register",
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        validateRequest,
        async (req, res) => {
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
        }
    );

    router.post("/auth/refresh", async (req, res) => {
        try {
            const refreshToken = req.headers["authorization"]?.split(" ")?.[1];
            if (!refreshToken) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                });
            }

            const jwtTokens = await authService.refresh({
                refreshToken,
            });
            return res.json(jwtTokens);
        } catch (err) {
            return handleError(res, err);
        }
    });

    router.post(
        "/auth/verify",
        body("userId").not().isEmpty(),
        body("passcode").not().isEmpty(),
        validateRequest,
        async (req, res) => {
            const { userId, passcode } = req.body;
            try {
                const tokens = await authService.verifyEmail({
                    userId,
                    passcode,
                });
                res.json(tokens);
            } catch (err) {
                return handleError(res, err);
            }
        }
    );

    router.post(
        "/auth/resendEmail",
        body("email").isEmail(),
        body("userId").not().isEmpty(),
        validateRequest,
        async (req, res) => {
            const { email, userId } = req.body;
            try {
                await authService.resendEmail({ email, userId });
                res.json({ message: "Email sent" });
            } catch (err) {
                return handleError(res, err);
            }
        }
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
