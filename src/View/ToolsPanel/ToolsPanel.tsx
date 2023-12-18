/* eslint-disable max-classes-per-file */
import * as React from "react";
import { Board } from "Board";
import { App } from "App";
import { Icon } from "../Icon";
import { Mbr } from "Board/Items";
import { ShapePicker } from "../Pickers/ShapeTypePicker";
import { ConnectorLineStylePicker } from "../Pickers/ConnectorLineStylePicker";
import { ImageItem } from "Board/Items/Image";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker";
import { HorisontalSeparator } from "View/ContextPanel/HorisontalSeparator";
import { UndoIcon } from "View/Icon/UndoIcon";
import { RedoIcon } from "View/Icon/RedoIcon";
import { PenIcon } from "View/Icon/PenIcon";
import { Button } from "View/ContextPanel/Button";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { SidePanelState } from "View/SidePanel/SidePanelState";

interface Props {
	app: App;
	board: Board;
	sidePanelState: SidePanelState;
}

interface State {
	addShapeRect: Mbr;
	addShapeMenuRect: Mbr;
	addConnectorRect: Mbr;
	addConnectorMenuRect: Mbr;
	addDrawingRect: Mbr;
	addDrawingMenuRect: Mbr;
}

export class ToolsPanel extends React.Component<Props, State> {
	animationFrameId: number | null = null;

	update = (): void => {
		if (this.animationFrameId) {
			return; // Function already scheduled to run
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.forceUpdate();
			this.animationFrameId = null;
		});
	};

	subscription = {
		observer: this.update,
		subjects: ["tools", "camera", "events"],
	};

	componentDidMount(): void {
		this.props.app.subscribe(this.subscription);
		const uploadInput = document.getElementById("image-upload");
		uploadInput.addEventListener("change", this.onUploadImage);
		this.props.sidePanelState.subject.subscribe(this.update);
	}

	componentWillUnmount(): void {
		const uploadInput = document.getElementById("image-upload");
		uploadInput.removeEventListener("change", this.onUploadImage);
		this.props.app.unsubscribe(this.subscription);
		this.props.sidePanelState.subject.unsubscribe(this.update);
	}

	onUploadImage = (): void => {
		const uploadInput = document.getElementById(
			"image-upload",
		) as HTMLInputElement;
		const file = uploadInput.files[0];

		const reader = new FileReader();
		reader.onload = (event: any) => {
			const base64String = event.target.result;
			const image = new ImageItem(base64String);
			const point = this.props.board.camera.getMbr().getCenter();
			image.transformation.translateTo(point.x, point.y);
			const boardImage = this.props.board.add(image);
			boardImage.doOnceOnLoad(() => {
				const board = this.props.board;
				const mbr = boardImage.getMbr();
				mbr.left -= 100;
				mbr.top -= 100;
				mbr.right += 100;
				mbr.bottom += 100;
				board.camera.viewRectangle(mbr);
				board.selection.removeAll();
				board.selection.add(boardImage);
			});
		};

		reader.readAsDataURL(file);
	};

	render(): React.ReactElement {
		const board = this.props.board;
		const height = this.props.board.camera.window.height / 3;
		const top = height > 48 ? height - 48 : height;
		const isSidePanelOn = this.props.sidePanelState.isOn;
		const sidePanelWidth = this.props.sidePanelState.width;
		const left = isSidePanelOn ? sidePanelWidth + 24 : 8;
		return (
			<div
				id="ToolsPanel"
				className="ToolsPanel"
				style={{
					top: `${top}px`,
					left: `${left}px`,
				}}
			>
				<Select
					board={board}
					isOn={board.tools.getSelect() !== undefined}
				/>
				<AddSticker
					board={board}
					isOn={board.tools.getAddSticker() !== undefined}
				/>
				<AddShape
					board={board}
					isOn={board.tools.getAddShape() !== undefined}
				/>
				<AddText
					board={board}
					isOn={board.tools.getAddText() !== undefined}
				/>
				<AddConnector
					board={board}
					isOn={board.tools.getAddConnector() !== undefined}
				/>
				<AddDrawing
					board={board}
					isOn={board.tools.getAddDrawing() !== undefined}
					width={board.tools.getAddDrawing()?.strokeWidth ?? 1}
				/>
				<AddImage />

				<HorisontalSeparator height={4}></HorisontalSeparator>

				<Undo board={board} isOn={board.events.canUndo()} />
				<Redo board={board} isOn={board.events.canRedo()} />
			</div>
		);
	}
}

