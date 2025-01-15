import { useAccount } from "App/useAccount";
import React, { useLayoutEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

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
}

export const ProtectedRoute: React.FC<TProtectedRoute> = ({
	// allowRoles,
	isPublic = false,
}) => {
	const account = useAccount();
	// TODO: implement role model on backend
	// if (!allowRoles.includes(user.role as EUserRole)) {
	// 	return <Navigate to='/unauthorized' replace />;
	// }

	useLayoutEffect(() => {
		account.init();
	}, []);

	if (isPublic) {
		return <Outlet />;
	}

	if (!account.isInitialized) {
		return null;
	}

	if (account.isLoggedIn) {
		return <Outlet />;
	} else {
		return <Navigate to="/auth/sign-in" />;
	}

	// return account.isLoggedIn ? <Outlet /> : <Navigate to="/auth/sign-in" />;
};
