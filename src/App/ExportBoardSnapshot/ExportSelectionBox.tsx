import React, { FC, useContext } from "react";
import { Button } from "View/ContextPanel/Button";
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
		<div className="SnapshotSelectionBoxContainer">
			<div className="SnapshotSelectionBox">
				<Panel>
					<Button onClick={handleConfirmSnapshot}>Submit</Button>
					<VerticalSeparator />
					<Button onClick={handleCancelSnapshot}>Cancel</Button>
				</Panel>
			</div>
		</div>
	);
};

applyStyle(`
	.SnapshotSelectionBoxContainer {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}

	.SnapshotSelectionBox {
		position: absolute;
		left: 8px;
		top: 8px;
		width: auto;
	}
`);
