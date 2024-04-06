import * as React from "react";
import { Icon } from "View/Icon";
import { App } from "App";
import { Board } from "Board";
import { Button } from "View/ContextPanel";

interface Props {
	app: App;
	board: Board;
}

export class ZoomPanel extends React.Component<Props> {
	update = (): void => {
		this.forceUpdate();
	};

	subscription = {
		observer: this.update,
		subjects: ["camera"],
	};

	componentDidMount(): void {
		this.props.app.subscriptions.add(this.subscription);
	}

	componentWillUnmount(): void {
		this.props.app.subscriptions.remove(this.subscription);
	}

	zoomToFit = (): void => {
		const { board } = this.props;
		const rect = board.items.getMbr();
		board.camera.zoomToFit(rect);
	};

	zoomIn = (): void => {
		this.props.board.camera.zoomInToViewCenter();
	};

	zoomOut = (): void => {
		this.props.board.camera.zoomOutFromViewCenter();
	};

	defaultZoom = (): void => {
		this.props.board.camera.zoomToViewCenter(1);
	};

	render(): React.ReactElement {
		const scale = this.props.board.camera.getScale();
		return (
			<div
				id="ZoomPanel"
				style={{
					display: "flex",
					position: "absolute",
					bottom: "8px",
					right: "8px",
					backgroundColor: "white",
					borderRadius: "4px",
					boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.12)",
					paddingLeft: "4px",
					paddingRight: "4px",
					userSelect: "none",
				}}
			>
				<Button
					id="ZoomPanelZoomToFit"
					title="Zoom to fit"
					onClick={this.zoomToFit}
					tipOnTop
					margin={0}
				>
					<Icon name="ZoomToFit" width={24} height={24} />
				</Button>
				<Button
					id="ZoomPanelZoomOut"
					title="Zoom out"
					onClick={this.zoomOut}
					tipOnTop
					margin={0}
				>
					<Icon name="ZoomOut" width={24} height={24} />
				</Button>
				<Button
					id="ZoomPanelZoomTo100"
					title="Zoom to 100%"
					onClick={this.defaultZoom}
					tipOnTop
					margin={0}
				>
					{scale < 0.01 ? "<1%" : `${Math.round(scale * 100)}%`}
				</Button>
				<Button
					id="ZoomPanelZoomIn"
					title="Zoom in"
					onClick={this.zoomIn}
					tipOnTop
					margin={0}
				>
					<Icon name="ZoomIn" width={24} height={24} />
				</Button>
			</div>
		);
	}
}
