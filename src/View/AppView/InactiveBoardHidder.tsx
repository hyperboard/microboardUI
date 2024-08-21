import React, { PropsWithChildren } from "react";
import { useAppContext } from "View/AppContext";

export function InactiveBoardHidder({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	const { app } = useAppContext();
	const appBoardId = app.getBoard().getBoardId();

	if (appBoardId === "blank") {
		return <></>;
	}
	return <>{children}</>;
}
