import { api } from "../base/base";
import type { User } from "./types";

export function getMe() {
	return api.get<User>("/users/me");
}

export function getUsers(search?: string) {
	return api.get<User[]>("/users", {
		query: search ? new URLSearchParams({ search }) : undefined,
	});
}
