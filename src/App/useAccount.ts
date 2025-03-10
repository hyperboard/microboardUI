import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useLayoutEffect } from "react";
import { useAppContext } from "features/AppContext";
import { Account } from "./Account";

export function useAccount(): Account {
	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();

	useLayoutEffect(() => {
		app.account.subject.subscribe(forceUpdate);

		return () => {
			app.account.subject.unsubscribe(forceUpdate);
		};
	}, []);

	return app.account;
}
