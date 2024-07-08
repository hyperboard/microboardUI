import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { PropsWithChildren } from "react";
import { useAppContext } from "View/AppContext";

export function ExportVisible({ children }: PropsWithChildren<{}>) {
	const { board, app } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}
	return <>{children}</>;
}
