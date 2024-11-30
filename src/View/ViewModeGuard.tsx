import { useAppSubscription } from "Board/useBoardSubscription";
import { isIframe } from "lib/isIframe";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { PropsWithChildren, type ReactNode } from "react";
import { useAppContext } from "./AppContext";

type Props = PropsWithChildren<{
	iframe?: boolean;
	fallback?: ReactNode;
}>;
export function ViewModeGuard({ children, iframe, fallback }: Props) {
	const { app, board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["tools"],
		observer: () => {
			forceUpdate();
		},
	});

	if (board.interfaceType === "view" && (!iframe || isIframe())) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
