import { App } from "App";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ app: App }>;
export function ViewModeGuard({ children, app }: Props) {
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["tools"],
		observer: () => {
			forceUpdate();
		},
	});
	const board = app.getBoard();
	if (board.interfaceType === "view") {
		return null;
	}

	return <>{children}</>;
}
