import { Board } from "Board";
import React, { PureComponent, ReactElement } from "react";
import { Button } from "View/ContextPanel/Button";
import { exportBoardSnapshot } from "./ExportBoardSnapshot";
import { Quality } from "./types";
import { Icon } from "View/Icon";
import { ExportSnapshotContext, IExportSnapshotContext } from "./context";

export class ExportBoardSnapshotButton extends PureComponent<
	{ board: Board },
	{}
> {
	static contextType: React.Context<IExportSnapshotContext> =
		ExportSnapshotContext;

	handleClick = (): void => {
		exportBoardSnapshot(this.props.board, Quality.HIGH);
	};

	handleToggleSnapshotMode = (): void => {
		this.context.toggleSnapshotMode();
	};

	render(): ReactElement {
		return (
			<>
				<Button
					id="ExportBoardSnapshot"
					onClick={this.handleClick}
					title="Export this board"
				>
					<Icon
						name="Export"
						fill="currentColor"
						stroke="none"
						width={24}
						height={24}
					/>
				</Button>
				<Button
					id="ExportBoardSnapshot"
					onClick={this.handleToggleSnapshotMode}
					title="Export section of board"
				>
					<Icon
						name="Export"
						fill="currentColor"
						stroke="none"
						width={24}
						height={24}
					/>
				</Button>
			</>
		);
	}
}
