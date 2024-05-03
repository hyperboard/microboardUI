import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React from "react";
import { UiButton } from "View/Ui/UiButton";
import style from "./ExportPanel.module.css";

type Props = { board: Board; app: App };

export function ExportPanel({ board, app }: Props) {
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });
	const isExport = board.tools.getExport();

	if (!isExport) {
		return null;
	}

	return (
		<div className={style.panel}>
			<UiButton>Экспортировать</UiButton>
			<UiButton>Отменить</UiButton>
		</div>
	);
}
