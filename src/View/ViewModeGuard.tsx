import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { PropsWithChildren } from "react";
import { useAppContext } from "./AppContext";
import React from "react";

type Props = PropsWithChildren<{}>;
export function ViewModeGuard({ children }: Props) {
	const { app, board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["tools"],
		observer: () => {
			forceUpdate();
		},
	});
	console.log("interfaceType", board.interfaceType);
	if (board.interfaceType === "view") {
		console.log("return null");
		return null;
	}

	return <>{children}</>;
}
