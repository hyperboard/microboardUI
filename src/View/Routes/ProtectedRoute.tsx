import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

type Tokens = {
	accessToken: string;
	refreshToken: string;
};

type TProtectedRoute = {
	allowRoles?: EUserRole[];
	isPublic?: boolean;
};

// https://help.miro.com/hc/en-us/articles/360017571194-Roles-in-Miro
export enum EUserRole {
	root = "Root",
	owner = "Owner",
	coowner = "Co-owner",
	member = "Member",
	editor = "Editor",
	visitor = "Visitor",
	guest = "Guest",
};

async function refreshTokens(refreshToken: string): Promise<void> {
	fetch(getApiUrl("/auth/refresh"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${refreshToken}`,
		},
	})
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			throw new Error("Failed to refresh tokens");
		})
		.then((data: Tokens) => {
			Cookies.set("accessToken", data.accessToken);
			Cookies.set("refreshToken", data.refreshToken);
		});
}

async function getUser() {
	const accessToken = Cookies.get("accessToken");
	fetch(getApiUrl("/users/me"), {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	}).then(response => {
		if (response.ok) {
			return response.json();
		}
	});
}

export const ProtectedRoute: React.FC<TProtectedRoute> = ({ allowRoles, isPublic = false }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(true);
	useEffect(() => {
		const accessToken = Cookies.get("accessToken");
		const refreshToken = Cookies.get("refreshToken");
		console.log(accessToken, refreshToken);

		if (accessToken && refreshToken) {
			setIsLoggedIn(true);
			refreshTokens(refreshToken);
			getUser().then(() => {
				setIsLoggedIn(true);
			});
		} else {
			setIsLoggedIn(false);
		}
	}, []);

	// TODO: implement role model on backend
	// if (!allowRoles.includes(user.role as EUserRole)) {
	// 	return <Navigate to='/unauthorized' replace />;
	// }
	if(isPublic) {return <Outlet />;}
	return isLoggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};
