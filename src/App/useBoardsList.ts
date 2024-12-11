import { useForceUpdate } from "lib/useForceUpdate";
import { useEffect } from "react";
import { useAppContext } from "View/AppContext";
import { BoardsList } from "./BoardsList";

export function useBoardsList(): BoardsList {
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
