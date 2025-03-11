import { ImageItem } from "Board/Items/Image";
import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";

export function SaveImg(): JSX.Element {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleSaveImg = (): void => {
		const item = board.selection.items.getSingle();

		if (item instanceof ImageItem) {
			item.download();
		}

		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleSaveImg}
			icon={<Icon iconName="SaveAsImage" width={20} height={20} />}
		>
			{t("contextPanel.exportFrame.text")}
		</RestOptionsMenuItem>
	);
}
