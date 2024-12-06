import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { PropsWithChildren } from "react";
import { useAppContext } from "View/AppContext";

export function ViewModeGuard({ children }: PropsWithChildren<{}>) {
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["tools"],
		observer: forceUpdate,
	});
	if (board.getInterfaceType() === "view") {
		return null;
	}

	return <>{children}</>;
}
