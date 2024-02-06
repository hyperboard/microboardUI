import express from 'express';
import { Auth } from "./Auth";
import validator from "validator";
import { HttpException } from "../../../../shared/expceptions/http-exception";

export function getAuthRouter(authService: Auth): express.Router {
  const router = express.Router();

  router.post('/auth/login', async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
      response
          .status(400)
          .json({
            status: 400,
            message: "Email and password are required.",
          })
          .end();
    }
    const validationMessages = {
      email: "email field must be a valid email",
    }
    const messages: string[] = [];
    const isValidEmail = validator.isEmail(email);
    if (!isValidEmail) {
      messages.push(validationMessages.email);
    }

    if (messages.length > 0) {
        response
            .status(400)
            .json({
                status: 400,
                message: messages
            })
            .end();
    }
    let jwtTokens: Awaited<ReturnType<typeof authService.login>> = null;
    try {
        jwtTokens = await authService.login({ email, password });
        response
            .json(jwtTokens)
            .end();
    } catch(e: HttpException | any) {
        if (e instanceof  HttpException) {
            response
                .status(e.status)
                .json({
                    status: e.status,
                    message: e.message
                })
                .end();
        } else {
            response
                .status(500)
                .json({
                    status: 500,
                    message: e.message
                })
                .end();
        }
    }

    response.end();
  })

  router.post('/auth/register', async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
      response
          .status(400)
          .json({
            status: 400,
            message: "Email and password are required.",
          })
          .end();
    }

      const validationMessages = {
          email: "email field must be a valid email",
          password: "password field must be at least 6 characters and at most 20 characters",
      }
      const messages: string[] = [];
      const isValidEmail = validator.isEmail(email);
      if (!isValidEmail) {
          messages.push(validationMessages.email);
      }
      // TODO: Уточнить требования к паролю
      const isValidPassword = validator.isLength(password, {min: 6, max: 20});
      if (!isValidPassword) {
          messages.push(validationMessages.password);
      }

      if (messages.length > 0) {
          response
              .status(400)
              .json({
                  status: 400,
                  message: messages
              })
              .end();
      }

      let user: Awaited<ReturnType<typeof authService["register"]>> = null;
      try {
          user = await authService.register({
              email,
              password
          });
          response.json(user);
      } catch(e: HttpException | any) {
          if (e instanceof  HttpException) {
              response
                  .status(e.status)
                  .json({
                      status: e.status,
                      message: e.message
                  })
          } else {
              response
                  .status(500)
                  .json({
                      status: 500,
                      message: e.message
                  })
          }
      }

    response.end();
  })

  router.post('/auth/refresh', async (request, response) => {
    const refreshToken = request.body.refreshToken;
    let jwtTokens: Awaited<ReturnType<typeof authService.refresh>> = null;
    try {
        jwtTokens = await authService.refresh({ refreshToken });
        response.json(jwtTokens);
    } catch(e: HttpException | any) {
        if (e instanceof  HttpException) {
            response
                .status(e.status)
                .json({
                    status: e.status,
                    message: e.message
                })
                .end();
        } else {
            response
                .status(500)
                .json({
                    status: 500,
                    message: e.message
                })
                .end();
        }
    }
    response.end();
  })

  return router;
}
