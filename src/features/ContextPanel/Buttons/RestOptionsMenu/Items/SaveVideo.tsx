import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import { VideoItem } from "Board/Items/Video/Video";

export function SaveVideo(): JSX.Element {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleSaveVideo = (): void => {
		const item = board.selection.items.getSingle();

		if (item instanceof VideoItem) {
			item.download();
		}

		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleSaveVideo}
			icon={<Icon iconName="SaveAsImage" width={20} height={20} />}
		>
			{t("contextPanel.exportFrame.text")}
		</RestOptionsMenuItem>
	);
}
