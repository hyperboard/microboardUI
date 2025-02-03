export type AiTokensUsage = {
	remaining: number;
	used: number;
	limit: number;
};

export type StorageUsage = {
	used: number;
	limit: number;
};

export type ModelLimit = {
	limit: number | null;
	used: number | null;
	remaining: number | null;
	resetDate: string;
};

export type AvailableModel = {
	id: string;
	name: string;
	displayName: string;
	isDefault: boolean;
	isEnabled: boolean;
	limits: {
		daily: ModelLimit;
		weekly: ModelLimit;
	};
};

export type UserPlan = {
	name: string;
	periodStart: string;
	periodEnd: string;
	status: "pending_cancellation" | "active";
};

export type UserLimits = {
	tokens: AiTokensUsage;
	storage: StorageUsage;
	models: AvailableModel[];
	plan: UserPlan;
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

export type CheckoutUrl = { url: string };
