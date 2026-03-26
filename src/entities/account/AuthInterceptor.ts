import type { Account } from "entities/account";
import type { HTTPRequestConfig } from "shared/api/base/types";

export function getAuthInterceptor(account: Account) {
  return async (config: HTTPRequestConfig): Promise<HTTPRequestConfig> => {
    if (!account.isLoggedIn) {
      return config;
    }

    if (account.isTokenExpired && !account.isTokenLoading) {
      await account.refreshTokens({ notifySessionExpiredOnFailure: true });
    }

    if (!account.accessToken) {
      return config;
    }

    config.headers = {
      Authorization: `Bearer ${account.accessToken}`,
      ...config.headers,
    };

    return config;
  };
}
