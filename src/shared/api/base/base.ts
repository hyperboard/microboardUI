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

const RETRY_DELAY = 5_000;
const RETRY_ATTEMPTS = 3;

type AuthRecoveryResult = "retry" | "fail";
type AuthRecoveryHandler = (
  error: HTTPError,
  requestConfig: HTTPRequestConfig,
) => Promise<AuthRecoveryResult>;

type InternalRequestConfig<
  Q extends URLSearchParamsInit = URLSearchParamsInit,
  P extends ParamsRecord = ParamsRecord,
> = HTTPRequestConfig<Q, P> & {
  __authRecoveryAttempted?: boolean;
};

let authRecoveryHandler: AuthRecoveryHandler | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readErrorPayload(response: Response): Promise<{
  data: Record<string, unknown> | null;
  message: string;
}> {
  const fallbackMessage =
    response.statusText || `Request failed with status ${response.status}`;

  try {
    const data = (await response.clone().json()) as unknown;

    if (!isRecord(data)) {
      return {
        data: null,
        message: fallbackMessage,
      };
    }

    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : fallbackMessage;

    return {
      data,
      message,
    };
  } catch {
    return {
      data: null,
      message: fallbackMessage,
    };
  }
}

export function setAuthRecoveryHandler(handler: AuthRecoveryHandler | null) {
  authRecoveryHandler = handler;
}

export class HTTP {
  private baseURL: string;
  private readonly headers: Record<string, string>;
  private fetchCache = new Map<string, Promise<HTTPResponse<unknown>>>();
  readonly interceptors = new Interceptors();

  constructor(config: HTTPConfig) {
    this.baseURL = config.baseURL;
    this.headers = config.headers ?? {};
  }

  updateURL(customURL?: string) {
    if (window.MICROBOARD_FRONT_CONFIG.apiURL) {
      this.baseURL = window.MICROBOARD_FRONT_CONFIG.apiURL;
    }
    if (customURL) {
      this.baseURL = customURL;
      window.MICROBOARD_FRONT_CONFIG.apiURL = customURL;
    }
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
  >(
    path: string,
    config: InternalRequestConfig<Q, P>,
  ): Promise<HTTPResponse<R>> {
    const cacheKey = `${path}:${JSON.stringify(config)}`;

    if (this.fetchCache.has(cacheKey)) {
      return this.fetchCache.get(cacheKey) as Promise<HTTPResponse<R>>;
    }

    const fetchWithRetry = async (
      retries: number,
      currentConfig: InternalRequestConfig<Q, P>,
    ): Promise<HTTPResponse<R>> => {
      try {
        const modifiedConfig =
          await this.interceptors.triggerRequestInterceptors(currentConfig);
        const response = await fetch(
          this.getUrl(path, currentConfig.params, currentConfig.query),
          {
            ...modifiedConfig,
            headers: {
              ...this.headers,
              ...modifiedConfig.headers,
              ...currentConfig.headers,
              "x-client-language": window.MICROBOARD_CONFIG.i18n.language,
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          const { data, message } = await readErrorPayload(response);
          const error = new HTTPError(
            response.status,
            message,
            response,
            response.url,
            data,
          );

          if (
            response.status === 401 &&
            authRecoveryHandler &&
            !currentConfig.__authRecoveryAttempted
          ) {
            const recoveryResult = await authRecoveryHandler(
              error,
              currentConfig,
            );

            if (recoveryResult === "retry") {
              return fetchWithRetry(retries, {
                ...currentConfig,
                __authRecoveryAttempted: true,
              });
            }
          }

          throw error;
        }

        const customResponse = new HTTPResponse<R>(response);
        if (customResponse.status !== 204) {
          customResponse.data = await response.json();
        } else {
          customResponse.data = null;
        }

        this.interceptors.triggerResponseSuccessInterceptors(customResponse);

        return customResponse;
      } catch (error) {
        if (error instanceof HTTPError) {
          if (error.status >= 400 && error.status < 500) {
            // Immediately throw for 4xx errors
            throw error;
          }
        }
        if (retries > 0) {
          // Retry for 5xx errors and unexpected exceptions
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return fetchWithRetry(retries - 1, currentConfig);
        }
        this.interceptors.triggerResponseErrorInterceptors(error);
        throw error;
      } finally {
        this.fetchCache.delete(cacheKey);
      }
    };

    const fetchPromise = fetchWithRetry(RETRY_ATTEMPTS, config);
    this.fetchCache.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  get<
    R,
    Q extends URLSearchParamsInit = URLSearchParamsInit,
    P extends ParamsRecord = ParamsRecord,
  >(path: string, config?: HTTPRequestConfig<Q, P>): Promise<HTTPResponse<R>> {
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

  putRawExternal<R>(url: string, file: File): Promise<Response> {
    return fetch(url, {
      method: "PUT",
      body: file,
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
