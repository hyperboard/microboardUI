import { jwtDecode } from "jwt-decode";
import { getEmailPrefix } from "shared/lib/getEmailPrefix";
import {
	authApi,
	billingApi,
	HTTPError,
	HTTPResponse,
	usersApi,
} from "shared/api";
import { Subject } from "shared/Subject";
import { SessionStorage } from "App/SessionStorage";
import { UniqueString } from "shared/api/auth";
import { MessageResponse } from "shared/api/types";
import { CryptoCheckout } from "shared/api/billing";
import { ethers } from "ethers";
import { Permissions } from "App/Permissions";
import type { Storage } from "App/Storage";
import type { Connection } from "App/Connection";

type AccountInfo = {
	id: number;
	email?: string;
	address?: string;
	name: string;
	avatar: string;
	avatarGenerated: boolean;
	newsletter: boolean;
};

type TokenData = {
	sub: string; // Subject (usually user id)
	exp: number; // Expiration time
	nbf?: number; // Not before
	iat: number; // Issued at
	jti: string; // JWT ID
	aud: string; // Audience
	iss: string; // Issuer
};

export class Account {
	subject = new Subject<AccountInfo | null>();
	info: null | AccountInfo = null;
	billingInfo: null | billingApi.UserLimits = null;
	billingHistory: billingApi.HistoryRecord[] = [];
	cryptoRates: billingApi.CryptoRates = {
		ETH: {
			price: "",
			annualPrice: "",
		},
		POL: {
			price: "",
			annualPrice: "",
		},
	};
	isTokenLoading = false;
	isInitialized = false;
	tokenData: TokenData | null = null;
	onSessionExpired: (() => void) | null = null;
	readonly permissions: Permissions;
	private _accessToken: string | null = null;
	private annualPayment = false;
	onLogout: (() => Promise<void>) | null = null;
	onLogin: (() => Promise<void>) | null = null;
	onInit: (() => Promise<void>) | null = null;

	constructor(
		private readonly storage: Storage,
		private readonly sessionStorage: SessionStorage,
		private readonly connection: Connection,
	) {
		this.permissions = new Permissions(this, this.storage);
	}

	async init(): Promise<void> {
		try {
			await this.refreshTokens();
			await this.onInit?.();
			this.isInitialized = true;
			this.subject.publish(this.info);
		} catch (err) {
			console.warn("Account initialization failed");
			this.isInitialized = true;
			this.subject.publish(this.info);
		}
	}

	private cleanup(): void {
		this._accessToken = null;
		this.tokenData = null;
		this.info = null;
		this.billingInfo = null;
		this.billingHistory = [];
		this.storage.clearUserId();
		this.sessionStorage.removeLastAIRequest();
	}

	get accessToken(): string | null {
		return this._accessToken;
	}

	get isLoggedIn(): boolean {
		return Boolean(this.accessToken);
	}

	get isTokenExpired(): boolean {
		return Number(this.tokenData?.exp) < Date.now() / 1000;
	}

	setOnSessionExpired(callback: () => void): void {
		this.onSessionExpired = callback;
	}

	setOnInit(callback: () => Promise<void>): void {
		this.onInit = callback;
	}

	updateTokenData(): void {
		if (!this.accessToken) {
			this.tokenData = null;
			return;
		}
		this.tokenData = jwtDecode<TokenData>(this.accessToken);
	}

	setIsAnnualPayment(isAnnual: boolean): void {
		this.annualPayment = isAnnual;
		this.subject.publish(this.info);
	}

	toggleIsAnnualPayment(): void {
		this.annualPayment = !this.annualPayment;
		this.subject.publish(this.info);
	}

	getIsAnnualPayment(): boolean {
		return this.annualPayment;
	}

