import { getApiUrl } from "../Config";

export function asyncPost(path: string, data?: object): Promise<Response> {
	return fetch(`${getApiUrl()}${path}`, {
		method: "POST",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		redirect: "follow",
		referrerPolicy: "no-referrer",
		body: JSON.stringify(data),
	});
}

export function asyncGet(path: string): Promise<Response> {
	return fetch(`${getApiUrl()}${path}`, {
		method: "GET",
		mode: "cors",
		cache: "no-cache",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
		},
		redirect: "follow",
		referrerPolicy: "no-referrer",
	});
}
