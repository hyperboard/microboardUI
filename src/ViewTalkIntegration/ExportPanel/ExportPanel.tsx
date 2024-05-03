import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import clsx from "clsx";
import { useForceUpdate } from "lib/useForceUpdate";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import style from "./ExportPanel.module.css";

type Props = { board: Board; app: App };

export function ExportPanel({ board, app }: Props) {
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });

	const handleConfirm = () => {
		const exportTool = board.tools.getExport();
		exportTool?.takeSnapshot();
		board.tools.cancel();
	};

	const handleCancel = () => {
		board.tools.cancel();
	};

	const isExport = board.tools.getExport();
	if (!isExport) {
		return null;
	}

	return (
		<UiPanel className={style.panel}>
			<UiButton
				className={clsx(style.button, style.confirm)}
				onClick={handleConfirm}
			>
				Экспортировать
			</UiButton>
			<UiButton
				className={clsx(style.button, style.cancel)}
				onClick={handleCancel}
			>
				Отменить
			</UiButton>
		</UiPanel>
	);
}
