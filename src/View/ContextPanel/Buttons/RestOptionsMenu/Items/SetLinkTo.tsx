import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "View/Icon";
import { useModal } from "../../../../Modal/ModalProvider";

export function SetLinkTo() {
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();
	const { showModal } = useModal();
	const { board } = useAppContext();

	const handleClick = () => {
		board.selection.setContext("EditUnderPointer");
		showModal("setLinkTo");
		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleClick}
			icon={<Icon width={20} height={20} iconName="CopyLink" />}
		>
			{t("contextPanel.setLinkTo.text")}
		</RestOptionsMenuItem>
	);
}
