import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "View/Ui/UiButton";
import style from "./ExportPanel.module.css";

type Props = { board: Board; app: App };

export function ExportPanel({ board, app }: Props) {
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });
	const isExport = board.tools.getExport();
	const handleConfirm = () => {
		const exportTool = board.tools.getExport();
		exportTool?.takeSnapshot();
		board.tools.cancel();
	};

	const handleCancel = () => {
		board.tools.cancel();
	};

	if (!isExport) {
		return null;
	}

	return (
		<div className={style.panel}>
			<UiButton id="ExportConfirm" onClick={handleConfirm} width={130}>
				{t("export.confirm")}
			</UiButton>
			<UiButton id="ExportCancel" onClick={handleCancel} width={130}>
				{t("export.cancel")}
			</UiButton>
		</div>
	);
}
