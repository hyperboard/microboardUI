import React from "react";
import { Slate, Editable } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { App } from "App";
import { Board } from "Board";
import { verticalAlignmentToFlex } from "./verticalAlignmentToFlex";
import { DEFAULT_TEXT_STYLES, RichText } from "Board/Items/RichText/RichText";
import styles from "./TextEditor.module.css";
import clsx from "clsx";
import { Icon } from "shared/ui-lib/Icon";
import { tryToPasteAsItemOrReturnText } from "App/Paste";
import { Transforms } from "slate";
import { EditorContainer } from "Board/Items/RichText/EditorContainer";
import { t } from "i18next";
import { BlockNode } from "Board/Items/RichText/Editor/BlockNode";
import { HyperLinkCreationData } from "features/hyperLink/HyperLinkContext";
import { SETTINGS } from "Board/Settings";

export class TextEditors extends React.Component<
	{
		app: App;
		board: Board;
		setQuotedText: (text: string) => void;
		setHyperLinkData: (data: HyperLinkCreationData | null) => void;
		hyperLinkData: HyperLinkCreationData | null;
		sendGenerationRequest: () => void;
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
			Editors = (
				<TextEditor
					board={this.props.board}
					text={text}
					setQuotedText={this.props.setQuotedText}
					setHyperLinkData={this.props.setHyperLinkData}
					hyperLinkData={this.props.hyperLinkData}
					sendGenerationRequest={this.props.sendGenerationRequest}
				/>
			);
		}
		return Editors;
	}
}

