import React from "react";
import sprite from "./sprite.svg";

export type IconId =
	| "Select"
	| "Pen"
	| "Text"
	| "Shape"
	| "Connector"
	| "Sticker"
	| "Frame"
	| "Image"
	| "Undo"
	| "Redo"
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
	| "addButton"
	| "canEdit"
	| "canView"
	| "checkMark"
	| "BurgerMenu"
	| "miro"
	| "loader"
	| "Info"
	| "lock"
	| "unlock";

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
	height = 24,
	width = 24,
}: Props): React.ReactElement {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width={width}
			height={height}
			style={style}
			className={className}
		>
			<use
				width={width}
				height={height}
				xlinkHref={`${sprite}#${iconName}`}
			/>
		</svg>
	);
}
