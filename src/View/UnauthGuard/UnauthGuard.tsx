import { useAccount } from "App/useAccount";
import React, { useLayoutEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

export function UnauthGuard() {
	const account = useAccount();

	useLayoutEffect(() => {
		account.init();
	}, []);

	if (!account.isInitialized) {
		return null;
	}

	if (account.isLoggedIn) {
		return <Navigate to="/" />;
	} else {
		return <Outlet />;
	}
}