	async fetchBillingInfo(): Promise<void> {
		try {
			const { data: billingInfo } = await billingApi.getUserPlanDetails();
			if (billingInfo) {
				this.billingInfo = billingInfo;
				this.setIsAnnualPayment(billingInfo.plan.isAnnual ?? false);
			}

			await this.fetchBillingHistory();
			await this.fetchCryptoRates();
		} catch {
			console.error("Error fetching billing user info");
		} finally {
			this.subject.publish(this.info);
		}
	}

	async unsubscribe(): Promise<void> {
		if (!this.isLoggedIn) {
			return;
		}

		await billingApi.unsubscribe();
		await this.fetchBillingInfo();
	}

	async fetchAccountInfo(): Promise<void> {
		const { data } = await usersApi.getMe();
		if (data?.id) {
			this.storage.setUserId(`${data?.id}`);
		} else {
			this.storage.clearUserId();
		}

		if (data) {
			this.info = {
				...data,
				name:
					data?.name ||
					getEmailPrefix(data?.email ?? "", "Anonymous"),
			};
		}

		await this.fetchBillingInfo();

		this.subject.publish(this.info);
	}

	async fetchBillingHistory(): Promise<void> {
		try {
			const { data } = await billingApi.getHistory();
			this.billingHistory = data ?? [];
		} catch {
			console.error("Error fetching billing user history");
		} finally {
			this.subject.publish(this.info);
		}
	}

	async fetchCryptoRates(): Promise<void> {
		try {
			const { data } = await billingApi.getApproxCryptoRates();
			if (!data) {
				throw new Error();
			}

			const ethAnnualPrice = ethers.formatEther(data.ETH.annualPrice);
			const ethPrice = ethers.formatEther(data.ETH.price);
			const polAnnualPrice = ethers.formatEther(data.POL.annualPrice);
			const polPrice = ethers.formatEther(data.POL.price);

			this.cryptoRates.ETH.annualPrice = ethAnnualPrice;
			this.cryptoRates.ETH.price = ethPrice;
			this.cryptoRates.POL.annualPrice = polAnnualPrice;
			this.cryptoRates.POL.price = polPrice;
		} catch {
			console.error("Error fetching crypto rates");
		} finally {
			this.subject.publish(this.info);
		}
	}

	async uploadAvatar(avatar: File): Promise<void> {
		await usersApi.uploadAvatar(avatar);
		await this.fetchAccountInfo();
	}

	async removeAvatar(): Promise<void> {
		await usersApi.removeAvatar();
		await this.fetchAccountInfo();
	}

	async login(email: string, password: string): Promise<void> {
		const { data } = await authApi.login({ email, password });

		if (data?.accessToken) {
			this._accessToken = data.accessToken;
		}

		await this.fetchAccountInfo();
		await this.onLogin?.();
	}

	register(
		email: string,
		password: string,
		name: string,
		newsletter: boolean,
	): Promise<HTTPResponse<usersApi.User>> {
		return authApi.register({ email, password, name, newsletter });
	}

	private refreshTokensPromise: Promise<void> | null = null;

	async refreshTokens(): Promise<void> {
		this.isTokenLoading = true;
		if (this.refreshTokensPromise) {
			return this.refreshTokensPromise;
		}

		this.refreshTokensPromise = (async () => {
			try {
				this.isTokenLoading = true;
				const { data } = await authApi.refreshTokens();

				if (data?.accessToken) {
					this._accessToken = data.accessToken;
					this.connection.publishAuth();
				}
				this.updateTokenData();
				await this.fetchAccountInfo();
			} catch (error) {
				if (
					this.isLoggedIn &&
					error instanceof HTTPError &&
					error.status === 401
				) {
					this.cleanup();
					this.onSessionExpired?.();
				}
			} finally {
				this.isTokenLoading = false;
				this.refreshTokensPromise = null;
			}
		})();

		return this.refreshTokensPromise;
	}

	async logout(): Promise<void> {
		await authApi.logout();
		this.cleanup();
		await this.onLogout?.();
		this.subject.publish(null);
	}

