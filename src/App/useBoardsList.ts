import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useEffect } from "react";
import { useAppContext } from "features/AppContext";
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
