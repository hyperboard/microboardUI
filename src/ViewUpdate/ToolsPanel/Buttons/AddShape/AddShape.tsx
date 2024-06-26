import { ShapeType } from "Board/Items/Shape/Basic";
import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon, ShapeIcon } from "ViewUpdate/Icon";
import { ShapePicker } from "ViewUpdate/Pickers/ShapeTypePicker";
import { UiAccordion } from "ViewUpdate/Ui/UiAccordion";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "../ButtonWithMenu";
import style from "./AddShape.module.css";

export function AddShape() {
	const [isShapeSelected, setIsShapeSelected] = useState(false);
	const { board } = useAppContext();
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
			isOpen={isActive && !isShapeSelected}
		>
			<UiPanel>
				<UiAccordion
					className={style.wrapper}
					contentClassName={style.panel}
					closedHeight={128}
					openedHeight={300}
					renderButton={(toggle, isOpen) => (
						<UiButton onClick={toggle} variant="tertiary" size="sm">
							{isOpen
								? t("toolsPanel.addText.showBasic")
								: t("toolsPanel.addText.showAll")}
						</UiButton>
					)}
				>
					<ShapePicker selected={selectedShape} onPick={handlePick} />
				</UiAccordion>
			</UiPanel>
		</ButtonWithMenu>
	);
}
