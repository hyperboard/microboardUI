import * as React from "react";
import { DrawingContext } from "Board/Items/DrawingContext";
import { Board } from "Board";

interface Props {
	board: Board;
	render(context: DrawingContext): void;
	subscribe(observer: () => void): void;
	unsubscribe(observer: () => void): void;
	width: number;
	height: number;
}

export class Layer extends React.Component<Props> {
	canvasRef = React.createRef<HTMLCanvasElement>();

	componentDidMount(): void {
		const canvas = this.canvasRef.current;
		if (canvas) {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				const drawingContext = new DrawingContext(
					this.props.board.camera,
					ctx,
				);
				this.draw = () => {
					this.props.render(drawingContext);
				};
			}
		}
		window.requestAnimationFrame(this.draw);
		this.props.subscribe(this.update);
	}

	update = (): void => {
		window.requestAnimationFrame(this.draw);
	};

	updateComponent = (): void => {
		this.forceUpdate();
	};

	componentWillUnmount(): void {
		this.props.unsubscribe(this.update);
	}

	componentDidUpdate(): void {
		window.requestAnimationFrame(this.draw);
	}

	draw = (): void => {};

	render(): React.ReactElement {
		const { width, height } = this.props;
		return (
			<div
				className="NoContextMenu"
				style={{
					padding: "0px",
					margin: "0px",
					border: "0px",
					background: "transparent",
					top: "0px",
					left: "0px",
					display: "block",
					width: `${width}px`,
					height: `${height}px`,
					position: "absolute",
				}}
			>
				<canvas
					ref={this.canvasRef}
					width={Math.floor(width * window.devicePixelRatio)}
					height={Math.floor(height * window.devicePixelRatio)}
					className="NoContextMenu"
					style={{
						padding: "0px",
						margin: "0px",
						border: "0px",
						background: "transparent",
						top: "0px",
						left: "0px",
						display: "block",
						width: `${width}px`,
						height: `${height}px`,
					}}
				/>
			</div>
		);
	}
}
