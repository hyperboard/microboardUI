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
import { Mbr } from "Board/Items";

type ContextPanelProps = {
	board: Board;
	app: App;
};

export function ContextPanel({ board, app }: ContextPanelProps) {
	const [openedMenu, setOpenedMenu] = useState("None");
	const panelRef = useRef<HTMLDivElement>(null);
	const mbr = useDomMbr({ app, board, ref: panelRef });

	const [updatedMbr, setUpdatedMbr] = React.useState<Mbr>(new Mbr());
	const [shouldUpd, setShouldUpd] = React.useState<boolean>(true);
	const [counter, setCounter] = React.useState(0);
	// mbr changes twice(?) by clicking shevrone, so skip 2 changes to not move Panel on clicking shevrone
	React.useEffect(() => {
		if (shouldUpd) {
			setUpdatedMbr(mbr);
		} else {
			if (counter % 2 === 0) {
				setShouldUpd(true);
			}
			setCounter(counter + 1);
		}
	}, [mbr]);

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
	const isDifferentItems =
		!isText && !isSticker && !isShape && !isConnector && !isPen && !isImage;
	return (
		<PanelContext.Provider
			value={{
				openedMenu,
				board,
				panelMbr: updatedMbr,
				toggleMenu,
				windowHeight,
			}}
		>
			<UiPanel
				style={{
					position: "absolute",
					left: updatedMbr.left,
					top: updatedMbr.top,
				}}
				ref={panelRef}
			>
				{isText && (
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
				{isSticker && (
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
				{isShape && (
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
				{isConnector && (
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
				{isPen && (
					<>
						<DrawStrokeWidth />
						<UiSeparator vertical />
						<DrawFillStyle />
						<UiSeparator vertical />
						<RestOptionsMenu />
					</>
				)}
				{isImage && (
					<>
						<Duplicate />
						<RestOptionsMenu />
						<UiSeparator vertical />
						<Delete />
					</>
				)}
				{isDifferentItems && (
					<>
						<Duplicate />
						<RestOptionsMenu />
						<UiSeparator vertical />
						<Delete />
					</>
				)}
			</UiPanel>
		</PanelContext.Provider>
	);
}
