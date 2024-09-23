import React from "react";
import { Slate, Editable } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { App } from "App";
import { Board } from "Board";
import { verticalAlignmentToFlex } from "./verticalAlignmentToFlex";
import { RichText } from "Board/Items/RichText/RichText";
import { DEFAULT_TEXT_STYLES } from "View/Items/RichText";
import styles from "./TextEditor.module.css";
import clsx from "clsx";

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
		const { point, height, maxWidth, maxHeight, textScale } =
			text.getDimensions();
		const textWhiteSpace = text.frameMbr ? "pre" : "pre-wrap";
		point.transform(camera.getMatrix());
		const left = point.x;
		/** A heuristic trick to better align editor with canvas */
		const top = point.y - 0.8 * camera.getScale();
		const editorScale = textScale * camera.getScale();
		const verticalAlignment = text.getVerticalAlignment();

		const container = text.getTransformedContainer();
		container.transform(camera.getMatrix());
		const editorHeight = text.frameMbr
			? height
			: container.getHeight() / editorScale;
		// @ts-expect-error maxHeight undefined
		const editorMaxHeight = text.frameMbr ? height : maxHeight + 1;
		const editorWidth =
			text.insideOf === "Sticker"
				? container.getWidth() / editorScale
				: Math.ceil(container.getWidth() / editorScale);
		const editorMaxWidth =
			// @ts-expect-error maxWidth undefined
			text.insideOf === "Sticker" ? maxWidth : Math.ceil(maxWidth);

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

						// @ts-expect-error maxWidth undefined
						maxWidth: `${Math.ceil(maxWidth)}px`,
						maxHeight: `${maxHeight}px`,
						// @ts-expect-error maxWidth undefined
						width: `${Math.ceil(maxWidth)}px`,
						height: `${maxHeight}px`,

						// transformOrigin: "left top",
						// transform: `translate(0px) scale(${editorScale})`,
						willChange: "transform",
						transform: "translate3d(0,0,0)",

						display: "flex",
						alignItems: verticalAlignmentToFlex(verticalAlignment), // vertical
						justifyContent: "center", // horisontal

						fontFamily: DEFAULT_TEXT_STYLES.fontFamily,
						fontSize: `${DEFAULT_TEXT_STYLES.fontSize}px`,
						lineHeight: DEFAULT_TEXT_STYLES.lineHeight,
						color: DEFAULT_TEXT_STYLES.fontColor,
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

					maxWidth: `${editorMaxWidth}px`,
					maxHeight: `${editorMaxHeight}px`,
					// width: `${maxWidth}px`,
					// height: `${maxHeight}px`,
					width: `${editorWidth}px`,
					height: `${editorHeight}px`,

					transformOrigin: "left top",
					// transform: `scale(${editorScale})`,
					WebkitFontSmoothing: "antialiased",
					fontKerning: "auto",

					display: "flex",
					alignItems: verticalAlignmentToFlex(verticalAlignment), // vertical
					justifyContent: "center", // horisontal

					fontFamily: DEFAULT_TEXT_STYLES.fontFamily,
					fontSize: `${DEFAULT_TEXT_STYLES.fontSize}px`,
					lineHeight: DEFAULT_TEXT_STYLES.lineHeight,
					color: DEFAULT_TEXT_STYLES.fontColor,
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
						fontSize:
							((text.getTextString().length === 0
								? text.getFontSize()
								: text.getMinFontSize()) /
								editorScale) *
							camera.getScale(),
					}}
					className={clsx(
						styles.editorContainer,
						text.getTextString().length === 0 &&
							styles.showPlaceholder,
					)}
					data-placeholder={text.placeholderText}
				>
					<Slate
						editor={text.editor.editor}
						value={text.getText()}
						key={text.getId()}
						onChange={() => {}}
					>
						<Editable
							renderElement={Element}
							renderLeaf={Leaf}
							onBlur={text.handleBlur}
							onFocus={text.handleFocus}
							className={text.frameMbr && styles.scrollContainer}
							// placeholder={text.placeholderText}
							// renderPlaceholder={({ children, attributes }) => (
							// 	<span
							// 		{...attributes}
							// 		style={{
							// 			position: "absolute",
							// 			left: 0,
							// 			right: 0,
							// 			top: 0,
							// 			zIndex: 0,
							// 			display: "inline-block",
							// 			width: 0,
							// 			whiteSpace: "nowrap",
							// 			opacity: 0.33,
							// 			maxWidth: "100%",
							// 			textDecoration: "none",
							// 			userSelect: "none",
							// 			pointerEvents: "none",
							// 			fontSize: "inherit",
							// 		}}
							// 	>
							// 		{children}
							// 	</span>
							// )}
							style={{
								whiteSpace: textWhiteSpace,
								// overflowWrap: "break-word",
								// wordBreak: "normal",
								width: "100%",
								maxHeight: !text.getAutosize()
									? `${editorMaxHeight}px`
									: "none",
								// overflow: `${text.frameMbr ? 'hidden' : 'unset'}`,
								overflowY: !text.getAutosize()
									? "auto"
									: "visible",
								// fontSize: "inherit",
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
