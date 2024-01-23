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
import { stickerColors } from "Board/Items/Sticker";

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
		const uploadInput = document.getElementById("image-upload") as HTMLInputElement;
		const file = uploadInput.files[0];
	
		if (file) {
			const reader = new FileReader();

	        if (file.type === 'application/pdf') {
        reader.onload = (event) => {
            var typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument({data: typedarray}).promise.then((pdf) => {
				// var maxPages = Math.min(pdf.numPages, 2);
				var maxPages = pdf.numPages;
                var pagesRendered = 0;
                var viewportYOffset = 0;
                var pageHeight;
                var renderPage = (pageNum) => {
                    pdf.getPage(pageNum).then((page) => {
                        var viewport = page.getViewport({scale: 1});
                        pageHeight = viewport.height;
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        page.render(renderContext).promise.then(() => {
                            pagesRendered++;
                            var base64String = canvas.toDataURL('image/png');
                            const image = new ImageItem(base64String);
                            const boardImage = this.props.board.add(image);
                            boardImage.doOnceOnLoad(() => {
                                const viewportMbr = this.props.board.camera.getMbr();
                                const scale = 1;
                                const viewportCenter = viewportMbr.getCenter();
								viewportCenter.y = viewportMbr.top;
                                const offsetX = ((pagesRendered - 1) % 2) * (scale * image.getWidth()) - (scale * image.getWidth()) / 2;
                                const offsetY = viewportYOffset;
                                const centeredX = viewportCenter.x + offsetX;
                                const centeredY = viewportCenter.y + offsetY;
                                boardImage.transformation.translateTo(centeredX, centeredY);
                                boardImage.transformation.scaleTo(scale, scale);

                                if (pageNum % 2 === 0 || pageNum === maxPages) {
                                    viewportYOffset += (pageHeight * scale);
                                }

                                if (pagesRendered < maxPages) {
                                    renderPage(pageNum + 1);
                                }
                            });
                            canvas.remove();
                        });
                    });
                };

                renderPage(1);

            }, function(reason) {
                console.error(reason);
            });
        };
        reader.readAsArrayBuffer(file);
				/*
				console.log("Pdf file is selected");
		        reader.onload = (event) => {
					console.log("Pdf file is loaded");
		            var typedarray = new Uint8Array(event.target.result);
		            pdfjsLib.getDocument({data: typedarray}).promise.then((pdf) => {
						console.log("Pdf document is created");
		                var maxPages = Math.min(pdf.numPages, 2);
		                var renderPage = (pageNum) => {
		                    pdf.getPage(pageNum).then((page) => {
		                        var scale = 1.5;
		                        var viewport = page.getViewport({scale: scale});
		                        var canvas = document.createElement('canvas');
		                        var context = canvas.getContext('2d');
		                        canvas.height = viewport.height;
		                        canvas.width = viewport.width;
		
		                        var renderContext = {
		                            canvasContext: context,
		                            viewport: viewport
		                        };
		                        var renderTask = page.render(renderContext);
		                        renderTask.promise.then(() => {
		                            var base64String = canvas.toDataURL('image/png');
									const image = new ImageItem(base64String);
									const boardImage = this.props.board.add(image);
									console.log(image);
		                            if (pageNum < maxPages) {
		                                renderPage(pageNum + 1);
		                            }
		
		                            canvas.remove();
		                        });
		                    });
		                };
		
		                // Start the rendering loop
		                renderPage(1);
		
		            }, function(reason) {
		                console.error(reason);
		            });
		        };
		        reader.readAsArrayBuffer(file);
				*/
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
						
						const viewportWidthWithMargin = viewportWidth - 2 * margin;
						const viewportHeightWithMargin = viewportHeight - 2 * margin;
						
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
				        boardImage.transformation.translateTo(translateX, translateY);
						boardImage.transformation.scaleTo(finalScale, finalScale);
	
						board.selection.removeAll();
						board.selection.add(boardImage);
					});
					// Reset the input after processing to ensure change event
					// fires again even if the next selected file is the same.
					uploadInput.value = '';
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
					top: `${top}px`,
					left: `${left}px`,
				}}
			>
				<Select
					board={board}
					isOn={board.tools.getSelect() !== undefined}
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
				<AddStickerTool
					board={board}
					isOn={board.tools.getAddSticker() !== undefined}
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

class AddStickerTool extends React.PureComponent<{
	board: Board;
	isOn: boolean;
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
					title="Add sticker"
					hotkey="N"
					isOn={this.props.isOn}
					tipOnLeft
				>
					<Icon name="Sticker" width={28} height={28} />
				</Button>
				<div
					id="AddStickerMenu"
					className="ToolsPanelMenu"
					style={{
						visibility: this.props.isOn ? "visible" : "hidden",
						marginTop: "-194px",
					}}
				>
					<ColorPicker
						allowNone={false}
						onPick={this.handlePick}
						list={stickerColors}
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
						//width: "52px",
						paddingLeft: "0px",
						paddingRight: "0px",
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
