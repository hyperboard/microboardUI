import type { Account } from "./Account";
import { Storage } from "./Storage";

export type Action = "owns" | "edits" | "reads";
export type Resource = "boards" | "catalogs" | "groups";

export class Permissions {
	constructor(
		private readonly account: Account,
		private readonly storage: Storage,
	) {}

	checkPermissions(
		action: Action,
		resource: Resource,
		resourceId: string | null,
	): boolean {
		if (resourceId === null) {
			return false;
		}
		if (
			action === "owns" &&
			!this.account.isLoggedIn &&
			resource === "boards"
		) {
			const targetBoard = this.storage.getCreatedBoard(resourceId);
			return Boolean(targetBoard);
		}

		if (
			!this.account.isLoggedIn ||
			!this.account.tokenData ||
			!this.account.tokenData[action]?.[resource]
		) {
			return false;
		}

		return (
			this.account.tokenData[action]?.[resource]?.includes(resourceId) ??
			false
		);
	}
}
