import { useAccount } from "App/useAccount";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserRoles } from "entities/account/Account";

interface Props {
  allowedRoles: UserRoles[];
}

export function RouterRolesGuard({ allowedRoles }: Props) {
  const account = useAccount();

  if (!account.isInitialized) {
    return null;
  }

  const userRole = account.tokenData?.role;

  if (userRole && allowedRoles.includes(userRole)) {
    return <Outlet />;
  } else {
    return <Navigate to="/" replace />;
  }
}
