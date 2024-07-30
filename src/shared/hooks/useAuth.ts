import { useState, useEffect, useLayoutEffect } from "react";
import { App } from "App";
import Cookies from "js-cookie";
import { getApiUrl } from "Config";

interface UseAuth {
	isAuth: boolean;
	setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
	email: string;
}

export const useAuth = (app: App): UseAuth => {
	const [isAuth, setIsAuth] = useState(false);
	const [email, setEmail] = useState("example@mail.com");

	useEffect(() => {
		app.storage.setIsAuth(isAuth);
		if (isAuth) {
			app.storage.visitBoard({ boardId: app.getBoard().getBoardId() });
		}
	}, [isAuth]);

	useLayoutEffect(() => {
		fetch(`${getApiUrl()}/users/me`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					return Promise.reject(response);
				}
				return response.json();
			})
			.then(data => {
				setEmail(data.email);
				setIsAuth(true);
			})
			.catch(() => {
				setIsAuth(false);
			});
	}, []);

	return { isAuth, setIsAuth, email };
};
