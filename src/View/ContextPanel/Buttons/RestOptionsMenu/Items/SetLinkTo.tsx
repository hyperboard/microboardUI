import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { notify } from "View/Ui/Toast";
import { Icon } from "View/Icon";
import { useModal } from "../../../../Modal/ModalProvider";

export function SetLinkTo() {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();
	const { showModal } = useModal();

	const handleClick = () => {
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
