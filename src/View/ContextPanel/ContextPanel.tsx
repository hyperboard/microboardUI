import { App } from "App";
import { Board } from "Board";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "Board/useBoardSubscription";
import React, { useRef, useState } from "react";
import { ConnectorAddText } from "./Buttons/ConnectorAddText";
import { ConnectorStyleSeparator } from "./Buttons/ConnectorStyleSeparator";
import { ConnectorType } from "./Buttons/ConnectorType";
import { Delete } from "./Buttons/Delete";
import { Duplicate } from "./Buttons/Duplicate";
import { Edit } from "./Buttons/Edit";
import { EndPointer } from "./Buttons/EndPointer";
import { FillStyle } from "./Buttons/FillStyle";
import { FontSize } from "./Buttons/FontSize";
import { FontStyle } from "./Buttons/FontStyle";
import { ItemType } from "./Buttons/ItemType";
import { ItemTypeSeparator } from "./Buttons/ItemTypeSeparator";
import { PathStyleSeparator } from "./Buttons/PathStyleSeparator";
import { RestOptionsMenu } from "./Buttons/RestOptionsMenu";
import { Scroll } from "./Buttons/Scroll";
import { StartPointer } from "./Buttons/StartPointer";
import { StickerFillStyle } from "./Buttons/StickerFillStyle";
import { StrokeStyle } from "./Buttons/StrokeStyle";
import { SwitchPointers } from "./Buttons/SwitchPointers";
import { TextAlignment } from "./Buttons/TextAlignment";
import { TextColor } from "./Buttons/TextColor";
import { TextColorSeparator } from "./Buttons/TextColorSeparator";
import { TextFeaturesSeparator } from "./Buttons/TextFeatureSeparator";
import { TextHighlight } from "./Buttons/TextHighlight";
import "./ContextPanel.css";

type ContextPanelProps = {
	board: Board;
	app: App;
};

export function ContextPanel({ board, app }: ContextPanelProps) {
	const [menu, setOpenedMenu] = useState("None");
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
	return (
		<div
			id="ContextPanel"
			className="ContextPanelContainer"
			ref={panelRef}
			style={{
				left: `${mbr.left}px`,
				top: `${mbr.top}px`,
				userSelect: "none",
			}}
		>
			<Scroll board={board} panelRef={panelRef}>
				<Edit board={board} />

				<StartPointer
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
					pointer={board.selection.getStartPointerStyle()}
				/>
				<SwitchPointers
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
				/>

				<EndPointer
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
					pointer={board.selection.getEndPointerStyle()}
				/>

				<ConnectorType
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>
				<ConnectorAddText
					board={board}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>

				<ConnectorStyleSeparator board={board} />

				<ItemType
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getFillColor()}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>

				<ItemTypeSeparator board={board} />

				<FontSize
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
					fontSize={board.selection.getFontSize()}
				/>

				<FontStyle
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>
				<TextAlignment
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>
				<TextFeaturesSeparator board={board} />
				<TextColor
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
					color={board.selection.getFontColor()}
				/>

				<TextHighlight
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
					color={board.selection.getFontHighlight()}
				/>

				<TextColorSeparator board={board} />

				<StrokeStyle
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getStrokeColor()}
					width={board.selection.getStrokeWidth()}
					menu={menu}
					windowHeight={windowHeight}
					panelMbr={mbr}
				/>

				<FillStyle
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getFillColor()}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>

				<StickerFillStyle
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getFillColor()}
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
				/>

				<PathStyleSeparator board={board} />

				<Duplicate board={board} />
				<Delete board={board} />

				<RestOptionsMenu
					menu={menu}
					panelMbr={mbr}
					windowHeight={windowHeight}
					toggleMenu={toggleMenu}
					board={board}
				/>
			</Scroll>
		</div>
	);
}
