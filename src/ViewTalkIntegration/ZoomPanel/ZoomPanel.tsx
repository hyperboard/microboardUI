import * as React from "react";
import { Icon } from "../Icon";
import { App } from "App";
import { Board } from "Board";
import { Button } from "../ContextPanel";

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
					gap: "8px",
					bottom: "8px",
					right: "12px",
					backgroundColor: "white",
					borderRadius: "8px",
					boxShadow:
						"0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05)",
					padding: "4px",
					userSelect: "none",
				}}
			>
				<Button
					id="ZoomPanelZoomOut"
					title="Отдалить"
					onClick={this.zoomOut}
					tipOnTop
					margin={0}
					hotkey="⌘-"
				>
					<Icon iconName="Minus" width={20} height={18} />
				</Button>
				<Button
					id="ZoomPanelZoomTo100"
					title="Масштаб 100"
					onClick={this.defaultZoom}
					tipOnTop
					margin={0}
					hotkey="⌘0"
					style={{ fontSize: "16px", fontWeight: 500 }}
					width={50}
				>
					{scale < 0.01 ? "<1%" : `${Math.round(scale * 100)}%`}
				</Button>
				<Button
					id="ZoomPanelZoomIn"
					title="Приблизить"
					onClick={this.zoomIn}
					tipOnTopRight
					margin={0}
					hotkey="⌘+"
				>
					<Icon iconName="Plus" width={20} height={20} />
				</Button>
			</div>
		);
	}
}
