import { useAccount } from "App/useAccount";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const AuthGuard: React.FC = () => {
  const account = useAccount();

  if (!account.isInitialized) {
    return null;
  }

  if (account.isLoggedIn) {
    return <Outlet />;
  } else {
    return <Navigate to="/auth/sign-in" />;
  }
};
