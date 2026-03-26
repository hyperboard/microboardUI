import type { Connection } from "App/Connection";
import { Permissions } from "App/Permissions";
import { SessionStorage } from "App/SessionStorage";
import type { Storage } from "App/Storage";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";
import { authApi, billingApi, HTTPResponse, usersApi } from "shared/api";
import { UniqueString } from "shared/api/auth";
import { CryptoCheckout } from "shared/api/billing";
import { MessageResponse } from "shared/api/types";
import { getEmailPrefix } from "shared/lib/getEmailPrefix";
import { Subject } from "shared/Subject";
import {
  isTerminalRefreshFailureError,
  isInvalidAccessTokenError,
} from "./authRecovery";

export enum UserRoles {
  ADMIN = "ADMIN",
  USER = "USER",
}

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
  role?: UserRoles;
};

type AccountEvent = "logout";

type ChannelMsg = {
  event: AccountEvent;
  account: AccountInfo | null;
};

type RefreshTokensOptions = {
  notifySessionExpiredOnFailure?: boolean;
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
  private storageLimitNotificationShown = false;
  onLogout: (() => Promise<void>) | null = null;
  onLogin: (() => Promise<void>) | null = null;
  onInit: (() => Promise<void>) | null = null;
  broadcastChannel = new BroadcastChannel("account");
  private refreshFailureShouldNotify = false;
  private sessionExpiredHandled = false;

  constructor(
    private readonly storage: Storage,
    private readonly sessionStorage: SessionStorage,
    private readonly connection: Connection,
  ) {
    this.permissions = new Permissions(this, this.storage);
    this.setupBroadcastChannel();
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
    this.subject.publish(this.info);
  }

  private hasAuthenticatedSession(): boolean {
    return Boolean(this._accessToken || this.info);
  }

  private markSessionActive(): void {
    this.sessionExpiredHandled = false;
  }

  private clearAuthenticatedSession(
    notifySessionExpired: boolean,
    hadAuthenticatedSession = this.hasAuthenticatedSession(),
  ): void {
    this.cleanup();
    this.connection.publishLogout();

    if (notifySessionExpired && hadAuthenticatedSession) {
      this.notifySessionExpired();
    }
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

  notifySessionExpired(): void {
    if (this.sessionExpiredHandled) {
      return;
    }

    this.sessionExpiredHandled = true;
    this.onSessionExpired?.();
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
    if (!this.isLoggedIn) {
      return;
    }

    try {
      const { data: billingInfo } = await billingApi.getUserPlanDetails();
      if (billingInfo) {
        this.billingInfo = billingInfo;
        this.setIsAnnualPayment(billingInfo.plan.isAnnual ?? false);
        if (
          !this.storageLimitNotificationShown &&
          billingInfo.storage.used / billingInfo.storage.limit >= 0.8
        ) {
          this.storageLimitNotificationShown = true;
          window.MICROBOARD_CONFIG.notify({
            variant: "warning",
            header: window.MICROBOARD_CONFIG.i18n.t(
              "toolsPanel.addMedia.limitAlmostReached.header",
            ),
            body: window.MICROBOARD_CONFIG.i18n.t(
              `toolsPanel.addMedia.limitAlmostReached.body.${billingInfo.plan.name}` as never,
            ),
            button:
              billingInfo.plan.name === "basic"
                ? {
                    text: window.MICROBOARD_CONFIG.i18n.t(
                      "toolsPanel.addMedia.upgradeToPlus",
                    ),
                    onClick: () =>
                      window.MICROBOARD_CONFIG.openModal("USER_PLAN_MODAL_ID"),
                  }
                : undefined,
            duration: 300_000,
          });
        }
      }

      await this.fetchBillingHistory();
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
        name: data?.name || getEmailPrefix(data?.email ?? "", "Anonymous"),
      };
    }

    // await this.fetchBillingInfo();

    this.subject.publish(this.info);
  }

  // async checkMediaStorageSpace(): Promise<boolean> {
  // 	await this.fetchBillingInfo();
  // 	if (
  // 		this.billingInfo?.storage?.used !== undefined &&
  // 		this.billingInfo?.storage?.limit !== undefined &&
  // 		this.billingInfo.storage.used >=
  // 		this.billingInfo.storage.limit
  // 	) {
  // 		notify({
  // 			variant: "warning",
  // 			header: window.MICROBOARD_CONFIG.i18n.t("toolsPanel.addMedia.limitReached.header"),
  // 			body: window.MICROBOARD_CONFIG.i18n.t("toolsPanel.addMedia.limitReached.body",
  // 				{
  // 					limit: this.billingInfo.plan.name === "basic" ?
  // 						this.billingInfo.storage.limit + " " + window.MICROBOARD_CONFIG.i18n.t("common.MB") :
  // 						this.billingInfo.storage.limit / 1024  + " " + window.MICROBOARD_CONFIG.i18n.t("common.GB")
  // 				}
  // 			),
  // 			duration: 10000,
  // 		});
  // 		return false;
  // 	}
  // 	return true;
  // }

  async fetchBillingHistory(): Promise<void> {
    if (!this.isLoggedIn) {
      return;
    }

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
    if (!this.isLoggedIn) {
      return;
    }

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
      this.updateTokenData();
      this.markSessionActive();
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

  async refreshTokens(options: RefreshTokensOptions = {}): Promise<void> {
    if (options.notifySessionExpiredOnFailure) {
      this.refreshFailureShouldNotify = true;
    }

    if (this.refreshTokensPromise) {
      return this.refreshTokensPromise;
    }

    const hadAuthenticatedSession = this.hasAuthenticatedSession();
    this.isTokenLoading = true;
    this.refreshTokensPromise = (async () => {
      try {
        const { data } = await authApi.refreshTokens();

        if (data?.accessToken) {
          this._accessToken = data.accessToken;
          this.updateTokenData();
          this.markSessionActive();
          this.connection.publishAuth();
        }
        await this.fetchAccountInfo();
      } catch (error) {
        if (isTerminalRefreshFailureError(error)) {
          console.warn(
            "Terminal refresh failure, clearing authenticated session",
          );
          this.clearAuthenticatedSession(
            hadAuthenticatedSession && this.refreshFailureShouldNotify,
            hadAuthenticatedSession,
          );
        }

        throw error;
      } finally {
        this.isTokenLoading = false;
        this.refreshTokensPromise = null;
        this.refreshFailureShouldNotify = false;
      }
    })();

    return this.refreshTokensPromise;
  }

  async recoverFromInvalidAccessToken(
    options: RefreshTokensOptions = {},
  ): Promise<boolean> {
    if (!this.isLoggedIn || !this.accessToken) {
      return false;
    }

    try {
      await this.refreshTokens(options);
      return Boolean(this.accessToken);
    } catch (error) {
      if (
        !isInvalidAccessTokenError(error) &&
        !isTerminalRefreshFailureError(error)
      ) {
        console.error("Failed to recover from invalid access token", error);
      }

      return false;
    }
  }

  async logout(): Promise<void> {
    await authApi.logout();
    this.postMsg("logout");
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
    this.updateTokenData();
    this.markSessionActive();
    this.subject.publish(this.info);

    return data;
  };

  async resendMail(email: string): Promise<HTTPResponse<MessageResponse>> {
    return await authApi.resendMail({ email });
  }

  async checkVerificationCodes(email: string): Promise<MessageResponse | null> {
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
      this.updateTokenData();
      this.markSessionActive();
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

  postMsg(evt: AccountEvent) {
    this.broadcastChannel.postMessage(
      JSON.stringify({
        event: evt,
        account: this.info,
      } as ChannelMsg),
    );
  }

  handleBroadcastEvent = async (msg: ChannelMsg) => {
    switch (msg.event) {
      case "logout": {
        if (msg.account?.id === this.info?.id) {
          await this.logout();
        }
        break;
      }
    }
  };

  setupBroadcastChannel() {
    this.broadcastChannel.addEventListener("message", (evt) => {
      this.handleBroadcastEvent(JSON.parse(evt.data));
    });
  }
}
