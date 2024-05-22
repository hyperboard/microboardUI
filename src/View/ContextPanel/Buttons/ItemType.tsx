import { Board } from "Board";
import { Frame, Mbr } from "Board/Items";
import { Shapes, ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { FramePicker } from "View/Pickers/FramePicker";
import { Frames, FrameType } from "Board/Items/Frame/Basic";

const IconSize = 24;

type ItemTypeProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
};

export function ItemType({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: ItemTypeProps): React.ReactElement | null {
	const { t } = useTranslation();
	const menuRef = React.useRef<HTMLDivElement>(null);
	const canChangeItemType = board.selection.items.isItemTypes([
		"Shape",
		"Frame",
	]);
	const single = board.selection.items.getSingle();
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangeItemType ||
		!single
	) {
		return null;
	}

	const handleClick = () => {
		toggleMenu("ItemType");
	};

	const handlePick = (type: ShapeType | FrameType) => {
		if (type in Shapes) {
			const realType = type as ShapeType; // REFACTOR typecast
			board.selection.setShapeType(realType);
		} else {
			const realType = type as FrameType; // typecast
			if (single instanceof Frame) {
				single.setFrameType(realType, board);
			}
		}
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id={
					single instanceof Frame
						? "ChangeFrameType"
						: "ChangeItemType"
				}
				onClick={handleClick}
				title={
					single instanceof Frame
						? t("contextPanel.changeFrameType.tooltip")
						: t("contextPanel.changeShape.tooltip")
				}
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</UiButton>
			<div
				id="ItemTypeMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "130px",
					marginLeft: "-60px",
					visibility: menu === "ItemType" ? "visible" : "hidden",
				}}
			>
				{single instanceof Frame ? (
					<FramePicker
						onPick={handlePick}
						isChanging={true}
						frame={single}
					/>
				) : (
					<ShapePicker onPick={handlePick} />
				)}
			</div>
		</ButtonWithMenu>
	);
}
