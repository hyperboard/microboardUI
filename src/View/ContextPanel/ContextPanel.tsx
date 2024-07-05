import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "Board/useBoardSubscription";
import React, { useRef, useState } from "react";
import { useAppContext } from "View/AppContext";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator/UiSeparator";
import { ConnectorAddText } from "./Buttons/ConnectorAddText";
import { ConnectorType } from "./Buttons/ConnectorType";
import { Delete } from "./Buttons/Delete";
import { DrawFillStyle } from "./Buttons/DrawFillStyle";
import { DrawStrokeWidth } from "./Buttons/DrawStrokeWidth/DrawStrokeWidth";
import { Duplicate } from "./Buttons/Duplicate";
import { Edit } from "./Buttons/Edit";
import { EndPointer } from "./Buttons/EndPointer";
import { FillStyle } from "./Buttons/FillStyle";
import { FontSize } from "./Buttons/FontSize";
import { FontStyle } from "./Buttons/FontStyle";
import { FrameFill } from "./Buttons/FrameFill";
import { FrameRatio } from "./Buttons/FrameRatio";
import { ItemType } from "./Buttons/ItemType/ItemType";
import { RestOptionsMenu } from "./Buttons/RestOptionsMenu";
import {
	BringToFront,
	CopyFrameLink,
	ExportFrame,
	SendToBack,
} from "./Buttons/RestOptionsMenu/Items";
import { StartPointer } from "./Buttons/StartPointer/StartPointer";
import { StickerFillStyle } from "./Buttons/StickerFillStyle";
import { StrokeStyle } from "./Buttons/StrokeStyle";
import { SwitchPointers } from "./Buttons/SwitchPointers";
import { TextAlignment } from "./Buttons/TextAlignment/TextAlignment";
import { TextColor } from "./Buttons/TextColor";
import { TextHighlight } from "./Buttons/TextHighlight";
import { ToggleFrameRatio } from "./Buttons/ToggleFrameRatio";
import { PanelContext } from "./PanelContext";

export function ContextPanel() {
	const { app, board } = useAppContext();
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

	const isInvisible = board.selection.getContext() === "None";

	if (isInvisible) {
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
	const isFrame = board.selection.items.isAllItemsType("Frame");
	const isDifferentItems =
		!isText &&
		!isSticker &&
		!isShape &&
		!isConnector &&
		!isPen &&
		!isImage &&
		!isFrame;
	return (
		<PanelContext.Provider
			value={{
				openedMenu,
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
				padding={0}
				id="ContextPanel"
			>
				{isSelectUnderPointer && (
					<>
						<Edit />
						<RestOptionsMenu rounded="right">
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isText && !isSelectUnderPointer && (
					<>
						<FontSize rounded="left" />
						<FontStyle />
						<TextAlignment />
						<UiSeparator vertical />
						<TextColor />
						<TextHighlight />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isSticker && !isSelectUnderPointer && (
					<>
						<FontSize rounded="left" />
						<UiSeparator vertical />
						<FontStyle />
						<TextAlignment />
						<UiSeparator vertical />
						<TextColor />
						<TextHighlight />
						<UiSeparator vertical />
						<Duplicate />
						<StickerFillStyle />
						<UiSeparator vertical />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isShape && !isSelectUnderPointer && (
					<>
						<ItemType />
						<UiSeparator vertical />
						<FontSize />
						<UiSeparator vertical />
						<FontStyle />
						<TextAlignment />
						<UiSeparator vertical />
						<TextColor />
						<TextHighlight />
						<UiSeparator vertical />
						<StrokeStyle />
						<FillStyle />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isConnector && !isSelectUnderPointer && (
					<>
						<StartPointer />
						<SwitchPointers />
						<EndPointer />
						<UiSeparator vertical />
						<ConnectorType />
						<UiSeparator vertical />
						<ConnectorAddText />
						<FontSize />
						<FontStyle />
						<UiSeparator vertical />
						<TextColor />
						<TextHighlight />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isPen && !isSelectUnderPointer && (
					<>
						<DrawStrokeWidth />
						<UiSeparator vertical />
						<DrawFillStyle />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isImage && !isSelectUnderPointer && (
					<>
						<Duplicate rounded="left" />
						<Delete />
						<UiSeparator vertical />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isFrame && !isSelectUnderPointer && (
					<>
						<FrameRatio />
						<ToggleFrameRatio />
						<UiSeparator vertical />
						<FrameFill />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyFrameLink />
							<ExportFrame />
						</RestOptionsMenu>
					</>
				)}
				{isDifferentItems && !isSelectUnderPointer && (
					<RestOptionsMenu rounded="full">
						<BringToFront />
						<SendToBack />
					</RestOptionsMenu>
				)}
			</UiPanel>
		</PanelContext.Provider>
	);
}
