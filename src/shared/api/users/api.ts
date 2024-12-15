import { api } from "../base/base";
import type { UpdateUserPayload, User } from "./types";

export function getMe() {
	return api.get<User>("/users/me");
}

export function getUsers(search?: string, limit = 20) {
	return api.get<User[]>("/users", {
		query: search
			? new URLSearchParams({ search, limit: limit.toString() })
			: undefined,
	});
}

export function updateMe(payload: UpdateUserPayload, signal?: AbortSignal) {
	return api.patch("/users/me", payload, {
		signal,
	});
}

export function uploadAvatar(avatar: File) {
	return api.patchRaw("/users/me/avatar", avatar);
}

export function removeAvatar() {
	return api.delete("/users/me/avatar");
}
