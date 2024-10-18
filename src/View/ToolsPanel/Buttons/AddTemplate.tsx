import { getHotkeyLabel } from "Board/Keyboard";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectTemplateModal } from "../../Templates";

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
			onClick={handleClick}
			variant="secondary"
			rounded="top"
		>
			<Icon iconName="Template" />
			<SelectTemplateModal
				isOpen={selectTemplateOpen}
				setIsOpen={setSelectTemplateOpen}
			/>
		</UiButton>
	);
}
