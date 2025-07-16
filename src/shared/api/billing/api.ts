import { api } from "../base/base";
import { HTTPResponse } from "../base/httpResponse";
import type { MessageResponse } from "../types";
import {
  CancelCryptoCheckoutPayload,
  CheckoutUrl,
  ConfirmCryptoCheckoutPayload,
  CreateCryptoCheckoutPayload,
  CryptoCheckout,
  CryptoRates,
  type CreateCheckoutPayload,
  type HistoryRecord,
  type Plan,
  type UserLimits,
  type TokenPurchasePayload,
  type TokenPurchaseResponse,
} from "./types";

const CRYPTO_CHECKOUT_BASE_URL = "/crypto/checkout";

export function getUserPlanDetails(): Promise<HTTPResponse<UserLimits>> {
  return api.get<UserLimits>("/billing/limits");
}

export function getPlans(): Promise<HTTPResponse<Plan[]>> {
  return api.get<Plan[]>("/billing/plans");
}

export function createCheckout(
  payload: CreateCheckoutPayload,
): Promise<HTTPResponse<CheckoutUrl>> {
  return api.post<CheckoutUrl>("/billing/create-checkout", payload);
}

export function createCryptoCheckout(
  payload: CreateCryptoCheckoutPayload,
): Promise<HTTPResponse<CryptoCheckout>> {
  return api.post<CryptoCheckout>(CRYPTO_CHECKOUT_BASE_URL, payload);
}

export async function cancelCryptoCheckout(
  payload: CancelCryptoCheckoutPayload,
): Promise<HTTPResponse<MessageResponse>> {
  return await api.delete<MessageResponse>(
    CRYPTO_CHECKOUT_BASE_URL,
    undefined,
    payload,
  );
}

export async function confirmCryptoCheckout(
  payload: ConfirmCryptoCheckoutPayload,
): Promise<HTTPResponse<MessageResponse>> {
  return await api.patch<MessageResponse>(CRYPTO_CHECKOUT_BASE_URL, payload);
}

export async function getApproxCryptoRates(): Promise<
  HTTPResponse<CryptoRates>
> {
  return await api.get<CryptoRates>("/crypto/rates");
}

export function unsubscribe(): Promise<HTTPResponse<MessageResponse>> {
  return api.delete<MessageResponse>("/billing/subscriptions");
}

export function verifyPayment(): Promise<HTTPResponse<MessageResponse>> {
  return api.get<MessageResponse>("/billing/sync-after-success");
}

export function getHistory(): Promise<HTTPResponse<HistoryRecord[]>> {
  return api.get<HistoryRecord[]>("/billing/history");
}

export function purchaseTokens(
  payload: TokenPurchasePayload,
): Promise<HTTPResponse<TokenPurchaseResponse>> {
  return api.post<TokenPurchaseResponse>("/billing/purchase-tokens", payload);
}
