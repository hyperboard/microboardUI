import { useAppSubscription } from "App/useBoardSubscription";
import type { InterfaceType } from "microboard-temp";
import React, { useCallback, useEffect, type ReactNode } from "react";
import { isIframe } from "shared/lib/isIframe";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppContext } from "./AppContext";

type ViewMode = "view" | "edit" | "loading";

type Props = {
  iframe?: boolean;
  fallback?: ReactNode;
  mode?: ViewMode | ViewMode[];
  children?: ReactNode | ((interfaceType: InterfaceType) => ReactNode);
  callback?: () => void;
  fallbackCb?: () => void;
  shouldLog?: boolean;
};

export function ViewModeGuard({
  children,
  iframe,
  fallback,
  mode = "edit",
  callback,
  fallbackCb,
}: Props) {
  const { board } = useAppContext();
  const forceUpdate = useForceUpdate();

  // Memoize the observer to prevent infinite re-renders
  const observer = useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  useAppSubscription({
    subjects: ["board"],
    observer,
  });

  const interfaceType = board.getInterfaceType();

  const shouldUseFallback =
    ((!Array.isArray(mode) && interfaceType !== mode) ||
      (Array.isArray(mode) && !mode.includes(interfaceType))) &&
    (!iframe || isIframe());

  useEffect(() => {
    if (shouldUseFallback && fallbackCb) {
      fallbackCb();
    }

    if (callback) {
      callback();
    }
  }, [shouldUseFallback, fallbackCb, callback]);

  if (shouldUseFallback) {
    return <>{fallback}</>;
  }

  return (
    <>{typeof children === "function" ? children(interfaceType) : children}</>
  );
}
