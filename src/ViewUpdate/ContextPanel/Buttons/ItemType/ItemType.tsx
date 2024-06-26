import { ShapeType } from "Board/Items/Shape/Basic";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { Icon, ShapeIcon } from "ViewUpdate/Icon";
import { ShapePicker } from "ViewUpdate/Pickers/ShapeTypePicker";
import { UiAccordion } from "ViewUpdate/Ui/UiAccordion";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./ItemType.module.css";
import { useAppContext } from "ViewUpdate/AppContext";
import clsx from "clsx";

const MENU_NAME = "ItemType";

export function ItemType(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};
	const handlePick = (type: ShapeType) => {
		board.selection.setShapeType(type);
		toggleMenu("None");
	};

	const selectedShapes = board.selection.list();
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