export class TextEditor extends React.Component<
	{
		board: Board;
		text: RichText;
		setQuotedText: (text: string) => void;
		setHyperLinkData: (data: HyperLinkCreationData | null) => void;
		hyperLinkData: HyperLinkCreationData | null;
		sendGenerationRequest: () => void;
	},
	{
		hasError: boolean;
		limitReached: boolean;
		timeoutId: NodeJS.Timeout | null;
		buttonPosition: { top: number; left: number } | null;
		isButtonVisible: boolean;
		isQuoteBtnTooltipVisible: boolean;
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

	componentWillUnmount(): void {
		if (this.props.hyperLinkData) {
			this.props.setHyperLinkData({
				...this.props.hyperLinkData,
				isWatchMode: false,
			});
		} else {
			this.updateHyperLinkDataFromSelectionAnchor(
				this.props.text.editor,
				false,
			);
		}
		if (this.state.timeoutId) {
			clearTimeout(this.state.timeoutId);
		}
	}

	state = {
		hasError: false,
		limitReached: false,
		timeoutId: null,
		buttonPosition: null,
		isButtonVisible: false,
		isQuoteBtnTooltipVisible: false,
	};

	containerRef = React.createRef<HTMLDivElement>();
	editableRef = React.createRef<HTMLDivElement>();

	getSlateSelectionRect(editor: EditorContainer) {
		if (!editor.getSelection() || !editor.hasTextInSelection()) {
			return null;
		}

		const domSelection = window.getSelection();
		if (!domSelection || domSelection.rangeCount === 0) {
			return null;
		}

		const range = domSelection.getRangeAt(0);
		const clientRects = range.getClientRects();

		if (clientRects.length === 0) {
			return null;
		}

		const firstRect = clientRects[0];
		const lastRect = clientRects[clientRects.length - 1];

		return {
			firstRect,
			lastRect,
		};
	}

	updateHyperLinkDataFromSelectionAnchor(
		editor: EditorContainer,
		isWatchMode: boolean,
	) {
		const link = editor.getFirstSelectionLink(editor.getSelection());
		if (link) {
			const selection = window.getSelection();
			if (!selection) {
				return;
			}
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			this.props.setHyperLinkData({
				inputPosition: {
					top: rect.bottom,
					left: rect.left,
				},
				selection: editor.getLinkNodeRange(),
				isWatchMode,
			});
		} else {
			this.props.setHyperLinkData(null);
		}
	}

	handleSelectionChange = (): void => {
		const editor = this.props.text.editor;
		const rects = this.getSlateSelectionRect(editor);

		if (rects) {
			const { firstRect, lastRect } = rects;
			this.setState({
				buttonPosition: {
					top: firstRect.top + window.scrollY - 40,
					left:
						(firstRect.left + firstRect.right) / 2 + window.scrollX,
				},
				isButtonVisible: true,
			});
			this.props.setHyperLinkData({
				inputPosition: {
					top: lastRect.bottom,
					left: lastRect.left,
				},
				selection: structuredClone(editor.getSelection()),
				isWatchMode: false,
			});
		} else {
			this.setState({ isButtonVisible: false });
			this.updateHyperLinkDataFromSelectionAnchor(editor, true);
		}
	};

	onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): boolean => {
		const text = this.props.text;
		if (event.key === "Enter" && text.insideOf === "Frame") {
			event.preventDefault();
			event.stopPropagation();
			this.props.board.selection.setContext("EditUnderPointer");
			return true;
		}
		if (
			event.key === "Enter" &&
			!event.shiftKey &&
			text.insideOf === "AINode"
		) {
			event.preventDefault();
			event.stopPropagation();
			this.props.board.selection.setContext("EditUnderPointer");
			this.props.sendGenerationRequest();
			return true;
		}
		if (text.editor.isEmpty() && !event.ctrlKey) {
			event.preventDefault();
			event.stopPropagation();
			if (event.key.length === 1 || event.key === "Space") {
				Transforms.insertText(text.editor.editor, event.key, {
					at: [0, 0],
				});
				Transforms.removeNodes(text.editor.editor, {
					match: node => node.type === "text" && node.text === "",
				});
				text.editor.moveCursorToEndOfTheText();
			}
			return true;
		}
		return false;
	};

	onPaste = async (event): Promise<void | boolean> => {
		const board = this.props.board;

		// TODO: actually check login
		const data = await tryToPasteAsItemOrReturnText(event, board, true);

		event.preventDefault();
		event.stopPropagation();
		if (!data) {
			return;
		}

		const richText = this.props.text;

		const slateFragment = data.getData("application/x-slate-fragment");
		if (slateFragment) {
			try {
				const nodes: BlockNode[] = JSON.parse(
					decodeURIComponent(window.atob(slateFragment)),
				);
				return richText.editor.insertCopiedNodes(nodes);
			} catch (error) {
				console.error("Error while parsing slate nodes:", error);
			}
		}

		let text = data.getData("text/plain");
		if (!text) {
			return;
		}

		if (richText.insideOf === "Frame") {
			text = text.replace(/\n+/g, " ").trim();
		}

		if (
			SETTINGS.URL_REGEX.test(text) &&
			richText.editor.hasTextInSelection()
		) {
			board.selection.setHyperLink(text, richText.editor.getSelection());
		} else {
			Transforms.insertText(richText.editor.editor, text);
		}

		return false;
	};

	render(): React.ReactElement | null {
		const text = this.props.text;
		if (!text) {
			return null;
		}

		const onQuoteBtnClick = (): void => {
			const selection = window.getSelection();
			if (selection) {
				this.props.setQuotedText(selection.toString());
			}
		};

		const { buttonPosition, isButtonVisible } = this.state;
		const { camera } = this.props.board;
		const { point, height, maxWidth, maxHeight, textScale } =
			text.getDimensions();
		const isInsideOfFrame = text.insideOf === "Frame";
		const textWhiteSpace = isInsideOfFrame ? "pre" : "pre-wrap";
		point.transform(camera.getMatrix());
		const left = point.x;
		/** A heuristic trick to better align editor with canvas */
		const top = point.y - 0.8 * camera.getScale();
		const editorScale = textScale * camera.getScale();
		const verticalAlignment = text.getVerticalAlignment();

		text.onLimitReached = () => {
			if (this.state.timeoutId) {
				clearTimeout(this.state.timeoutId);
			}

			this.setState({ limitReached: false }, () => {
				this.setState({ limitReached: true });
			});

			const newTimeoutId = setTimeout(() => {
				this.setState({ limitReached: false, timeoutId: null });
			}, 3000);

			this.setState({ timeoutId: newTimeoutId });
		};

		const container = text.getTransformedContainer();
		container.transform(camera.getMatrix());
		const editorHeight = isInsideOfFrame
			? height
			: container.getHeight() / editorScale;
		// @ts-expect-error maxHeight undefined
		const editorMaxHeight = isInsideOfFrame ? height : maxHeight + 1;
		const editorWidth =
			text.insideOf === "Sticker"
				? container.getWidth() / editorScale
				: Math.floor(container.getWidth() / editorScale);
		const editorMaxWidth =
			// @ts-expect-error maxWidth undefined
			text.insideOf === "Sticker" ? maxWidth : Math.floor(maxWidth);

		if (this.state.hasError) {
			return (
				<div
					id="TextEditor"
					ref={this.containerRef}
					className="notranslate"
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
			<>
				<div
					id="TextEditor"
					ref={this.containerRef}
					className="notranslate"
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

						maxWidth: `${Math.ceil(editorMaxWidth)}px`,
						maxHeight: `${editorMaxHeight}px`,
						width: `${Math.ceil(editorWidth) + ((text.shouldShrink() && 2) || 0)}px`,
						// width: `${Math.ceil(editorWidth)}px`,
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
						lineHeight:
							text.isAutosize() && text.getAutoSizeScale() < 1
								? DEFAULT_TEXT_STYLES.lineHeight *
									text.getAutoSizeScale()
								: DEFAULT_TEXT_STYLES.lineHeight,
						color: DEFAULT_TEXT_STYLES.fontColor,
						pointerEvents: "none",

						willChange: "transform",
						transform: "translate3d(0,0,0)",
					}}
				>
					<div
						ref={this.editableRef}
						style={{
							position: "relative",
							width: "100%",
							height: "100%",
							display: "flex",
							justifyContent: "center", // horisontal
							alignItems:
								verticalAlignmentToFlex(verticalAlignment),
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
							onChange={this.handleSelectionChange}
						>
							<Editable
								renderElement={Element}
								renderLeaf={props => (
									<Leaf
										fontSize={text.getFontSize()}
										isAutoSize={text.isAutosize()}
										{...props}
									/>
								)}
								onBlur={text.handleBlur}
								onFocus={text.handleFocus}
								className={
									isInsideOfFrame
										? styles.scrollContainer
										: ""
								}
								onKeyDown={this.onKeyDown}
								onPaste={this.onPaste}
								style={{
									whiteSpace: textWhiteSpace,
									// overflowWrap: "break-word",
									// wordBreak: "normal",
									width: "100%",
									maxHeight: `${editorMaxHeight}px`,
									// overflow: `${text.frameMbr ? 'hidden' : 'unset'}`,
									overflowY: !text.isAutosize()
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
					<Icon
						iconName="TextLimitWarning"
						width={this.editableRef.current?.offsetWidth}
						height={this.editableRef.current?.offsetHeight}
						className={clsx(
							styles.limitWarning,
							this.state.limitReached && styles.show,
						)}
						style={{
							transform: `translate(0px) scale(${editorScale})`,
						}}
					/>
				</div>
				{isButtonVisible &&
					buttonPosition &&
					text.insideOf === "AINode" && (
						<button
							onMouseEnter={() =>
								this.setState({
									isQuoteBtnTooltipVisible: true,
								})
							}
							onMouseLeave={() =>
								this.setState({
									isQuoteBtnTooltipVisible: false,
								})
							}
							className={styles.quoteBtn}
							onClick={onQuoteBtnClick}
							style={{
								top: buttonPosition.top,
								left: buttonPosition.left,
							}}
						>
							{this.state.isQuoteBtnTooltipVisible && (
								<div className={styles.tooltip}>
									{t("AIInput.quoteBtnTooltip")}
								</div>
							)}
							<svg
								width="16"
								height="16"
								viewBox="0 0 12 10"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10.9485 1.45275C11.6352 2.18208 12.0039 3.00008 12.0039 4.32608C12.0039 6.65942 10.3659 8.75075 7.98385 9.78475L7.38852 8.86608C9.61185 7.66341 10.0465 6.10275 10.2199 5.11875C9.86185 5.30408 9.39319 5.36875 8.93385 5.32608C7.73119 5.21475 6.78319 4.22741 6.78319 3.00008C6.78319 2.38124 7.02902 1.78775 7.4666 1.35017C7.90419 0.912581 8.49768 0.666748 9.11652 0.666748C9.83185 0.666748 10.5159 0.993415 10.9485 1.45275ZM4.28185 1.45275C4.96852 2.18208 5.33719 3.00008 5.33719 4.32608C5.33719 6.65942 3.69919 8.75075 1.31719 9.78475L0.721854 8.86608C2.94519 7.66341 3.37985 6.10275 3.55319 5.11875C3.19519 5.30408 2.72652 5.36875 2.26719 5.32608C1.06452 5.21475 0.117188 4.22741 0.117188 3.00008C0.117188 2.38124 0.36302 1.78775 0.800605 1.35017C1.23819 0.912581 1.83168 0.666748 2.45052 0.666748C3.16585 0.666748 3.84985 0.993415 4.28252 1.45275H4.28185Z"
									fill="#696B76"
								/>
							</svg>
						</button>
					)}
			</>
			// </div>
		);
	}
}
