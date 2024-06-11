import React from "react";
import { Slate, Editable, ReactEditor } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { App } from "App";
import { Board } from "Board";
import { verticalAlignmentToFlex } from "./verticalAlignmentToFlex";
import { defaultTextStyle, RichText } from "Board/Items/RichText/RichText";
import { Mbr, Point } from "Board/Items";

export class TextEditors extends React.Component<
	{
		app: App;
		board: Board;
	},
	{}
> {
	observer = (): void => {
		this.forceUpdate();
	};

	subscription = {
		observer: this.observer,
		subjects: ["selection", "camera", "items"],
	};

	componentDidMount(): void {
		this.props.app.subscriptions.add(this.subscription);
	}

	componentWillUnmount(): void {
		this.props.app.subscriptions.remove(this.subscription);
	}

	render(): React.ReactElement | null {
		let Editors: React.ReactElement | null = null;
		for (const text of this.props.board.selection.getTextToEdit()) {
			Editors = <TextEditor board={this.props.board} text={text} />;
		}
		return Editors;
	}
}
export class TextEditor extends React.Component<
	{
		board: Board;
		text: RichText;
	},
	{
		hasError: boolean;
	}
> {
	static getDerivedStateFromError(error): {
		hasError: boolean;
	} {
		console.error("Text Editor error", error);
		return { hasError: true };
	}

	componentDidMount(): void {
		this.props.text.setCursorUnderLastClick(this.editableRef.current);
	}

	state = {
		hasError: false,
	};

	containerRef = React.createRef<HTMLDivElement>();
	editableRef = React.createRef<HTMLDivElement>();

	render(): React.ReactElement | null {
		const text = this.props.text;
		if (!text) {
			return null;
		}
		const { camera } = this.props.board;
		const { point, width, height, maxWidth, maxHeight, textScale } =
			text.getDimensions();
		point.transform(camera.getMatrix());
		const left = point.x;
		/** A heuristic trick to better align editor with canvas */
		const top = point.y - 0.8 * camera.getScale();
		const editorScale = textScale * camera.getScale();
		const verticalAlignment = text.getVerticalAlignment();

		const container = text.getTransformedContainer();
		container.transform(camera.getMatrix());

		if (this.state.hasError) {
			return (
				<div
					id="TextEditor"
					ref={this.containerRef}
					style={{
						border: "none",
						padding: "0px",
						margin: "0px",
						overflow: "hidden",
						background: "none",
						outline: "none",
						resize: "none",

						position: "absolute",
						left: `${left}px`,
						top: `${top}px`,

						maxWidth: `${maxWidth}px`,
						maxHeight: `${maxHeight}px`,
						width: `${maxWidth}px`,
						height: `${maxHeight}px`,

						// transformOrigin: "left top",
						// transform: `translate(0px) scale(${editorScale})`,
						willChange: "transform",
						transform: "translate3d(0,0,0)",

						display: "flex",
						alignItems: verticalAlignmentToFlex(verticalAlignment), // vertical
						justifyContent: "center", // horisontal

						fontFamily: defaultTextStyle.fontFamily,
						fontSize: `${defaultTextStyle.fontSize}px`,
						lineHeight: defaultTextStyle.lineHeight,
						color: defaultTextStyle.fontColor,
					}}
				>
					{"An editor error has occured"}
				</div>
			);
		}

		return (
			/* <div 
				style={{
					position: 'absolute',
					left: `${container.left}px`, 
					top: `${container.top}px`, 
					width: `${container.getWidth()/editorScale}px`, 
					height: `${container.getHeight()/editorScale}px`,
					overflow: 'hidden', // This will cut off any overflowing content
					transformOrigin: "left top",
					transform: `scale(${editorScale})`,
				}}
			>*/

			<div
				id="TextEditor"
				ref={this.containerRef}
				style={{
					border: "none",
					padding: "0px",
					margin: "0px",
					// overflow: "hidden",
					background: "none",
					outline: "none",
					resize: "none",

					// position: "relative",
					// left: `${left - container.left}px`,
					// top: `${top - container.top}px`,

					position: "absolute",
					left: `${left}px`,
					top: `${top}px`,

					maxWidth: `${maxWidth + 1}px`,
					maxHeight: `${maxHeight + 1}px`,
					// width: `${maxWidth}px`,
					// height: `${maxHeight}px`,
					width: `${container.getWidth() / editorScale}px`,
					height: `${container.getHeight() / editorScale}px`,

					transformOrigin: "left top",
					// transform: `scale(${editorScale})`,
					"--webkit-font-smoothing": "antialiased",
					fontKerning: "auto",

					display: "flex",
					alignItems: verticalAlignmentToFlex(verticalAlignment), // vertical
					justifyContent: "center", // horisontal

					fontFamily: defaultTextStyle.fontFamily,
					fontSize: `${defaultTextStyle.fontSize}px`,
					lineHeight: defaultTextStyle.lineHeight,
					color: defaultTextStyle.fontColor,
					pointerEvents: "none",

					willChange: "transform",
					transform: "translate3d(0,0,0)",
				}}
			>
				<div
					ref={this.editableRef}
					style={{
						width: "100%",
						height: "100%",
						display: "flex",
						justifyContent: "center", // horisontal
						alignItems: verticalAlignmentToFlex(verticalAlignment),
						transform: `translate(0px) scale(${editorScale})`,
						transformOrigin: `left top`,
						pointerEvents: "all",
					}}
				>
					<Slate
						editor={text.editor.editor}
						value={text.getText()}
						selection={text.editor.editor.selection}
						key={text.getId()}
						onChange={() => {}}
					>
						<Editable
							renderElement={Element}
							renderLeaf={Leaf}
							selection={text.editor.editor.selection}
							onBlur={text.handleBlur}
							onFocus={text.handleFocus}
							placeholder={text.placeholderText}
							renderPlaceholder={({ children, attributes }) => (
								<span
									{...attributes}
									style={{
										position: "absolute",
										whiteSpace: "nowrap",
										opacity: 0.33,
										maxWidth: "100%",
										textDecoration: "none",
										userSelect: "none",
										pointerEvents: "none",
									}}
								>
									{children}
								</span>
							)}
							style={{
								whiteSpace: "pre-wrap",
								overflowWrap: "break-word",
								wordBreak: "normal",
								width: "100%",
								maxHeight: !text.getAutosize()
									? `${maxHeight + 1}px`
									: "none",
								overflowY: !text.getAutosize()
									? "auto"
									: "visible",
								// transform: `scale(${editorScale})`,
								// transformOrigin: `left top`,
							}}
							autoFocus={
								this.props.text.getLastClickPoint()
									? false
									: true
							}
						/>
					</Slate>
				</div>
			</div>
			// </div>
		);
	}
}
