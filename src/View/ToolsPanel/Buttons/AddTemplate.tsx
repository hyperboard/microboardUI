import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { STICKER_COLORS } from "View/Tools/AddSticker";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { getApiUrl } from "../../../Config";
import Cookies from "js-cookie";
import { BoardEvent } from "../../../Board/Events/Events";
import { createCommand } from "../../../Board/Events/Command";
import { BoardSnapshot } from "../../../Board/Board";
import { Item } from "../../../Board/Items";
import { SelectTemplateModal } from "../../Templates/SelectTemplateModal/SelectTemplateModal";

export function AddTemplate() {
	const { board } = useAppContext();
	const [selectTemplateOpen, setSelectTemplateOpen] = useState(false);
	const { t } = useTranslation();
	const [isActive, setIsActive] = useState(
		Boolean(board.tools.getAddConnector()),
	);

	const addTool = board.tools.getAddTemplate();
	useEffect(() => {
		if (addTool) {
			setIsActive(true);
		} else {
			setIsActive(false);
		}
	}, [addTool]);

	const handleClick = async () => {
		setSelectTemplateOpen(true);
		setIsActive(false);
	};

	return (
		<div>
			<ButtonWithMenu
				button={
					<UiButton
						id={"tool-add-template"}
						tooltip={t("toolsPanel.addTemplate.tooltip")}
						hotkey={getHotkeyLabel("template")}
						active={isActive || !!addTool}
						onClick={handleClick}
						variant="secondary"
						rounded="none"
					>
						<Icon iconName="Sticker" />
					</UiButton>
				}
				isOpen={isActive}
			></ButtonWithMenu>
			<SelectTemplateModal
				isOpen={selectTemplateOpen}
				setIsOpen={setSelectTemplateOpen}
			/>
		</div>
	);
}
