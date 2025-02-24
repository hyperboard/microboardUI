import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Frame } from "Board/Items";
import { notify } from "View/Ui/Toast";
import { Icon } from "View/Icon";
import { getLinkToItem } from "./getLinkToItem";

export function CopyFrameLink(): JSX.Element {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleCopyFrameLink = async (): Promise<void> => {
		const item = board.selection.items.getSingle();

		if (item instanceof Frame) {
			try {
				await navigator.clipboard.writeText(
					getLinkToItem(item.getId()),
				);
				notify({
					body: t("contextPanel.copyFrameLink.success.description"),
					variant: "success",
					duration: Number.POSITIVE_INFINITY,
				});
			} catch (err) {
				console.error(err);
				notify({
					header: t("contextPanel.copyFrameLink.error.title"),
					body: t("contextPanel.copyFrameLink.error.description"),
					variant: "error",
				});
			}
		}

		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleCopyFrameLink}
			icon={<Icon width={20} height={20} iconName="CopyLink" />}
		>
			{t("contextPanel.copyFrameLink.text")}
		</RestOptionsMenuItem>
	);
}
