import { App } from "App";
import { Board } from "Board";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "Board/useBoardSubscription";
import React, { useRef, useState } from "react";
import { ConnectorAddText } from "ViewTalkIntegration/ContextPanel/Buttons/ConnectorAddText";
import { ConnectorType } from "ViewTalkIntegration/ContextPanel/Buttons/ConnectorType";
import { DrawFillStyle } from "ViewTalkIntegration/ContextPanel/Buttons/DrawFillStyle";
import { DrawStrokeWidth } from "ViewTalkIntegration/ContextPanel/Buttons/DrawStrokeWidth";
import { Edit } from "ViewTalkIntegration/ContextPanel/Buttons/Edit";
import { EndPointer } from "ViewTalkIntegration/ContextPanel/Buttons/EndPointer";
import { FillStyle } from "ViewTalkIntegration/ContextPanel/Buttons/FillStyle";
import { FontSize } from "ViewTalkIntegration/ContextPanel/Buttons/FontSize";
import { FontStyle } from "ViewTalkIntegration/ContextPanel/Buttons/FontStyle";
import { ItemType } from "ViewTalkIntegration/ContextPanel/Buttons/ItemType";
import { RestOptionsMenu } from "ViewTalkIntegration/ContextPanel/Buttons/RestOptionsMenu";
import { StartPointer } from "ViewTalkIntegration/ContextPanel/Buttons/StartPointer";
import { StickerFillStyle } from "ViewTalkIntegration/ContextPanel/Buttons/StickerFillStyle";
import { StrokeStyle } from "ViewTalkIntegration/ContextPanel/Buttons/StrokeStyle";
import { SwitchPointers } from "ViewTalkIntegration/ContextPanel/Buttons/SwitchPointers";
import { TextAlignment } from "ViewTalkIntegration/ContextPanel/Buttons/TextAlignment";
import { TextAlignmentSticker } from "ViewTalkIntegration/ContextPanel/Buttons/TextAlignmentSticker";
import { TextColor } from "ViewTalkIntegration/ContextPanel/Buttons/TextColor";
import { TextHighlight } from "ViewTalkIntegration/ContextPanel/Buttons/TextHighlight";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import { UiSeparator } from "ViewTalkIntegration/Ui/UiSeparator";
import { ConnectorFontSize } from "./Buttons/ConnectorFontSize";
import { ConnectorTextColor } from "./Buttons/ConnectorTextColor";
import { Delete } from "./Buttons/Delete";
import { Duplicate } from "./Buttons/Duplicate";
import { StickerFontSize } from "./Buttons/StickerFontSize";
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
		board.selection.getContext() === "None" || !board.selection.isOn;
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
					visibility: isVisible ? "hidden" : "visible",
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
