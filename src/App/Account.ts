import { jwtDecode } from "jwt-decode";
import { authApi, usersApi } from "shared/api";
import { Subject } from "Subject";
import { Connection } from "./Connection";
import { Permissions } from "./Permissions";
import { Storage } from "./Storage";

type AccountInfo = {
	id: number;
	email: string;
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
	isTokenLoading = false;
	tokenData: TokenData | null = null;
	onSessionExpired: (() => void) | null = null;
	readonly permissions: Permissions;
	private _accessToken: string | null = null;
	private onLogout: (() => void) | null = null;
	private onLogin: (() => void) | null = null;

	constructor(storage: Storage, private readonly connection: Connection) {
		this.permissions = new Permissions(this, storage);
	}

	async init() {
		await this.refreshTokens();
		this.subject.publish(this.info);
	}

	private cleanup(): void {
		this._accessToken = null;
		this.tokenData = null;
		this.info = null;
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

	async fetchAccountInfo(): Promise<void> {
		const { data } = await usersApi.getMe();

		this.info = data;
		this.subject.publish(this.info);
	}

	async login(email: string, password: string): Promise<void> {
		const { data } = await authApi.login({ email, password });

		if (data?.accessToken) {
			this._accessToken = data.accessToken;
		}

		await this.fetchAccountInfo();
		this.onLogin?.();
	}

	register(email: string, password: string) {
		return authApi.register({ email, password });
	}

	async refreshTokens(): Promise<void> {
		try {
			this.isTokenLoading = true;
			const { data } = await authApi.refreshTokens();

			if (data?.accessToken) {
				this._accessToken = data.accessToken;
				// 	this.connection.publishAuth(data.accessToken);
			}

			this.updateTokenData();
			await this.fetchAccountInfo();
		} catch (error) {
			if (this.isLoggedIn) {
				this.cleanup();
				this.onSessionExpired?.();
			}
		} finally {
			this.isTokenLoading = false;
		}
	}

	async logout(): Promise<void> {
		await authApi.logout();
		this.cleanup();
		this.onLogout?.();
		this.subject.publish(null);
	}

	async verifyMail(email: string, passcode: string) {
		const { data } = await authApi.verifyMail({ email, passcode });

		this._accessToken = data?.accessToken ?? null;

		await this.fetchAccountInfo();
		this.onLogin?.();
		return data;
	}

	async resendMail(email: string): Promise<void> {
		await authApi.resendMail({ email });
	}

	async checkVerificationCodes(email: string) {
		await authApi.checkVerificationCodes({ email });
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

	setOnLogout(cb: () => void) {
		this.onLogout = cb;
	}

	setOnLogin(cb: () => void) {
		this.onLogin = cb;
	}
}
