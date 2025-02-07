import { api } from "../base/base";
import type { MessageResponse } from "../types";
import {
	CheckoutUrl,
	type CreateCheckoutPayload,
	type HistoryRecord,
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

export function unsubscribe() {
	return api.delete<MessageResponse>("/billing/subscriptions");
}

export function verifyPayment() {
	return api.get<MessageResponse>("/billing/sync-after-success");
}

export function getHistory() {
	return api.get<HistoryRecord[]>("/billing/history");
}
