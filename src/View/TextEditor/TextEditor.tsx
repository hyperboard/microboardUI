import React from "react";
import { Editable, Slate } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { App } from "App";
import { Board } from "Board";
import { verticalAlignmentToFlex } from "./verticalAlignmentToFlex";
import { defaultTextStyle, RichText } from "Board/Items/RichText/RichText";
// import {placeholderText} from "../../Board/Items/RichText/renderElement/Placeholder";

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
		this.props.app.subscribe(this.subscription);
	}

	componentWillUnmount(): void {
		this.props.app.unsubscribe(this.subscription);
	}

	render(): React.ReactElement | null {
		let Editors = null;
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

	state = {
		hasError: false,
	};

	containerRef = React.createRef<HTMLDivElement>();

	render(): React.ReactElement | null {
		const text = this.props.text;
		if (!text) {
			return null;
		}
		const { camera } = this.props.board;
		const leftTopPoint = text.getLeftTopPoint();
		leftTopPoint.transform(camera.getMatrix());
		const left = leftTopPoint.x;
		/** A heuristic trick to better align editor with canvas */
		const top = leftTopPoint.y + 2 * camera.getScale();
		// const top = leftTopPoint.y;
		const { width, height, maxWidth, maxHeight } = text.getDimensions();
		// console.info('TextEditor.render()')
		const textScale = text.isInShape ? 1 : text.getScale();
		const editorScale = textScale * camera.getScale();
		const verticalAlignment = text.getVerticalAlignment();
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

						transformOrigin: "left top",
						transform: `scale(${editorScale})`,

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

					transformOrigin: "left top",
					transform: `scale(${editorScale})`,

					display: "flex",
					alignItems: verticalAlignmentToFlex(verticalAlignment), // vertical
					justifyContent: "center", // horisontal

					fontFamily: defaultTextStyle.fontFamily,
					fontSize: `${defaultTextStyle.fontSize}px`,
					lineHeight: defaultTextStyle.lineHeight,
					color: defaultTextStyle.fontColor,
				}}
			>
				<div
					style={{
						position: "relative",
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: verticalAlignmentToFlex(verticalAlignment),
					}}
				>
					<Slate
						editor={text.editor.editor}
						value={text.getText()}
						selection={text.editor.editor.selection}
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
								<span {...attributes}>{children}</span>
							)}
							style={{
								whiteSpace: "pre-wrap",
								overflowWrap: "break-word",
								wordBreak: "normal",
								width: "100%",
							}}
							autoFocus
						/>
					</Slate>
				</div>
			</div>
		);
	}
}
