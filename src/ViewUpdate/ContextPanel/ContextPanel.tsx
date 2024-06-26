import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "Board/useBoardSubscription";
import React, { useRef, useState } from "react";
import { useAppContext } from "ViewUpdate/AppContext";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import { UiSeparator } from "ViewUpdate/Ui/UiSeparator/UiSeparator";
import { ConnectorType } from "./Buttons/ConnectorType";
import { Delete } from "./Buttons/Delete";
import { DrawFillStyle } from "./Buttons/DrawFillStyle";
import { DrawStrokeWidth } from "./Buttons/DrawStrokeWidth/DrawStrokeWidth";
import { Duplicate } from "./Buttons/Duplicate";
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

	const isInvisible =
		board.selection.getContext() === "None" ||
		board.selection.getContext() === "SelectUnderPointer";

	if (isInvisible) {
		return null;
	}

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
			>
				{isText && (
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
				{isSticker && (
					<>
						<FontSize rounded="left" />
						<UiSeparator vertical />
						<FontStyle />
						<TextAlignment />
						<UiSeparator vertical />
						<TextColor />
						<TextHighlight />
						<UiSeparator vertical />
						<StickerFillStyle />
						<UiSeparator vertical />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isShape && (
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
				{isConnector && (
					<>
						<StartPointer />
						<SwitchPointers />
						<EndPointer />
						<UiSeparator vertical />
						<ConnectorType />
						<UiSeparator vertical />
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
				{isPen && (
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
				{isImage && (
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
				{isFrame && (
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
				{isDifferentItems && <RestOptionsMenu rounded="full" />}
			</UiPanel>
		</PanelContext.Provider>
	);
}
