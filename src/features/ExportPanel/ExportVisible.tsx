import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React, { PropsWithChildren } from "react";
import { useAppContext } from "features/AppContext";

export function ExportVisible({
	children,
}: PropsWithChildren<{}>): React.ReactElement | null {
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription({ observer: forceUpdate, subjects: ["tools"] });

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}
	return <>{children}</>;
}
