import type { HTTPError } from "./httpError";
import type { HTTPResponse } from "./httpResponse";
import type { HTTPRequestConfig } from "./types";

type RequestInterceptor = (
  config: HTTPRequestConfig,
) => HTTPRequestConfig | Promise<HTTPRequestConfig>;
type ResponseSuccessInterceptor = (response: HTTPResponse<unknown>) => void;
type ResponseErrorInterceptor = (error: HTTPError | unknown) => void;

export class Interceptors {
  requestInterceptors: Set<RequestInterceptor> = new Set();
  responseSuccessInterceptors: Set<ResponseSuccessInterceptor> = new Set();
  responseErrorInterceptors: Set<ResponseErrorInterceptor> = new Set();

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.add(interceptor);
  }

  addResponseSuccessInterceptor(interceptor: ResponseSuccessInterceptor) {
    this.responseSuccessInterceptors.add(interceptor);
  }

  addResponseErrorInterceptor(interceptor: ResponseErrorInterceptor) {
    this.responseErrorInterceptors.add(interceptor);
  }

  removeRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.delete(interceptor);
  }

  removeResponseSuccessInterceptor(interceptor: ResponseSuccessInterceptor) {
    this.responseSuccessInterceptors.delete(interceptor);
  }

  removeResponseErrorInterceptor(interceptor: ResponseErrorInterceptor) {
    this.responseErrorInterceptors.delete(interceptor);
  }

  async triggerRequestInterceptors(
    config: HTTPRequestConfig,
  ): Promise<HTTPRequestConfig> {
    const configs = await Promise.all(
      Array.from(this.requestInterceptors).map((interceptor) =>
        interceptor(config),
      ),
    );
    return configs.reduce((acc, cfg) => ({ ...acc, ...cfg }), {
      ...config,
    });
  }

  triggerResponseSuccessInterceptors(response: HTTPResponse<unknown>) {
    this.responseSuccessInterceptors.forEach((interceptor) =>
      interceptor(response),
    );
  }

  triggerResponseErrorInterceptors(error: HTTPError | unknown) {
    this.responseErrorInterceptors.forEach((interceptor) => interceptor(error));
  }
}
