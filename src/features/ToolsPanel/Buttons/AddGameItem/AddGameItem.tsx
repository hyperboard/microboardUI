import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React, { useState } from "react";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { ButtonWithMenu } from "../ButtonWithMenu";
import { useTranslation } from "react-i18next";
import style from "./AddGameItem.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { AddDice } from "features/ToolsPanel/Buttons/AddGameItem/AddDice";
import { AddCard } from "features/ToolsPanel/Buttons/AddGameItem/AddCard";

export function AddGameItem() {
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-game-item"}
					tooltip={"tool-add-game-item"}
					active={isOpen}
					variant="secondary"
					rounded="top"
					onClick={() => setIsOpen(!isOpen)}
				>
					<Icon iconName={"Pen"} />
				</UiButton>
			}
			isOpen={isOpen}
		>
			<UiPanel vertical padding={0}>
				<AddDice rounded={"top"} />
				<AddCard rounded={"bottom"} />
			</UiPanel>
		</ButtonWithMenu>
	);
}
