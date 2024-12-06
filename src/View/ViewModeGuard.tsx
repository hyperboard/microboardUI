import { useAppSubscription } from "Board/useBoardSubscription";
import { isIframe } from "lib/isIframe";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { PropsWithChildren, type ReactNode } from "react";
import { useAppContext } from "./AppContext";
import type { ViewMode } from "App/Connection";
import type { InterfaceType } from "Board/Board";

type Props = {
	iframe?: boolean;
	fallback?: ReactNode;
	mode?: ViewMode | ViewMode[];
	children?: ReactNode | ((interfaceType: InterfaceType) => ReactNode);
};
export function ViewModeGuard({
	children,
	iframe,
	fallback,
	mode = "edit",
}: Props) {
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["tools"],
		observer: forceUpdate,
	});

	const interfaceType = board.getInterfaceType();

	if (
		((!Array.isArray(mode) && interfaceType !== mode) ||
			(Array.isArray(mode) && !mode.includes(interfaceType))) &&
		(!iframe || isIframe())
	) {
		return <>{fallback}</>;
	}

	return (
		<>
			{typeof children === "function"
				? children(interfaceType)
				: children}
		</>
	);
}