const ToolsPanelStyle = document.createElement("style");

ToolsPanelStyle.innerHTML = `
.ToolsPanel {
	width: 44px;
	display: flex;
	flex-wrap: wrap;
	padding-left: 2px;
	padding-right: 2px;
	padding-top: 10px;
	padding-bottom: 10px;
	background-color: white;
	border-radius: 4px;
	box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
	position: absolute;
	z-index: 90;
	justify-content: center;
	align-content: center;
}

.ToolsPanelMenuContainer {
	position: relative;
	display: inline-block;
}
  
.ToolsPanelMenu {
	visibility: hidden;
	background-color: white;
	color: black;
	text-align: center;
	left: 110%;
	z-index: 1;
	position: absolute;
	padding-left: 6px;
	padding-right: 6px;
	padding-top: 10px;
	padding-bottom: 10px;
	display: flex;
	flex-wrap: wrap;
	border-radius: 4px;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
}

`;

document.head.appendChild(ToolsPanelStyle);

class Select extends React.PureComponent<{
	board: Board;
	isOn: boolean;
}> {
	handleClick = (): void => {
		this.props.board.tools.select();
	};

	render(): React.ReactElement {
		const { isOn } = this.props;

		return (
			<Button
				id="Select"
				onClick={this.handleClick}
				title="Select"
				hotkey="V"
				isOn={isOn}
				tipOnLeft
			>
				<Icon name="Pointer" width={24} height={24} />
			</Button>
		);
	}
}
class AddSticker extends React.PureComponent<{
	board: Board;
	isOn: boolean;
}> {
	handleClick = (): void => {
		this.props.board.tools.addSticker();
	};

	render(): React.ReactElement {
		return (
			<Button
				id="AddSticker"
				onClick={this.handleClick}
				title="Add sticker"
				hotkey="N"
				isOn={this.props.isOn}
				tipOnLeft
			>
				<Icon name="Sticker" width={28} height={28} />
			</Button>
		);
	}
}

class AddShape extends React.PureComponent<{
	board: Board;
	isOn: boolean;
}> {
	handleClick = (): void => {
		this.props.board.tools.addShape();
	};

	handlePick = (type: string): void => {
		const { board } = this.props;
		const addShape = board.tools.getAddShape();
		if (addShape) {
			addShape.setShapeType(type);
		}
	};

	render(): React.ReactElement {
		const { isOn } = this.props;

		return (
			<div className="ToolsPanelMenuContainer">
				<Button
					id="AddShape"
					onClick={this.handleClick}
					title="Add Shape"
					hotkey="S"
					isOn={isOn}
					tipOnLeft
				>
					<Icon name="Rectangle" width={24} height={24} />
				</Button>
				<div
					id="AddShapeMenu"
					className="ToolsPanelMenu"
					style={{
						width: "120px",
						visibility: isOn ? "visible" : "hidden",
						marginTop: "-194px",
					}}
				>
					<ShapePicker onPick={this.handlePick} />
				</div>
			</div>
		);
	}
}

class AddText extends React.PureComponent<{ board: Board; isOn: boolean }> {
	handleClick = (): void => {
		const { board } = this.props;
		board.tools.addText();
	};

	render(): React.ReactElement {
		const { isOn } = this.props;

		return (
			<Button
				id="AddText"
				onClick={this.handleClick}
				title="Add Text"
				hotkey="T"
				isOn={isOn}
				tipOnLeft
			>
				<Icon name="RichText" width={24} height={24} />
			</Button>
		);
	}
}

