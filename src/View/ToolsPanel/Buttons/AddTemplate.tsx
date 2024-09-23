import { getHotkeyLabel } from "Board/Keyboard";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectTemplateModal } from "../../Templates/SelectTemplateModal/SelectTemplateModal";

export function AddTemplate() {
	const [selectTemplateOpen, setSelectTemplateOpen] = useState(false);
	const { t } = useTranslation();

	const handleClick = async () => {
		setSelectTemplateOpen(true);
	};

	return (
		<UiButton
			id={"tool-add-template"}
			tooltip={t("toolsPanel.addTemplate.tooltip")}
			hotkey={getHotkeyLabel("template")}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
		>
			<Icon iconName="Sticker" />
			<SelectTemplateModal
				isOpen={selectTemplateOpen}
				setIsOpen={setSelectTemplateOpen}
			/>
		</UiButton>
	);
}
