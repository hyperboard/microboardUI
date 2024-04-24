import { Board } from "Board";
import { Mbr } from "Board/Items";
import { ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";

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
	const canChangeItemType = board.selection.items.isItemTypes(["Shape"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangeItemType
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("ItemType");
	};

	const handlePick = (type: ShapeType) => {
		board.selection.setShapeType(type);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ChangeItemType"
				onClick={handleClick}
				title={t("contextPanel.changeShape.tooltip")}
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</UiButton>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "130px",
					marginLeft: "-60px",
					visibility: menu === "ItemType" ? "visible" : "hidden",
				}}
			>
				<ShapePicker onPick={handlePick} />
			</div>
		</ButtonWithMenu>
	);
}