	verifyMail = async (
		email: string,
		passcode: string,
	): Promise<authApi.Tokens | null> => {
		const { data } = await authApi.verifyMail({ email, passcode });

		this._accessToken = data?.accessToken ?? null;

		return data;
	};

	async resendMail(email: string): Promise<HTTPResponse<MessageResponse>> {
		return await authApi.resendMail({ email });
	}

	async checkVerificationCodes(
		email: string,
	): Promise<MessageResponse | null> {
		const { data } = await authApi.checkVerificationCodes({ email });
		return data;
	}

	async getNonce(address: UniqueString): Promise<string | undefined> {
		const { data } = await authApi.getNonce({ address });
		return data?.message;
	}

	async verifySignature(
		address: UniqueString,
		signature: UniqueString,
	): Promise<void> {
		const { data } = await authApi.verifySignature({ address, signature });

		if (data?.accessToken) {
			this._accessToken = data.accessToken;
		}

		await this.fetchAccountInfo();
		await this.onLogin?.();
	}

	async addEmail(email: string): Promise<string> {
		const { data } = await authApi.requestAddEmail({ email });
		return data?.email || "";
	}

	async verifyAddedEmail(email: string, passcode: string): Promise<void> {
		await authApi.addEmail({ email, passcode });
	}

	async changePassword(
		oldPassword: string,
		newPassword: string,
	): Promise<void> {
		await authApi.changePassword({ newPassword, oldPassword });
	}

	async forgotPassword(email: string): Promise<void> {
		await authApi.forgotPassword({ email });
	}

	async restorePassword(token: string, newPassword: string): Promise<void> {
		await authApi.restorePassword({ token, newPassword });
	}

	async changeInfo(
		payload: usersApi.UpdateUserPayload,
		signal: AbortSignal,
	): Promise<void> {
		await usersApi.updateMe(payload, signal);
		await this.fetchAccountInfo();
	}

	async changeNewsletter(
		payload: usersApi.UpdateUserNewsletter,
		signal: AbortSignal,
	): Promise<void> {
		await usersApi.updateNewsletter(payload, signal);
		await this.fetchAccountInfo();
	}

	async createCheckout(planId: string): Promise<void> {
		const successUrl = `${window.location.href}?paymentStatus=success`;
		const cancelUrl = `${window.location.href}?paymentStatus=error`;

		const { data } = await billingApi.createCheckout({
			planId,
			successUrl,
			cancelUrl,
			annualPayment: this.annualPayment,
		});

		if (!data) {
			throw new Error();
		}
		const linkElem = document.createElement("a");
		linkElem.href = data?.url;
		linkElem.target = "_blank";
		linkElem.click();
	}

	async createCryptoCheckout(
		currency: string,
		chain: string,
		sender: string,
		planId: string,
	): Promise<CryptoCheckout> {
		const { data } = await billingApi.createCryptoCheckout({
			symbol: currency,
			chain: chain,
			sender: sender,
			planId: planId,
			annualPayment: this.annualPayment,
		});

		if (!data) {
			throw new Error("Failed to create crypto checkout");
		}

		return data;
	}

	async purchaseTokens(
		amount: number,
		paymentMethod: "stripe" | "crypto",
		successUrl?: string,
		cancelUrl?: string,
	): Promise<billingApi.TokenPurchaseResponse> {
		const payload: billingApi.TokenPurchasePayload = {
			amount,
			paymentMethod,
		};

		if (successUrl) {
			payload.successUrl = successUrl;
		}

		if (cancelUrl) {
			payload.cancelUrl = cancelUrl;
		}

		const { data } = await billingApi.purchaseTokens(payload);

		if (!data) {
			throw new Error("Failed to purchase tokens");
		}

		return data;
	}

	setOnLogout(cb: () => Promise<void>): void {
		this.onLogout = cb;
	}

	setOnLogin(cb: () => Promise<void>): void {
		this.onLogin = cb;
	}
}
