import { api } from "../base/base";
import type { MessageResponse } from "../types";
import type { User } from "../users";
import type {
	ChangePasswordPayload,
	CheckVerificationCodesPayload,
	ForgotPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResendMailPayload,
	RestorePasswordPayload,
	Tokens,
	VerifyMailPayload,
} from "./types";

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

export function changePassword(body: ChangePasswordPayload) {
	return api.patch<MessageResponse>("/auth/password/change", body);
}

export function login(body: LoginPayload) {
	return api.post<Tokens>("/auth/login", body);
}

export function refreshTokens() {
	return api.post<Tokens>("/auth/refresh");
}

export function register(body: RegisterPayload) {
	return api.post<User>("/auth/register", body);
}

export function logout() {
	return api.put<MessageResponse>("/auth/logout");
}

export function verifyMail(body: VerifyMailPayload) {
	return api.post<Tokens>("/auth/verify", body);
}

export function resendMail(body: ResendMailPayload) {
	return api.post<MessageResponse>("/auth/resendEmail", body);
}

export function checkVerificationCodes(body: CheckVerificationCodesPayload) {
	return api.post<MessageResponse>("/auth/checkVerificationCodes", body);
}

export function forgotPassword(body: ForgotPasswordPayload) {
	return api.post<MessageResponse>("/auth/password/restore/request", body);
}

export function restorePassword(body: RestorePasswordPayload) {
	return api.post<MessageResponse>("/auth/password/restore", body);
}
