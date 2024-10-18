import type { HTTPRequestConfig } from "shared/api/base/types";
import { Account } from "./Account";

export function getAuthInterceptor(account: Account) {
	return async (config: HTTPRequestConfig): Promise<HTTPRequestConfig> => {
		if (!account.isLoggedIn) {
			return config;
		}

		if (account.isTokenExpired && !account.isTokenLoading) {
			await account.refreshTokens();
		}

		config.headers = {
			Authorization: `Bearer ${account.accessToken}`,
		};

		return config;
	};
}
