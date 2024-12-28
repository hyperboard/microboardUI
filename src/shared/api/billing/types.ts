export type AiTokensUsage = {
	remaining: number;
	used: number;
	limit: number;
};

export type StorageUsage = {
	used: number;
	limit: number;
};

export type AvailableModel = {
	id: string;
	name: string;
	displayName: string;
	isDefault: boolean;
	isEnabled: boolean;
	limits: {
		daily: null | number;
		weekly: null | number;
		dailyUsed: number;
		weeklyUsed: number;
	};
};

export type UserPlan = {
	name: string;
	periodStart: string;
	periodEnd: string;
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
	resetPeriodDays: number;
	storageLimit: number;
	version: number;
};

export type CreateCheckoutPayload = {
	planId: string;
	successUrl: string;
	cancelUrl: string;
};

export type CheckoutUrl = { url: string };
