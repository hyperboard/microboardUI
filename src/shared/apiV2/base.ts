import { getApiUrl } from "Config";
import { HTTP } from "shared/api/base/base";

export const apiV2 = new HTTP({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});
