import express from "express";
import { Auth } from "./Auth";
import validator from "validator";
import { HttpException } from "../../../../shared/exceptions/http-exception";
import { HttpStatus } from "../../../../shared/enums/http-status.enum";

export function getAuthRouter(authService: Auth): express.Router {
    const router = express.Router();

    router.post("/auth/login", async (request, response) => {
        const { email, password } = request.body;
        if (!email || !password) {
            response
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    status: HttpStatus.BAD_REQUEST,
                    message: "Email and password are required.",
                })
                .end();
        }
        const validationMessages = {
            email: "email field must be a valid email",
        };
        const messages: string[] = [];
        const isValidEmail = validator.isEmail(email);
        if (!isValidEmail) {
            messages.push(validationMessages.email);
        }

        if (messages.length > 0) {
            response
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    status: HttpStatus.BAD_REQUEST,
                    message: messages,
                })
                .end();
        }
        let jwtTokens: Awaited<ReturnType<typeof authService.login>> = null;
        try {
            jwtTokens = await authService.login({ email, password });
            response.json(jwtTokens).end();
        } catch (e: HttpException | any) {
            response
                .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    message: e.message,
                })
                .end();
        }

        response.end();
    });

    router.post("/auth/register", async (request, response) => {
        const { email, password } = request.body;
        if (!email || !password) {
            response
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    status: HttpStatus.BAD_REQUEST,
                    message: "Email and password are required.",
                })
                .end();
        }

        const validationMessages = {
            email: "email field must be a valid email",
            password:
                "password field must be at least 6 characters and at most 20 characters",
        };
        const messages: string[] = [];
        const isValidEmail = validator.isEmail(email);
        if (!isValidEmail) {
            messages.push(validationMessages.email);
        }
        // TODO: Уточнить требования к паролю
        const isValidPassword = validator.isLength(password, {
            min: 6,
            max: 20,
        });
        if (!isValidPassword) {
            messages.push(validationMessages.password);
        }

        if (messages.length > 0) {
            response
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    status: HttpStatus.BAD_REQUEST,
                    message: messages,
                })
                .end();
        }

        let user: Awaited<ReturnType<typeof authService["register"]>> = null;
        try {
            user = await authService.register({
                email,
                password,
            });
            response.json(user);
        } catch (e: HttpException | any) {
            response.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            });
        }

        response.end();
    });

    router.post("/auth/refresh", async (request, response) => {
        const refreshToken = request.headers["authorization"]?.split(" ")?.[1];
        if (!refreshToken) {
            response
                .status(HttpStatus.UNAUTHORIZED)
                .json({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "Unauthorized",
                })
                .end();
        }
        let jwtTokens: Awaited<ReturnType<typeof authService.refresh>> = null;
        try {
            jwtTokens = await authService.refresh({
                refreshToken: refreshToken!,
            });
            response.json(jwtTokens).end();
        } catch (e: HttpException | any) {
            response
                .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    message: e.message,
                })
                .end();
        }

        response.end();
    });

    router.post("/auth/verify", async (request, response) => {
        const { userId, passcode } = request.body;
        if (!userId || !passcode) {
            response
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    status: HttpStatus.BAD_REQUEST,
                    message: "userId and passcode are required.",
                })
                .end();
        }

        try {
            const tokens = await authService.verifyEmail({ userId, passcode });
            response.json(tokens).end();
        } catch (e: HttpException | any) {
            response
                .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    message: e.message,
                })
                .end();
        }

        response.end();
    });

    router.post("auth/resendEmail", async (request, response) => {
        const { email, userId } = request.body;
        if (!email || !userId) {
            response
                .status(HttpStatus.BAD_REQUEST)
                .json({
                    status: HttpStatus.BAD_REQUEST,
                    message: "email and userId are required.",
                })
                .end();
        }

        try {
            await authService.resendEmail({ email, userId });
            response
                .json({
                    message: "Email sent",
                })
                .end();
        } catch (e: HttpException | any) {
            response
                .status(e.status || HttpStatus.INTERNAL_SERVER_ERROR)
                .json({
                    status: e.status || HttpStatus.INTERNAL_SERVER_ERROR,
                    message: e.message,
                })
                .end();
        }

        response.end();
    });

    return router;
}
