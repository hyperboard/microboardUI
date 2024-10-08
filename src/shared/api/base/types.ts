import type { URLSearchParamsInit } from "react-router-dom";

export type HTTPConfig = {
	baseURL: string;
	headers?: Record<string, string>;
};

export type HTTPRequestConfig<
	Q extends URLSearchParamsInit = URLSearchParamsInit,
	P extends ParamsRecord = ParamsRecord,
> = RequestInit & {
	params?: P;
	query?: Q;
};

export type ParamsRecord = Record<string, string | number>;

export type MutationRequestBody = Record<string, any>;
