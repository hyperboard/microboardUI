import type { ViewMode } from "App/Connection";
import type { InterfaceType } from "microboard-temp";
import { useAppSubscription } from "App/useBoardSubscription";
import { isIframe } from "shared/lib/isIframe";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React, { useEffect, type ReactNode } from "react";
import { useAppContext } from "./AppContext";

type Props = {
	iframe?: boolean;
	fallback?: ReactNode;
	mode?: ViewMode | ViewMode[];
	children?: ReactNode | ((interfaceType: InterfaceType) => ReactNode);
	callback?: () => void;
	fallbackCb?: () => void;
	shouldLog?: boolean;
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
		subjects: ["board"],
		observer: forceUpdate,
	});

	const interfaceType = board.getInterfaceType();

	const shouldUseFallback =
		((!Array.isArray(mode) && interfaceType !== mode) ||
			(Array.isArray(mode) && !mode.includes(interfaceType))) &&
		(!iframe || isIframe());

	useEffect(() => {
		if (shouldUseFallback && fallbackCb) {
			fallbackCb();
		}

		if (callback) {
			callback();
		}
	}, [shouldUseFallback, fallbackCb, callback]);

	if (shouldUseFallback) {
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
