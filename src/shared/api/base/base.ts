import { getApiUrl } from "Config";
import { createSearchParams, type URLSearchParamsInit } from "react-router-dom";
import { HTTPError } from "./httpError";
import { HTTPResponse } from "./httpResponse";
import { Interceptors } from "./interceptors";
import type {
	HTTPConfig,
	HTTPRequestConfig,
	MutationRequestBody,
	ParamsRecord,
} from "./types";
import i18n from "Lang";

export class HTTP {
	private readonly baseURL: string;
	private readonly headers: Record<string, string>;
	private fetchCache = new Map<string, Promise<HTTPResponse<unknown>>>();
	readonly interceptors = new Interceptors();

	constructor(config: HTTPConfig) {
		this.baseURL = config.baseURL;
		this.headers = config.headers ?? {};
	}

	private getQuery(query?: URLSearchParamsInit): string {
		return createSearchParams(query).toString();
	}

	private replacePathParams(path: string, params?: ParamsRecord): string {
		if (!params) {
			return path;
		}

		return path.replace(/:(\w+)/g, (_, key) => {
			if (params[key]) {
				return String(params[key]);
			}

			return key;
		});
	}
	getUrl(
		path = "",
		params?: ParamsRecord,
		query?: URLSearchParamsInit,
	): string {
		const queryString = this.getQuery(query);
		return `${this.baseURL}${this.replacePathParams(
			path,
			params,
		)}${queryString ? `?${queryString}` : ""}`;
	}

	private async $fetch<
		R,
		Q extends URLSearchParamsInit = URLSearchParamsInit,
		P extends ParamsRecord = ParamsRecord,
	>(path: string, config: HTTPRequestConfig<Q, P>): Promise<HTTPResponse<R>> {
		const cacheKey = `${path}:${JSON.stringify(config)}`;

		if (this.fetchCache.has(cacheKey)) {
			return this.fetchCache.get(cacheKey) as Promise<HTTPResponse<R>>;
		}

		const fetchPromise = (async () => {
			try {
				const modifiedConfig =
					await this.interceptors.triggerRequestInterceptors(config);
				const response = await fetch(
					this.getUrl(path, config.params, config.query),
					{
						...modifiedConfig,
						headers: {
							...this.headers,
							...modifiedConfig.headers,
							...config.headers,
							"x-client-language": i18n.language,
						},
						credentials: "include",
					},
				);

				if (!response.ok) {
					const message = await response.json();
					throw new HTTPError(
						response.status,
						message.message,
						response,
						response.url,
					);
				}

				const customResponse = new HTTPResponse<R>(response);
				if (customResponse.status !== 204) {
					customResponse.data = await response.json();
				} else {
					customResponse.data = null;
				}

				this.interceptors.triggerResponseSuccessInterceptors(
					customResponse,
				);

				return customResponse;
			} catch (error) {
				this.interceptors.triggerResponseErrorInterceptors(error);
				throw error;
			} finally {
				this.fetchCache.delete(cacheKey);
			}
		})();

		this.fetchCache.set(cacheKey, fetchPromise);
		return fetchPromise;
	}

	get<
		R,
		Q extends URLSearchParamsInit = URLSearchParamsInit,
		P extends ParamsRecord = ParamsRecord,
	>(
		path: string,
		config?: HTTPRequestConfig<Q, P>,
	): Promise<HTTPResponse<R>> {
		return this.$fetch<R>(path, {
			method: "GET",
			...config,
		});
	}

	post<
		R,
		B extends MutationRequestBody = MutationRequestBody,
		P extends ParamsRecord = ParamsRecord,
	>(
		path: string,
		body?: B,
		config?: HTTPRequestConfig<URLSearchParamsInit, P>,
	): Promise<HTTPResponse<R>> {
		const stringifiedBody = JSON.stringify(body);

		return this.$fetch<R>(path, {
			method: "POST",
			body: stringifiedBody,
			...config,
		});
	}

	patch<
		R,
		B extends MutationRequestBody = MutationRequestBody,
		P extends ParamsRecord = ParamsRecord,
	>(
		path: string,
		body?: B,
		config?: HTTPRequestConfig<URLSearchParamsInit, P>,
	): Promise<HTTPResponse<R>> {
		const stringifiedBody = JSON.stringify(body);
		return this.$fetch<R>(path, {
			method: "PATCH",
			body: stringifiedBody,
			...config,
		});
	}

	patchRaw<R, P extends ParamsRecord = ParamsRecord>(
		path: string,
		file: File,
		config?: HTTPRequestConfig<URLSearchParamsInit, P>,
	): Promise<HTTPResponse<R>> {
		return this.$fetch<R>(path, {
			method: "PATCH",
			body: file,
			...config,
			headers: {
				"Content-Type": file.type,
			},
		});
	}

	put<
		R,
		B extends MutationRequestBody = MutationRequestBody,
		P extends ParamsRecord = ParamsRecord,
	>(
		path: string,
		body?: B,
		config?: HTTPRequestConfig<URLSearchParamsInit, P>,
	): Promise<HTTPResponse<R>> {
		const stringifiedBody = JSON.stringify(body);

		return this.$fetch<R>(path, {
			method: "PUT",
			body: stringifiedBody,
			...config,
		});
	}

	delete<
		R,
		Q extends URLSearchParamsInit = URLSearchParamsInit,
		P extends ParamsRecord = ParamsRecord,
		B extends MutationRequestBody = MutationRequestBody,
	>(
		path: string,
		config?: HTTPRequestConfig<Q, P>,
		body?: B,
	): Promise<HTTPResponse<R>> {
		const stringifiedBody = JSON.stringify(body);

		return this.$fetch<R>(path, {
			method: "DELETE",
			...config,
			body: stringifiedBody,
		});
	}
}

export const api = new HTTP({
	baseURL: getApiUrl(),
	headers: {
		"Content-Type": "application/json",
	},
});
