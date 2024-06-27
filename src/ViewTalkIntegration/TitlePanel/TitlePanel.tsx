import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import style from "./TitlePanel.module.css";
import { Board } from "Board";
import { App } from "App";

type Props = {
	board: Board;
	app: App;
};

export function TitlePanel({ board, app }: Props) {
	const forceUpdate = useForceUpdate();
	const { t } = useTranslation();

	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}

	const openExport = () => {
		board.tools.export();
	};

	return (
		<UiPanel className={style.panel}>
			<UiButton
				onClick={openExport}
				variant="secondary"
				tooltip={t("export.tooltip")}
				tooltipPosition="bottom"
			>
				<Icon iconName="Export" />
			</UiButton>
		</UiPanel>
	);
}
