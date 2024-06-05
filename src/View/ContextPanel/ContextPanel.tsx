import { App } from "App";
import { Board } from "Board";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "Board/useBoardSubscription";
import React from "react";
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
import { VerticalSeparator } from "./VerticalSeparator";
import {
	CopyLinkFrame,
	SaveFrameAsImage,
	ToggleFrameRatio,
	canShowFrameSetting,
} from "./Buttons/FrameButtons";
import "./ContextPanel.css";
import { Mbr } from "Board/Items";

type ContextPanelProps = {
	board: Board;
	app: App;
};

export function ContextPanel({ board, app }: ContextPanelProps) {
	const [menu, setOpenedMenu] = React.useState("None");
	const panelRef = React.useRef<HTMLDivElement>(null);
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
	const isVisible = board.selection.getContext() !== "None";

	if (!isVisible) {
		return null;
	}
	return (
		<div
			id="ContextPanel"
			className="ContextPanelContainer"
			ref={panelRef}
			style={{
				left: `${updatedMbr.left}px`,
				top: `${updatedMbr.top}px`,
				userSelect: "none",
			}}
		>
			<Scroll board={board} panelRef={panelRef}>
				<Edit board={board} />

				<StartPointer
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
					pointer={board.selection.getStartPointerStyle()}
				/>
				<SwitchPointers
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
				/>

				<EndPointer
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
					pointer={board.selection.getEndPointerStyle()}
				/>

				<ConnectorType
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>
				<ConnectorAddText
					board={board}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>

				<ConnectorStyleSeparator board={board} />

				<ItemType
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getFillColor()}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>

				<ItemTypeSeparator board={board} />

				<FontSize
					board={board}
					toggleMenu={toggleMenu}
					setShouldUpd={setShouldUpd}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
					fontSize={board.selection.getFontSize()}
				/>

				<FontStyle
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>
				<TextAlignment
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>
				<TextFeaturesSeparator board={board} />
				<TextColor
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
					color={board.selection.getFontColor()}
				/>

				<TextHighlight
					board={board}
					toggleMenu={toggleMenu}
					menu={menu}
					panelMbr={updatedMbr}
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
					panelMbr={updatedMbr}
				/>

				<FillStyle
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getFillColor()}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>

				<StickerFillStyle
					board={board}
					toggleMenu={toggleMenu}
					color={board.selection.getFillColor()}
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
				/>

				<PathStyleSeparator board={board} />

				<CopyLinkFrame board={board} toggleMenu={toggleMenu} />
				<SaveFrameAsImage board={board} toggleMenu={toggleMenu} />
				<ToggleFrameRatio board={board} toggleMenu={toggleMenu} />
				{canShowFrameSetting(board) && <VerticalSeparator />}

				<Duplicate board={board} />
				<Delete board={board} />

				<RestOptionsMenu
					menu={menu}
					panelMbr={updatedMbr}
					windowHeight={windowHeight}
					toggleMenu={toggleMenu}
					board={board}
				/>
			</Scroll>
		</div>
	);
}

export const IconSize = 24;
