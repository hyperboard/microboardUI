/* eslint-disable max-classes-per-file */
import * as React from "react";
import { Board } from "Board";
import { App } from "App";
import { Mbr } from "Board/Items";
import { ShapePicker } from "../Pickers/ShapeTypePicker";
import { ConnectorLineStylePicker } from "../Pickers/ConnectorLineStylePicker";
import { ImageItem } from "Board/Items/Image";
import { ColorPicker } from "../Pickers/ColorPicker";
import { SliderPicker } from "../Pickers/SliderPicker";
import { HorisontalSeparator } from "../ContextPanel/HorisontalSeparator";
import { UndoIcon } from "../Icon/UndoIcon";
import { RedoIcon } from "../Icon/RedoIcon";
import { Button } from "../ContextPanel";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { SidePanelState } from "View/SidePanel/SidePanelState";
import { applyStyle } from "lib/applyStyle";
import { Icon } from "../Icon";
import "../labGrotesqueFont.css";

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
		this.forceUpdate();
	};

	subscription = {
		observer: this.update,
		subjects: ["tools", "camera", "events"],
	};

	componentDidMount(): void {
		this.props.app.subscriptions.add(this.subscription);
		const uploadInput = document.getElementById("image-upload");
		uploadInput.addEventListener("change", this.onUploadImage);
		this.props.sidePanelState.subject.subscribe(this.update);
	}

	componentWillUnmount(): void {
		const uploadInput = document.getElementById("image-upload");
		uploadInput.removeEventListener("change", this.onUploadImage);
		this.props.app.subscriptions.remove(this.subscription);
		this.props.sidePanelState.subject.unsubscribe(this.update);
	}

	onUploadImage = (): void => {
		const uploadInput = document.getElementById(
			"image-upload",
		) as HTMLInputElement;
		const file = uploadInput.files[0];

		if (file) {
			const reader = new FileReader();

			if (file.type === "application/pdf") {
				reader.onload = event => {
					const typedarray = new Uint8Array(event.target.result);
					pdfjsLib.getDocument({ data: typedarray }).promise.then(
						pdf => {
							const maxPages = pdf.numPages;
							let pagesRendered = 0;
							let viewportYOffset = 0;
							let pageHeight;
							var renderPage = pageNum => {
								pdf.getPage(pageNum).then(page => {
									const viewport = page.getViewport({
										scale: 1,
									});
									pageHeight = viewport.height;
									const canvas =
										document.createElement("canvas");
									const context = canvas.getContext("2d");
									canvas.height = viewport.height;
									canvas.width = viewport.width;

									const renderContext = {
										canvasContext: context,
										viewport: viewport,
									};
									page.render(renderContext).promise.then(
										() => {
											pagesRendered++;
											const base64String =
												canvas.toDataURL("image/png");
											const image = new ImageItem(
												base64String,
											);
											const boardImage =
												this.props.board.add(image);
											boardImage.doOnceOnLoad(() => {
												const viewportMbr =
													this.props.board.camera.getMbr();
												const scale = 1;
												const viewportCenter =
													viewportMbr.getCenter();
												viewportCenter.y =
													viewportMbr.top;
												const offsetX =
													((pagesRendered - 1) % 2) *
														(scale *
															image.getWidth()) -
													(scale * image.getWidth()) /
														2;
												const offsetY = viewportYOffset;
												const centeredX =
													viewportCenter.x + offsetX;
												const centeredY =
													viewportCenter.y + offsetY;
												boardImage.transformation.translateTo(
													centeredX,
													centeredY,
												);
												boardImage.transformation.scaleTo(
													scale,
													scale,
												);

												if (
													pageNum % 2 === 0 ||
													pageNum === maxPages
												) {
													viewportYOffset +=
														pageHeight * scale;
												}

												if (pagesRendered < maxPages) {
													renderPage(pageNum + 1);
												}
											});
											canvas.remove();
										},
									);
								});
							};

							renderPage(1);
						},
						reason => {
							console.error(reason);
						},
					);
				};
				reader.readAsArrayBuffer(file);
			} else {
				reader.onload = (event: any) => {
					const base64String = event.target.result;
					const image = new ImageItem(base64String);
					const boardImage = this.props.board.add(image);
					boardImage.doOnceOnLoad(() => {
						const board = this.props.board;
						const viewportMbr = board.camera.getMbr();

						const viewportWidth = viewportMbr.getWidth();
						const viewportHeight = viewportMbr.getHeight();

						const margin = viewportHeight * 0.05;

						const viewportWidthWithMargin =
							viewportWidth - 2 * margin;
						const viewportHeightWithMargin =
							viewportHeight - 2 * margin;

						const imageWidth = boardImage.getWidth();
						const imageHeight = boardImage.getHeight();

						const scaleX = viewportWidthWithMargin / imageWidth;
						const scaleY = viewportHeightWithMargin / imageHeight;

						const scaleToFit = Math.min(scaleX, scaleY);

						const finalScale = scaleToFit;

						const scaledImageWidth = imageWidth * finalScale;
						const scaledImageHeight = imageHeight * finalScale;

						const scaledImageCenterX = scaledImageWidth / 2;
						const scaledImageCenterY = scaledImageHeight / 2;

						// Calculate the translation required to center the image.
						const centerPoint = viewportMbr.getCenter();
						const translateX = centerPoint.x - scaledImageCenterX;
						const translateY = centerPoint.y - scaledImageCenterY;
						boardImage.transformation.translateTo(
							translateX,
							translateY,
						);
						boardImage.transformation.scaleTo(
							finalScale,
							finalScale,
						);

						board.selection.removeAll();
						board.selection.add(boardImage);
					});
					uploadInput.value = "";
				};
				reader.readAsDataURL(file);
			}
		} else {
			console.log("Image Upload: No image file selected.");
		}
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
					width: "32px",
					top: `${top}px`,
					left: `${left}px`,
				}}
			>
				<Select
					board={board}
					isOn={board.tools.getSelect() !== undefined}
				/>
				<AddText
					board={board}
					isOn={board.tools.getAddText() !== undefined}
				/>
				<AddStickerTool
					board={board}
					isOn={board.tools.getAddSticker() !== undefined}
					selectedColor={
						board.tools
							.getAddSticker()
							?.sticker.getBackgroundColor() ?? "none"
					}
				/>
				<AddShape
					board={board}
					isOn={board.tools.getAddShape() !== undefined}
				/>
				<AddConnector
					board={board}
					isOn={board.tools.getAddConnector() !== undefined}
				/>
				<AddDrawing
					board={board}
					isOn={board.tools.getAddDrawing() !== undefined}
					selectedColor={
						board.tools.getAddDrawing()?.strokeStyle ?? "none"
					}
					width={board.tools.getAddDrawing()?.strokeWidth ?? 1}
				/>
				<AddImage />

				<HorisontalSeparator height={1}></HorisontalSeparator>

				<Undo board={board} canUndo={board.events.canUndo()} />
				<Redo board={board} canRedo={board.events.canRedo()} />
			</div>
		);
	}
}

