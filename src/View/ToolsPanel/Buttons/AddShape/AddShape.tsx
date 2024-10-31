import { ShapeType } from "Board/Items/Shape";
import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon, ShapeIcon } from "View/Icon";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "../ButtonWithMenu";
import style from "./AddShape.module.css";
import { useShapesPanelContext } from "../../../ShapesPanel";

export function AddShape() {
	const [isShapeSelected, setIsShapeSelected] = useState(false);
	const { board } = useAppContext();
	const { isOpen, openShapesPanel, selectedCategory } =
		useShapesPanelContext();
	const { t } = useTranslation();

	const addShape = board.tools.getAddShape();
	const isActive = Boolean(addShape);
	const selectedShape = addShape?.type;
	const isDown = addShape?.isDown;

	useEffect(() => {
		if (isDown) {
			setIsShapeSelected(true);
		}
	}, [isDown]);

	const handleClick = () => {
		if (isActive && selectedShape !== "None" && isShapeSelected) {
			setIsShapeSelected(false);
		} else if (isActive && selectedShape !== "None") {
			setIsShapeSelected(true);
		}
		if (!isActive || (isActive && selectedShape === "None")) {
			board.tools.addShape(true);
			setIsShapeSelected(false);
		}
	};

	const handlePick = (shape: ShapeType) => {
		const tool = board.tools.getAddShape();
		if (tool) {
			tool.setShapeType(shape);
			setIsShapeSelected(true);
		}
	};

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-shape"}
					tooltip={t("toolsPanel.addShape.tooltip")}
					hotkey={getHotkeyLabel("shape")}
					active={isActive}
					onClick={handleClick}
					variant="secondary"
					rounded="none"
				>
					{isActive && selectedShape !== "None" ? (
						<ShapeIcon
							height={24}
							width={24}
							iconName={selectedShape!}
						/>
					) : (
						<Icon iconName="Shape" />
					)}
				</UiButton>
			}
			isOpen={isActive && !isShapeSelected && !isOpen}
		>
			<UiPanel className={style.wrapper}>
				<div className={style.panel}>
					<ShapePicker
						categoryName={selectedCategory}
						selected={selectedShape}
						onPick={handlePick}
					/>
				</div>
				<UiButton
					onClick={openShapesPanel}
					variant="tertiary"
					size="sm"
				>
					{t("toolsPanel.addText.showAll")}
				</UiButton>
			</UiPanel>
		</ButtonWithMenu>
	);
}
