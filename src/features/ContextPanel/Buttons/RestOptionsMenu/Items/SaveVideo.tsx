import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import { VideoItem } from "Board/Items/Video/Video";

interface Props {
	extension: "mp4" | "webm";
}

export function SaveVideo({ extension }: Props): JSX.Element {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();
	const item = board.selection.items.getSingle();
	if (!item || !(item instanceof VideoItem) || !item.getIsStorageUrl()) {
		return <></>;
	}

	const handleSaveVideo = (): void => {
		item.download(extension);
		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleSaveVideo}
			icon={<Icon iconName="Export" width={20} height={20} />}
		>
			{t(`contextPanel.video.save.${extension}`)}
		</RestOptionsMenuItem>
	);
}
