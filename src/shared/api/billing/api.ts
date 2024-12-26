import { api } from "../base/base";
import type { BillingInfo } from "./types";

export function getUserPlanDetails() {
	return api.get<BillingInfo>("/billing/tokens");
}