applyStyle(`
.ToolsPanel {
	width: 40px;
	display: flex;
	flex-wrap: wrap;
	padding: 4px;
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05);
	position: absolute;
	z-index: 90;
	justify-content: center;
	align-content: center;
  gap: 4px;
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
	padding: 4px;
	display: flex;
	flex-wrap: wrap;
	border-radius: 8px;
	gap: 4px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05);
}

`);

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
				title="Выделение"
				hotkey="S"
				isOn={isOn}
				tipOnLeft
				width={32}
				height={32}
			>
				<Icon width={17} height={17} iconName="Pointer" />
			</Button>
		);
	}
}

const stickerColors = [
	"#AED4FA",
	"#FCF5AE",
	"#AFD6A7",
	"#E9BFE9",
	"#ABDDDD",
	"#F6A8A8",
	"#E6E6E6",
];

class AddStickerTool extends React.PureComponent<{
	board: Board;
	isOn: boolean;
	selectedColor: string;
}> {
	handleClick = (): void => {
		this.props.board.tools.addSticker();
	};

	handlePick = (color: string): void => {
		const { board } = this.props;
		const add = board.tools.getAddSticker();
		if (add) {
			add.setBackgroundColor(color);
		}
	};
	render(): React.ReactElement {
		return (
			<div className="ToolsPanelMenuContainer">
				<Button
					id="AddSticker"
					onClick={this.handleClick}
					title="Стикер"
					hotkey="⌘N"
					isOn={this.props.isOn}
					tipOnLeft
					width={32}
					height={32}
				>
					<Icon width={16} height={16} iconName="Sticker" />
				</Button>
				<div
					id="AddStickerMenu"
					className="ToolsPanelMenu"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: "4px",
						top: 0,
						visibility: this.props.isOn ? "visible" : "hidden",
					}}
				>
					<ColorPicker
						allowNone={false}
						onPick={this.handlePick}
						colors={stickerColors}
						selectedColor={this.props.selectedColor}
					/>
				</div>
			</div>
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
					title="Фигуры"
					hotkey="S"
					isOn={isOn}
					tipOnLeft
					width={32}
					height={32}
				>
					<Icon width={18} height={18} iconName="AddShape" />
				</Button>
				<div
					id="AddShapeMenu"
					className="ToolsPanelMenu"
					style={{
						marginTop: "-32px",
						width: "104px",
						visibility: isOn ? "visible" : "hidden",
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
				title="Текст"
				hotkey="T"
				isOn={isOn}
				tipOnLeft
				width={32}
				height={32}
			>
				<Icon width={14} height={16} iconName="AddText" />
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
					title="Соединительная линия"
					hotkey="L"
					isOn={isAddConnectorOn}
					tipOnLeft
					width={32}
					height={32}
				>
					<Icon width={16} height={16} iconName="Arrow" />
				</Button>
				<div
					id="AddConnectorMenu"
					className="ToolsPanelMenu"
					style={{
						display: "flex",
						flexDirection: "column",
						top: 0,
						visibility: isOn ? "visible" : "hidden",
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

const drawingColors = [
	"#2291FF",
	"#FFBE00",
	"#00CCAE",
	"#3DBC5D",
	"#B750D1",
	"#F03B36",
	"#000000",
	"#FFFFFF",
];
class AddDrawing extends React.PureComponent<{
	board: Board;
	isOn: boolean;
	width: number;
	selectedColor: string;
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
		const { isOn, width } = this.props;

		return (
			<div className="ToolsPanelMenuContainer">
				<Button
					id="AddDrawing"
					onClick={this.handleButtonClick}
					title="Карандаш"
					hotkey="B"
					isOn={isOn}
					tipOnLeft
					width={32}
					height={32}
				>
					<Icon width={18} height={18} iconName="Pen" />
				</Button>
				<div
					id="AddDrawingMenu"
					className="ToolsPanelMenu"
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "16px",
						top: 0,
						visibility: isOn ? "visible" : "hidden",
					}}
				>
					<SliderPicker
						style={{ paddingTop: "10px" }}
						onPick={this.handleSliderPick}
						width={width}
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(5, 1fr)",
							gap: "4px",
						}}
					>
						<ColorPicker
							selectedColor={this.props.selectedColor}
							colors={drawingColors}
							onPick={this.handleColorPick}
						/>
					</div>
				</div>
			</div>
		);
	}
}

