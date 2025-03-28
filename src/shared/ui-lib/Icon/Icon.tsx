import React from "react";
import sprite from "./sprite.svg";
import styles from "./Icon.module.css";
import clsx from "clsx";

export type IconId =
	| "Select"
	| "Pen"
	| "Eraser"
	| "Highlighter"
	| "Text"
	| "Shape"
	| "Connector"
	| "Sticker"
	| "Frame"
	| "Image"
	| "Undo"
	| "Redo"
	| "Gear"
	| "SidePanelOpen"
	| "SidePanelClose"
	| "Export"
	| "ZoomToFit"
	| "Minus"
	| "Plus"
	| "Close"
	| "Folder"
	| "Chevron"
	| "ContextMenu"
	| "Delete"
	| "Board"
	| "TextStyle"
	| "TextBold"
	| "TextItalic"
	| "TextUnderline"
	| "TextStrike"
	| "TextAlignCenter"
	| "TextAlignLeft"
	| "TextAlignRight"
	| "TextColor"
	| "TextHighlight"
	| "SolidLine"
	| "DashedLine"
	| "DottedLine"
	| "Duplicate"
	| "Dots"
	| "Switch"
	| "DiagonalLine"
	| "CurvedLine"
	| "LockFrameLocked"
	| "LockFrameUnlocked"
	| "Notification"
	| "BringToFront"
	| "SendToBack"
	| "CopyLink"
	| "SaveAsImage"
	| "VerticalAlignTop"
	| "VerticalAlignCenter"
	| "VerticalAlignBottom"
	| "AddText"
	| "Rename"
	| "myBoards"
	| "publicDrafts"
	| "sharedBoards"
	| "import"
	| "modalCross"
	| "Search"
	| "UserPic"
	| "EmbedBoardIcon"
	| "UploadBoardIcon"
	| "EditBoardIcon"
	| "addButton"
	| "canEdit"
	| "canView"
	| "checkMark"
	| "BurgerMenu"
	| "loader"
	| "TextLimitWarning"
	| "lock"
	| "unlock"
	| "ArrowLeft"
	| "ArrowLeft1"
	| "BoxedPlus"
	| "SignIn"
	| "Info"
	| "SendArrow"
	| "CommentTippy"
	| "Comment"
	| "ArrowClock"
	| "MarkAsUnreadComment"
	| "MarkAsReadComment"
	| "linkTo"
	| "AllTemplates"
	| "ResearchAnalysis"
	| "Diagramming"
	| "MeetingWorkshop"
	| "StrategyPlanning"
	| "Brainstorming"
	| "AgileWorkflow"
	| "IcebreakerGame"
	| "Education"
	| "Template"
	| "Planet"
	| "BackArrow"
	| "StrokeChevronDown"
	| "StrokeChevronUp"
	| "human"
	| "ThreeDots"
	| "ArrowUp"
	| "ArrowDown"
	| "People"
	| "Crown"
	| "mark"
	| "drawingPen"
	| "Hand"
	| "GearStroke"
	| "ToggleCursors"
	| "FollowUser"
	| "BringToMe"
	| "EyeDashed"
	| "addLink"
	| "Hyperlink"
	| "EditPen"
	| "StopAiGeneration"
	| "AIChatArrowDisabled"
	| "Vector"
	| "ArrowUpCircle"
	| "ai"
	| "AIChatSendArrow"
	| "ArrowRightFill"
	| "quotedText"
	| "ArrowRight"
	| "ArrowRightSm"
	| "CryptoIcon"
	| "GoogleIcon"
	| "Checkbox"
	| "CheckboxFilled"
	| "Visa"
	| "Mastercard"
	| "XRP"
	| "BTC"
	| "ETH"
	| "POL"
	| "ExportFile"
	| "ExportPNG"
	| "InformationLine"
	| "Dropdown_speech"
	| "Dropdown_img"
	| "Dropdown_texts"
	| "Save";

type Props = {
	iconName: IconId;
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
	className?: string;
};

export function Icon({
	iconName,
	style,
	className,
	height,
	width,
}: Props): React.ReactElement {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width={width}
			height={height}
			style={style}
			className={clsx(className, !width && !height && styles.icon)}
		>
			<use
				width={width}
				height={height}
				xlinkHref={
					window.location.protocol === "file:"
						? `#${iconName}`
						: `${sprite}#${iconName}`
				}
			/>
		</svg>
	);
}
