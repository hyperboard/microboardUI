import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectTemplateModal } from "../../Templates";
import { useModal } from "../../Modal/ModalProvider";

export function AddTemplate() {
	const { showModal } = useModal();
	const { t } = useTranslation();

	const handleClick = async () => {
		showModal("selectTemplate");
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
			<SelectTemplateModal />
		</UiButton>
	);
}
