import { useAppSubscription } from "Board/useBoardSubscription";
import { isIframe } from "lib/isIframe";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { type ReactNode } from "react";
import { useAppContext } from "./AppContext";
import type { ViewMode } from "App/Connection";
import type { InterfaceType } from "Board/Board";

type Props = {
	iframe?: boolean;
	fallback?: ReactNode;
	mode?: ViewMode | ViewMode[];
	children?: ReactNode | ((interfaceType: InterfaceType) => ReactNode);
	callback?: () => void;
	fallbackCb?: () => void;
};

export function ViewModeGuard({
	children,
	iframe,
	fallback,
	mode = "edit",
	callback,
	fallbackCb,
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
		if (fallbackCb) {
			fallbackCb();
		}
		return <>{fallback}</>;
	}

	if (callback) {
		callback();
	}

	return (
		<>
			{typeof children === "function"
				? children(interfaceType)
				: children}
		</>
	);
}
