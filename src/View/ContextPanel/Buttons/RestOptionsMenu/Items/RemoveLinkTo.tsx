import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "View/Icon";

export function RemoveLinkTo() {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleClick = () => {
		const item = board.selection.items.getSingle();
		if (item) {
			item.linkTo.removeLinkTo();
		}
		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleClick}
			icon={<Icon width={20} height={20} iconName="CopyLink" />}
		>
			{t("contextPanel.removeLinkTo.text")}
		</RestOptionsMenuItem>
	);
}
