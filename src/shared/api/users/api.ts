import { api } from "../base/base";
import type { User } from "./types";

export function getMe() {
	return api.get<User>("/users/me");
}
