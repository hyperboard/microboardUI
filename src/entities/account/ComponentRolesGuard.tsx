import { useAccount } from "App/useAccount";
import React from "react";
import { UserRoles } from "entities/account/Account";

interface Props {
  allowedRoles: UserRoles[];
  children: React.ReactNode;
}

export function ComponentRolesGuard({ allowedRoles, children }: Props) {
  const account = useAccount();

  if (!account.isInitialized) {
    return null;
  }

  const userRole = account.tokenData?.role;

  if (userRole && allowedRoles.includes(userRole)) {
    return children;
  } else {
    return null;
  }
}
