import React, { FC, useContext } from "react";
import { UiButton } from "View/Ui/UiButton";
import { applyStyle } from "lib/applyStyle";

import { Panel } from "ui/Panel";
import { ExportSnapshotContext } from "./context";
import { VerticalSeparator } from "View/ContextPanel/VerticalSeparator";

export const ExportSelectionBox: FC = () => {
	const { snapshotMode, confirmSnapshot, toggleSnapshotMode } = useContext(
		ExportSnapshotContext,
	);

	const handleConfirmSnapshot = (): void => {
		confirmSnapshot();
	};

	const handleCancelSnapshot = (): void => {
		toggleSnapshotMode();
	};

	if (!snapshotMode) {
		return null;
	}

	return (
		<div className="SnapshotSelectionBox">
			<Panel>
				<UiButton onClick={handleConfirmSnapshot}>Submit</UiButton>
				<VerticalSeparator />
				<UiButton onClick={handleCancelSnapshot}>Cancel</UiButton>
			</Panel>
		</div>
	);
};

applyStyle(`
	.SnapshotSelectionBox {
		position: fixed;
		left: 8px;
		top: 8px;
		width: auto;
		z-index: 2;
	}
`);
