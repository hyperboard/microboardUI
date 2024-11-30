import { getApiUrlV2 } from "Config";
import { HTTP } from "shared/api/base/base";

export const apiV2 = new HTTP({
	baseURL: getApiUrlV2(),
	headers: {
		"Content-Type": "application/json",
	},
});
