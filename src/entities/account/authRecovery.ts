import { HTTPError } from "shared/api";

export const AUTH_INVALID_ACCESS_TOKEN = "AUTH_INVALID_ACCESS_TOKEN";
export const AUTH_MISSING_ACCESS_TOKEN = "AUTH_MISSING_ACCESS_TOKEN";

const TERMINAL_REFRESH_FAILURE_CODES = new Set([
  "AUTH_REFRESH_COOKIE_MISSING",
  "AUTH_REFRESH_TOKEN_INVALID",
  "AUTH_REFRESH_TOKEN_REVOKED",
  "AUTH_REFRESH_TOKEN_MISMATCH",
  "AUTH_REFRESH_FAILED",
]);

export function isTerminalRefreshFailureCode(
  code: string | undefined,
): boolean {
  return Boolean(code && TERMINAL_REFRESH_FAILURE_CODES.has(code));
}

export function hasInvalidTokenChallenge(headers: Headers): boolean {
  const challenge = headers.get("WWW-Authenticate");
  return typeof challenge === "string" && /\binvalid_token\b/i.test(challenge);
}

export function isInvalidAccessTokenCode(code: string | undefined): boolean {
  return code === AUTH_INVALID_ACCESS_TOKEN;
}

export function isInvalidAccessTokenError(error: unknown): boolean {
  if (!(error instanceof HTTPError)) {
    return false;
  }

  return (
    isInvalidAccessTokenCode(error.code) ||
    (error.status === 401 && hasInvalidTokenChallenge(error.response.headers))
  );
}

export function isTerminalRefreshFailureError(error: unknown): boolean {
  return (
    error instanceof HTTPError &&
    error.status === 401 &&
    isTerminalRefreshFailureCode(error.code)
  );
}
