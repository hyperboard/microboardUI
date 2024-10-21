import { useForceUpdate } from "lib/useForceUpdate";
import { useEffect } from "react";
import { useAppContext } from "View/AppContext";

export function useBoardsList() {
	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();

	useEffect(() => {
		app.boardsList.subject.subscribe(forceUpdate);
		return () => {
			app.boardsList.subject.unsubscribe(forceUpdate);
		};
	}, []);

	return app.boardsList;
}