class AddImage extends React.PureComponent {
	handleClick = (): void => {
		const uploadInput = document.getElementById("image-upload");
		uploadInput.click();
	};

	render(): React.ReactElement {
		return (
			<Button
				id="AddImage"
				onClick={this.handleClick}
				title="Добавить изображение"
				isOn={false}
				tipOnLeft
				width={32}
				height={32}
			>
				<Icon width={20} height={18} iconName="Image" />
			</Button>
		);
	}
}

type UndoProps = { board: Board; canUndo: boolean };

class Undo extends React.PureComponent<UndoProps> {
	handleClick = (): void => {
		const { board } = this.props;
		board.events.undo();
	};

	render(): React.ReactElement {
		const { canUndo } = this.props;

		return (
			<Button
				id="Undo"
				onClick={this.handleClick}
				title="Шаг назад"
				hotkey="⌘Z"
				isOn={false}
				tipOnLeft
				width={32}
				height={32}
				disabled={!canUndo}
			>
				<UndoIcon width={15} height={15} />
			</Button>
		);
	}
}

type RedoProps = { board: Board; canRedo: boolean };

class Redo extends React.PureComponent<RedoProps> {
	handleClick = (): void => {
		const { board } = this.props;
		board.events.redo();
	};

	render(): React.ReactElement {
		const { canRedo } = this.props;

		return (
			<Button
				id="Redo"
				onClick={this.handleClick}
				title="Шаг вперед"
				hotkey="⌘⇧Z"
				isOn={false}
				tipOnLeft
				width={32}
				height={32}
				disabled={!canRedo}
			>
				<RedoIcon width={15} height={15} />
			</Button>
		);
	}
}
