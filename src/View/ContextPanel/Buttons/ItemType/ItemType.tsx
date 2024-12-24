import { ShapeType } from "Board/Items/Shape";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { Icon, ShapeIcon } from "View/Icon";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { UiAccordion } from "View/Ui/UiAccordion";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./ItemType.module.css";
import { useAppContext } from "View/AppContext";
import clsx from "clsx";
import { Shape } from "Board/Items";
import { ShapeCategoryName } from "../../../Tools/AddShape";
import btnStyle from "../ContextPanelButton.module.css";

const MENU_NAME = "ItemType";

const getCategoryName = (shapeType: ShapeType): ShapeCategoryName => {
	const separated = shapeType.split("_");
	if (separated.length === 1) {
		return "basicShapes";
	}
	return separated[0] as ShapeCategoryName;
};

export function ItemType(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ShapeType): void => {
		board.selection.setShapeType(type);
		toggleMenu("None");
	};

	const selectedShapes = board.selection
		.list()
		.filter(i => i.itemType === "Shape") as Shape[];

	const shapeCategory = getCategoryName(selectedShapes[0].getShapeType());

	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={verticalAlign => (
				<UiButton
					id="item-type"
					tooltip={t("contextPanel.changeShape.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="left"
					className={clsx(
						btnStyle.contextPanelButton,
						verticalAlign === "bottom" &&
							openedMenu === MENU_NAME &&
							style.menuBottom,
					)}
				>
					{selectedShapes.length > 1 ? (
						<Icon iconName="Shape" />
					) : (
						<ShapeIcon
							iconName={selectedShapes[0].getShapeType()}
						/>
					)}
				</UiButton>
			)}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
				>
					<UiAccordion
						className={style.wrapper}
						contentClassName={style.panel}
						closedHeight={128}
						openedHeight={300}
						renderButton={(toggle, isOpen) => (
							<UiButton
								onClick={toggle}
								variant="tertiary"
								size="sm"
							>
								{isOpen
									? t("toolsPanel.addText.showBasic")
									: t("toolsPanel.addText.showAll")}
							</UiButton>
						)}
					>
						<ShapePicker
							categoryName={shapeCategory}
							selected={
								selectedShapes.length === 1
									? selectedShapes[0].getShapeType()
									: "None"
							}
							onPick={handlePick}
						/>
					</UiAccordion>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
