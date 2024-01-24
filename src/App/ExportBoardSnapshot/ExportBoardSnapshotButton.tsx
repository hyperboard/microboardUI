import { Board } from "Board";
import React, { PureComponent, ReactElement } from "react";
import { Button } from "View/ContextPanel/Button";
import { exportBoardSnapshot } from "./ExportBoardSnapshot";
import { Quality } from "./types";
import { Icon } from "View/Icon";

export class ExportBoardSnapshotButton extends PureComponent<{ board: Board }> {
	handleClick = (): void => {
		exportBoardSnapshot(this.props.board, Quality.HIGH);
	};

	render(): ReactElement {
		return (
			<Button
				id="ExportBoardSnapshot"
				onClick={this.handleClick}
				title="Export this board"
				tipOnLeft
			>
				<Icon
					name="Export"
					fill="currentColor"
					stroke="none"
					width={24}
					height={24}
				/>
			</Button>
		);
	}
}
