export type AiTokensUsage = {
	remaining: number;
	used: number;
	limit: number;
};

export type StorageUsage = {
	used: number;
	limit: number;
	maxMediaSize: number;
	maxImageSize: number;
};

export type ModelLimit = {
	limit: number | null;
	used: number | null;
	remaining: number | null;
	resetDate?: string;
};

export type AvailableModel = {
	id: string;
	name: string;
	displayName: string;
	isDefault: boolean;
	isEnabled: boolean;
	tokenCost: number;
	// limits: {
	// 	daily?: ModelLimit;
	// 	weekly?: ModelLimit;
	// 	monthly?: ModelLimit;
	// };
};

type Status = "pending_cancellation" | "active";
type PaymentType = "card" | "crypto";

export type UserPlan = {
	planId: string;
	name: string;
	monthlyTokenLimit: number;
	startDate: string;
	endDate: string;
	status: Status;
	version: number;
	isAnnual: boolean;
	allowTokenPurchase: boolean;
};

export type TokensLimits = {
	planTokensBalance: number;
	purchasedTokensBalance: number;
	totalTokensBalance: number;
	monthlyTokensLimit: number;
	nextResetDate: string;
	currentPeriodUsage: number;
	allowTokenPurchase: boolean;
};

export type UserLimits = {
	// tokens: AiTokensUsage;
	storage: StorageUsage;
	models: AvailableModel[];
	plan: UserPlan;
	tokens: TokensLimits;
};

export type Plan = {
	id: string;
	description: string;
	monthlyTokenLimit: number;
	name: string;
	price: string;
	annualPrice: number;
	resetPeriodDays: number;
	storageLimit: number;
	version: number;
};

export type CreateCheckoutPayload = {
	planId: string;
	successUrl: string;
	cancelUrl: string;
	annualPayment?: boolean;
};

export type CreateCryptoCheckoutPayload = {
	symbol: string;
	chain: string;
	sender: string;
	planId: string;
	annualPayment: boolean;
};

export type CryptoCheckout = {
	price: string;
	symbol: string;
	address: string;
};

export type CancelCryptoCheckoutPayload = {
	sender: string;
	to: string;
	value: string;
};

export type ConfirmCryptoCheckoutPayload = {
	symbol: string;
	chain: string;
	sender: string;
	planId: string;
	hash: string;
};

type CryptoRate = {
	annualPrice: string;
	price: string;
};

export type CryptoRates = {
	ETH: CryptoRate;
	POL: CryptoRate;
};

export type CheckoutUrl = { url: string };

export type HistoryRecord = {
	id: string;
	planId: string;
	planName: string;
	startDate: string;
	endDate: string;
	status: Status;
	canceledAt?: string | null;
	price: number;
	description: string;
	monthlyTokenLimit: number;
	storageLimit: number;
	isAnnual: boolean;
	symbol?: string;
	paymentType: PaymentType;
};

export type TokenPurchasePayload = {
	amount: number;
	paymentMethod: "stripe" | "crypto";
	successUrl?: string;
	cancelUrl?: string;
};

export type TokenPurchaseResponse = {
	paymentUrl?: string;
	paymentInfo?: any;
	purchaseId: string;
};
