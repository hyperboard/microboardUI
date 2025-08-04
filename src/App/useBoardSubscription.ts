import { Subscription } from "App/getSubscriptions";
import React, { useEffect, useLayoutEffect } from "react";
import { useAppContext } from "features/AppContext";

export function useAppSubscription(subscription: Subscription): void {
  const { app } = useAppContext();
  useLayoutEffect(() => {
    app.subscriptions.add(subscription);

    return () => {
      app.subscriptions.remove(subscription);
    };
  }, []);
}
