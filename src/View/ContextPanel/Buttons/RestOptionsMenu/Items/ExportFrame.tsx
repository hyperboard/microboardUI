import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Frame } from "Board/Items";
import { Icon } from "View/Icon";

export function ExportFrame() {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleExportFrame = () => {
		const item = board.selection.items.getSingle();

		if (item instanceof Frame) {
			item.export(board);
		}

		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleExportFrame}
			icon={<Icon iconName="SaveAsImage" width={20} height={20} />}
		>
			{t("contextPanel.exportFrame.text")}
		</RestOptionsMenuItem>
	);
}
