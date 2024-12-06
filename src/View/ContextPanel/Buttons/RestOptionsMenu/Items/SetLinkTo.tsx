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
	const { showModal, setModalData } = useModal();
	const { board } = useAppContext();
	const hasLink = board.selection.items.getSingle()?.getLinkTo();

	const handleClick = () => {
		board.selection.setContext("EditUnderPointer");
		setModalData(board.selection.items.getSingle()?.getLinkTo());
		showModal("setLinkTo");
		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleClick}
			icon={<Icon width={20} height={20} iconName="addLink" />}
		>
			{t(`contextPanel.setLinkTo.${hasLink ? "edit" : "add"}`)}
		</RestOptionsMenuItem>
	);
}