class AddConnector extends React.PureComponent<{
	board: Board;
	isOn: boolean;
}> {
	handleClick = (): void => {
		const { board } = this.props;
		board.tools.addConnector();
	};

	handlePickLineStyle = (lineStyle: ConnectorLineStyle): void => {
		const { board } = this.props;
		const addConnector = board.tools.getAddConnector();
		if (addConnector) {
			addConnector.setLineStyle(lineStyle);
		}
	};

	render(): React.ReactElement {
		const { isOn, board } = this.props;
		const isAddConnectorOn = board.tools.getAddConnector() !== undefined;

		return (
			<div className="ToolsPanelMenuContainer">
				<Button
					id="AddConnector"
					onClick={this.handleClick}
					title="Add Connector"
					hotkey="L"
					isOn={isAddConnectorOn}
					tipOnLeft
				>
					<Icon
						name="Connector"
						width={24}
						height={24}
						fill="rgb(0,0,0)"
					/>
				</Button>
				<div
					id="AddConnectorMenu"
					className="ToolsPanelMenu"
					style={{
						width: "52px",
						visibility: isOn ? "visible" : "hidden",
						marginTop: "-80px",
					}}
				>
					<ConnectorLineStylePicker
						onPick={this.handlePickLineStyle}
					/>
				</div>
			</div>
		);
	}
}

class AddDrawing extends React.PureComponent<{
	board: Board;
	isOn: boolean;
	width: number;
}> {
	handleButtonClick = (): void => {
		const { board } = this.props;
		board.tools.addDrawing();
	};

	handleSliderPick = (width: number): void => {
		const { board } = this.props;
		const addDrawing = board.tools.getAddDrawing();
		if (addDrawing) {
			addDrawing.strokeWidth = width;
			board.tools.publish();
		}
	};

	handleColorPick = (color: string): void => {
		const { board } = this.props;
		const addDrawing = board.tools.getAddDrawing();
		if (addDrawing) {
			addDrawing.strokeStyle = color;
			board.tools.publish();
		}
	};

	render(): React.ReactElement {
		const { isOn, board, width } = this.props;

		return (
			<div className="ToolsPanelMenuContainer">
				<Button
					id="AddDrawing"
					onClick={this.handleButtonClick}
					title="Add Drawing"
					hotkey="P"
					isOn={isOn}
					tipOnLeft
				>
					<PenIcon
						color={board.tools.getAddDrawing()?.strokeStyle}
						width={24}
						height={24}
					></PenIcon>
				</Button>
				<div
					id="AddDrawingMenu"
					className="ToolsPanelMenu"
					style={{
						width: "120px",
						visibility: isOn ? "visible" : "hidden",
						marginTop: "-180px",
					}}
				>
					<SliderPicker
						onPick={this.handleSliderPick}
						width={width}
					/>
					<ColorPicker onPick={this.handleColorPick} />
				</div>
			</div>
		);
	}
}

class AddImage extends React.PureComponent {
	handleClick = (): void => {
		const uploadInput = document.getElementById("image-upload");
		uploadInput.click();
		// uploadInput.addEventListener("change", this.onUploadImage);
	};

	render(): React.ReactElement {
		return (
			<Button
				id="AddImage"
				onClick={this.handleClick}
				title="Add Image"
				isOn={false}
				tipOnLeft
			>
				<Icon name="Image" width={24} height={24} />
			</Button>
		);
	}
}

class Undo extends React.PureComponent<{ board: Board; isOn: boolean }> {
	handleClick = (): void => {
		const { board } = this.props;
		board.events.undo();
	};

	render(): React.ReactElement {
		const { isOn } = this.props;

		return (
			<Button
				id="Undo"
				onClick={this.handleClick}
				title="Undo"
				hotkey="ctrl+z"
				isOn={false}
				tipOnLeft
			>
				<UndoIcon isOn={isOn} width={24} height={24} />
			</Button>
		);
	}
}
class Redo extends React.PureComponent<{ board: Board; isOn: boolean }> {
	handleClick = (): void => {
		const { board } = this.props;
		board.events.redo();
	};

	render(): React.ReactElement {
		const { isOn } = this.props;

		return (
			<Button
				id="Redo"
				onClick={this.handleClick}
				title="Redo"
				hotkey="ctrl+shift+z"
				isOn={false}
				tipOnLeft
			>
				<RedoIcon isOn={isOn} width={24} height={24} />
			</Button>
		);
	}
}
