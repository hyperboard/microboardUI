import { jwtDecode } from "jwt-decode";
import { getEmailPrefix } from "lib/getEmailPrefix";
import { authApi, billingApi, usersApi } from "shared/api";
import { Subject } from "Subject";
import { Connection } from "./Connection";
import { Permissions } from "./Permissions";
import { Storage } from "./Storage";

type AccountInfo = {
	id: number;
	email: string;
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
	isTokenLoading = false;
	isInitialized = false;
	tokenData: TokenData | null = null;
	onSessionExpired: (() => void) | null = null;
	readonly permissions: Permissions;
	private _accessToken: string | null = null;
	onLogout: (() => Promise<void>) | null = null;
	onLogin: (() => Promise<void>) | null = null;

	constructor(
		private readonly storage: Storage,
		private readonly connection: Connection,
	) {
		this.permissions = new Permissions(this, this.storage);
	}

	async init() {
		await this.refreshTokens();
		this.isInitialized = true;
		this.subject.publish(this.info);
	}

	private cleanup(): void {
		this._accessToken = null;
		this.tokenData = null;
		this.info = null;
		this.storage.clearUserId();
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

	updateTokenData(): void {
		if (!this.accessToken) {
			this.tokenData = null;
			return;
		}
		this.tokenData = jwtDecode<TokenData>(this.accessToken);
	}

	async fetchBillingInfo(): Promise<void> {
		try {
			const { data: billingInfo } = await billingApi.getUserPlanDetails();
			if (billingInfo) {
				this.billingInfo = billingInfo;
			}
		} catch {
			console.error("Error fetching billing user info");
		} finally {
			this.subject.publish(this.info);
		}
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

	async uploadAvatar(avatar: File) {
		await usersApi.uploadAvatar(avatar);
		await this.fetchAccountInfo();
	}

	async removeAvatar() {
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
	) {
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
				this.storage.softClean();
				this.updateTokenData();
				await this.fetchAccountInfo();
			} catch (error) {
				if (this.isLoggedIn) {
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

	async verifyMail(email: string, passcode: string) {
		const { data } = await authApi.verifyMail({ email, passcode });

		this._accessToken = data?.accessToken ?? null;

		return data;
	}

	async resendMail(email: string) {
		return await authApi.resendMail({ email });
	}

	async checkVerificationCodes(email: string) {
		const { data } = await authApi.checkVerificationCodes({ email });
		return data;
	}

	async changePassword(oldPassword: string, newPassword: string) {
		await authApi.changePassword({ newPassword, oldPassword });
	}

	async forgotPassword(email: string) {
		await authApi.forgotPassword({ email });
	}

	async restorePassword(token: string, newPassword: string) {
		await authApi.restorePassword({ token, newPassword });
	}

	async changeInfo(payload: usersApi.UpdateUserPayload, signal: AbortSignal) {
		await usersApi.updateMe(payload, signal);
		await this.fetchAccountInfo();
	}

	async changeNewsletter(
		payload: usersApi.UpdateUserNewsletter,
		signal: AbortSignal,
	) {
		await usersApi.updateNewsletter(payload, signal);
		await this.fetchAccountInfo();
	}

	setOnLogout(cb: () => Promise<void>) {
		this.onLogout = cb;
	}

	setOnLogin(cb: () => Promise<void>) {
		this.onLogin = cb;
	}
}
