import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { notify } from "View/Ui/Toast";
import { Icon } from "View/Icon";

export function CopyItemLink() {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleCopyItemLink = async () => {
		const item = board.selection.items.getSingle();
		if (!item) {
			return;
		}

		try {
			await navigator.clipboard.writeText(item.getLink());
			notify({
				body: t("contextPanel.copyItemLink.success.description"),
				variant: "success",
				duration: 3000,
			});
		} catch (err) {
			console.error(err);
			notify({
				header: t("contextPanel.copyItemLink.error.title"),
				body: t("contextPanel.copyItemLink.error.description"),
				variant: "error",
			});
		}

		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleCopyItemLink}
			icon={<Icon width={20} height={20} iconName="CopyLink" />}
		>
			{t("contextPanel.copyItemLink.text")}
		</RestOptionsMenuItem>
	);
}
