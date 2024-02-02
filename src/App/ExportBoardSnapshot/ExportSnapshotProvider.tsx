import React, { PureComponent, ReactElement, ReactNode } from "react";
import { Provider } from "./context";
import { Mbr } from "Board/Items";
import { exportBoardSnapshot } from "./ExportBoardSnapshot";
import { Board } from "Board";
import { Quality } from "./types";
import { ExportSelection } from "./ExportSelection";
import { App } from "App/App";

interface State {
	snapshotMode: boolean;
	selection: Mbr;
}

export class ExportSnapshotProvider extends PureComponent<
	{ board: Board; children: ReactNode; app: App },
	State
> {
	state = {
		snapshotMode: false,
		selection: new Mbr(),
	};

	setSelection = (rect: Mbr): void => {
		this.setState({ selection: rect });
	};

	toggleSnapshotMode = (): void => {
		this.setState(prevState => ({
			...prevState,
			snapshotMode: !prevState.snapshotMode,
		}));
	};

	confirmSnapshot = (): void => {
		exportBoardSnapshot(
			this.props.board,
			Quality.HIGH,
			this.state.selection,
		);
		this.toggleSnapshotMode();
	};

	render(): ReactElement {
		return (
			<Provider
				value={{
					snapshotMode: this.state.snapshotMode,
					toggleSnapshotMode: this.toggleSnapshotMode,
					confirmSnapshot: this.confirmSnapshot,
				}}
			>
				{this.state.snapshotMode && (
					<ExportSelection
						board={this.props.board}
						setSelection={this.setSelection}
					/>
				)}
				{this.props.children}
			</Provider>
		);
	}
}
