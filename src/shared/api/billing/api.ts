import { api } from "../base/base";
import {
	CheckoutUrl,
	type CreateCheckoutPayload,
	type Plan,
	type UserLimits,
} from "./types";

export function getUserPlanDetails() {
	return api.get<UserLimits>("/billing/limits");
}

export function getPlans() {
	return api.get<Plan[]>("/billing/plans");
}

export function createCheckout(payload: CreateCheckoutPayload) {
	return api.post<CheckoutUrl>("/billing/create-checkout", payload);
}
