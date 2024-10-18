import { useForceUpdate } from "lib/useForceUpdate";
import { useLayoutEffect } from "react";
import { useAppContext } from "View/AppContext";

export function useAccount() {
	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();

	useLayoutEffect(() => {
		app.account.subject.subscribe(forceUpdate);

		return () => {
			app.account.subject.subscribe(forceUpdate);
		};
	}, []);

	return app.account;
}
