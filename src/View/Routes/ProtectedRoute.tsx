import { useAccount } from "App/useAccount";
import React from "react";
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
	if (isPublic) {
		return <Outlet />;
	}
	return account.isLoggedIn ? <Outlet /> : <Navigate to="/auth/sign-in" />;
};
