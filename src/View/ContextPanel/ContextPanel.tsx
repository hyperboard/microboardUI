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
import { Lock } from "./Buttons/Lock";
import { ConnectorLineColor } from "./Buttons/ConnectorLineColor";
import { ConnectorFontStyle } from "./Buttons/ConnectorFontStyle";
import { ConnectorFontSize } from "./Buttons/FontSize";
import { ConnectorTextColor } from "./Buttons/ConnectorTextColor";
import { ConnectorTextHighlight } from "./Buttons/ConnectorTextHighlight";
import { CopyItemLink } from "./Buttons/RestOptionsMenu/Items/CopyItemLink";
import { SetLinkTo } from "./Buttons/RestOptionsMenu/Items/SetLinkTo";
import { RemoveLinkTo } from "./Buttons/RestOptionsMenu/Items/RemoveLinkTo";

export function ContextPanel() {
	const { app, board } = useAppContext();
	const [openedMenu, setOpenedMenu] = useState("None");
	const panelRef = useRef<HTMLDivElement>(null);
	const mbr = useDomMbr({
		app,
		board,
		ref: panelRef,
	});
	useAppSubscription({
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
		board.selection.transformationRenderBlock;

	if (isInvisible) {
		return null;
	}

	const isLocked = board.selection.items
		.list()
		.filter(item => item.transformation.isLocked).length;

	const isSelectUnderPointer =
		board.selection.getContext() === "SelectUnderPointer";

	const isHoverUnderPointer =
		board.selection.getContext() === "HoverUnderPointer";

	const hasLinkTo = () => {
		const items = board.selection.items.list();
		return !!(items.length === 1 && items[0].getLinkTo());
	};

	const isText = board.selection.items.isAllItemsType("RichText");
	const isSticker = board.selection.items.isAllItemsType("Sticker");
	const isShape = board.selection.items.isAllItemsType("Shape");
	const isConnector = board.selection.items.isAllItemsType("Connector");
	const isPen = board.selection.items.isAllItemsType("Drawing");
	const isImage = board.selection.items.isAllItemsType("Image");
	const isFrame = board.selection.items.isAllItemsType("Frame");
	const isPlaceholder = board.selection.items.isAllItemsType("Placeholder");
	const isDifferentItems =
		!isText &&
		!isSticker &&
		!isShape &&
		!isConnector &&
		!isPen &&
		!isImage &&
		!isFrame &&
		!isPlaceholder;

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
				zIndex={3}
				ref={panelRef}
				padding={0}
				id="ContextPanel"
			>
				{isSelectUnderPointer && !isLocked && (
					<>
						<Edit />
						<RestOptionsMenu rounded="right">
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isPlaceholder && !isSelectUnderPointer && !isLocked && (
					<>
						<Lock rounded="left" />
						<UiSeparator vertical />
						<Delete />
						<RestOptionsMenu rounded="right">
							<BringToFront />
							<SendToBack />
						</RestOptionsMenu>
					</>
				)}
				{isText && !isSelectUnderPointer && !isLocked && (
					<>
						<FontSize rounded="left" />
						<FontStyle />
						<TextAlignment />
						<UiSeparator vertical />
						<TextColor />
						<TextHighlight />
						<UiSeparator vertical />
						<Lock />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
						</RestOptionsMenu>
					</>
				)}
				{isSticker && !isSelectUnderPointer && !isLocked && (
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
						<Lock />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
						</RestOptionsMenu>
					</>
				)}
				{isShape && !isSelectUnderPointer && !isLocked && (
					<>
						<ItemType />
						<UiSeparator vertical />
						{board.selection.items
							.getItemsByItemTypes(["Shape"])[0]
							.getIsShapeWithText() && (
							<>
								<FontSize />
								<UiSeparator vertical />
								<FontStyle />
								<TextAlignment />
								<UiSeparator vertical />
								<TextColor />
								<TextHighlight />
								<UiSeparator vertical />
							</>
						)}
						<StrokeStyle />
						{board.selection.items
							.getItemsByItemTypes(["Shape"])[0]
							.getPath()
							.isClosed() && <FillStyle />}
						<UiSeparator vertical />
						<Lock />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
						</RestOptionsMenu>
					</>
				)}
				{isConnector && !isSelectUnderPointer && !isLocked && (
					<>
						<StartPointer />
						<SwitchPointers />
						<EndPointer />
						<UiSeparator vertical />
						<ConnectorType />
						<ConnectorLineColor />
						<UiSeparator vertical />
						<ConnectorAddText />
						<ConnectorFontSize />
						<ConnectorFontStyle />
						<ConnectorTextColor />
						<ConnectorTextHighlight />
						<UiSeparator vertical />
						<Lock />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
						</RestOptionsMenu>
					</>
				)}
				{isPen && !isSelectUnderPointer && !isLocked && (
					<>
						<DrawStrokeWidth />
						<UiSeparator vertical />
						<DrawFillStyle />
						<UiSeparator vertical />
						<Lock />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
						</RestOptionsMenu>
					</>
				)}
				{isImage && !isSelectUnderPointer && !isLocked && (
					<>
						<Lock rounded="left" />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<UiSeparator vertical />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
						</RestOptionsMenu>
					</>
				)}
				{isFrame && !isSelectUnderPointer && !isLocked && (
					<>
						<FrameRatio />
						<ToggleFrameRatio />
						<UiSeparator vertical />
						<FrameFill />
						<UiSeparator vertical />
						<Lock />
						<UiSeparator vertical />
						<Duplicate />
						<Delete />
						<RestOptionsMenu>
							<BringToFront />
							<SendToBack />
							<CopyItemLink />
							<SetLinkTo />
							{hasLinkTo() && <RemoveLinkTo />}
							<ExportFrame />
						</RestOptionsMenu>
					</>
				)}
				{!isDifferentItems && !!isLocked && (
					<>
						<Lock rounded="left" />
						<UiSeparator vertical />
						<Duplicate rounded={isLocked > 1 ? "right" : "none"} />
						{isLocked <= 1 ? (
							<RestOptionsMenu rounded="right">
								<CopyItemLink />
								<ExportFrame />
							</RestOptionsMenu>
						) : null}
					</>
				)}
				{isDifferentItems &&
					!isSelectUnderPointer &&
					!isHoverUnderPointer && (
						<>
							<Lock rounded="left" />
							<UiSeparator vertical />
							<Duplicate />
							<Delete />
							<RestOptionsMenu rounded="full">
								<BringToFront />
								<SendToBack />
							</RestOptionsMenu>
						</>
					)}
			</UiPanel>
		</PanelContext.Provider>
	);
}
