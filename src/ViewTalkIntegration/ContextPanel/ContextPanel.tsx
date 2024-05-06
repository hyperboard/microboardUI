import { App } from "App";
import { Board } from "Board";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "Board/useBoardSubscription";
import React, { useRef, useState } from "react";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { UiSeparator } from "ViewTalkIntegration/Ui/UiSeparator/UiSeparator";
import { ConnectorAddText } from "./Buttons/ConnectorAddText";
import { ConnectorFontSize } from "./Buttons/ConnectorFontSize";
import { ConnectorTextColor } from "./Buttons/ConnectorTextColor";
import { ConnectorType } from "./Buttons/ConnectorType";
import { Delete } from "./Buttons/Delete";
import { DrawFillStyle } from "./Buttons/DrawFillStyle";
import { DrawStrokeWidth } from "./Buttons/DrawStrokeWidth";
import { Duplicate } from "./Buttons/Duplicate";
import { Edit } from "./Buttons/Edit";
import { EndPointer } from "./Buttons/EndPointer";
import { FillStyle } from "./Buttons/FillStyle";
import { FontSize } from "./Buttons/FontSize";
import { FontStyle } from "./Buttons/FontStyle";
import { ItemType } from "./Buttons/ItemType";
import { RestOptionsMenu } from "./Buttons/RestOptionsMenu";
import { StartPointer } from "./Buttons/StartPointer";
import { StickerFillStyle } from "./Buttons/StickerFillStyle";
import { StickerFontSize } from "./Buttons/StickerFontSize";
import { StrokeStyle } from "./Buttons/StrokeStyle";
import { SwitchPointers } from "./Buttons/SwitchPointers";
import { TextAlignment } from "./Buttons/TextAlignment";
import { TextAlignmentSticker } from "./Buttons/TextAlignmentSticker";
import { TextColor } from "./Buttons/TextColor";
import { TextHighlight } from "./Buttons/TextHighlight";
import { PanelContext } from "./PanelContext";

type ContextPanelProps = {
	board: Board;
	app: App;
};

export function ContextPanel({ board, app }: ContextPanelProps) {
	const [openedMenu, setOpenedMenu] = useState("None");
	const panelRef = useRef<HTMLDivElement>(null);
	const mbr = useDomMbr({ app, board, ref: panelRef });
	useAppSubscription(app, {
		subjects: ["selectionItems"],
		observer: () => {
			setOpenedMenu("None");
		},
	});
	const toggleMenu = (menu: string) =>
		setOpenedMenu(prev => (prev === menu ? "None" : menu));

	const windowHeight = board.camera.window.height;
	const isVisible =
		board.selection.getContext() !== "None" || !board.selection.isOn;
	if (!isVisible) {
		return null;
	}
	const isSelectUnderPointer =
		board.selection.getContext() === "SelectUnderPointer";
	const isText = board.selection.items.isAllItemsType("RichText");
	const isSticker = board.selection.items.isAllItemsType("Sticker");
	const isShape = board.selection.items.isAllItemsType("Shape");
	const isConnector = board.selection.items.isAllItemsType("Connector");
	const isPen = board.selection.items.isAllItemsType("Drawing");
	const isImage = board.selection.items.isAllItemsType("Image");
	const isDifferentItems =
		!isText && !isSticker && !isShape && !isConnector && !isPen && !isImage;

	return (
		<PanelContext.Provider
			value={{
				openedMenu,
				board,
				panelMbr: mbr,
				toggleMenu,
				windowHeight,
			}}
		>
			<UiPanel
				style={{
					position: "absolute",
					left: mbr.left,
					top: mbr.top,
				}}
				ref={panelRef}
			>
				{isSelectUnderPointer && <Edit />}
				{!isSelectUnderPointer && isText && (
					<>
						<FontSize />
						<FontStyle />
						<TextAlignment />
						<TextColor />
						<UiSeparator vertical />
						<TextHighlight />
						<UiSeparator vertical />
						<RestOptionsMenu />
					</>
				)}
				{!isSelectUnderPointer && isSticker && (
					<>
						<StickerFillStyle />
						<UiSeparator vertical />
						<StickerFontSize />
						<FontStyle />
						<TextAlignmentSticker />
						<UiSeparator vertical />
						<RestOptionsMenu />
					</>
				)}
				{!isSelectUnderPointer && isShape && (
					<>
						<ItemType />
						<StrokeStyle />
						<FillStyle />
						<UiSeparator vertical />
						<FontSize />
						<FontStyle />
						<TextAlignment />
						<TextColor />
						<UiSeparator vertical />
						<TextHighlight />
						<UiSeparator vertical />
						<RestOptionsMenu />
					</>
				)}
				{!isSelectUnderPointer && isConnector && (
					<>
						<StartPointer />
						<SwitchPointers />
						<EndPointer />
						<UiSeparator vertical />
						<ConnectorType />
						<UiSeparator vertical />
						<ConnectorFontSize />
						<ConnectorAddText />
						<ConnectorTextColor />
						<UiSeparator vertical />
						<RestOptionsMenu />
					</>
				)}
				{!isSelectUnderPointer && isPen && (
					<>
						<DrawStrokeWidth />
						<UiSeparator vertical />
						<DrawFillStyle />
						<UiSeparator vertical />
						<RestOptionsMenu />
					</>
				)}
				{!isSelectUnderPointer && isImage && (
					<>
						<Duplicate />
						<RestOptionsMenu />
						<UiSeparator vertical />
						<Delete />
					</>
				)}
				{!isSelectUnderPointer && isDifferentItems && (
					<RestOptionsMenu />
				)}
			</UiPanel>
		</PanelContext.Provider>
	);
}
