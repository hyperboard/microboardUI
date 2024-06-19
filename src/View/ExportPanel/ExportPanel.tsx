import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "View/Ui/UiButton";
import style from "./ExportPanel.module.css";

type Props = { board: Board; app: App };

export function ExportPanel({ board, app }: Props) {
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });
	const exportTool = board.tools.getExport();
	const handleConfirm = () => {
		setIsLoading(true);
	};

	useEffect(() => {
		(async () => {
			if (isLoading && exportTool) {
				try {
					await exportTool.takeSnapshot();
				} catch (err) {
					console.error(err);
				} finally {
					setIsLoading(false);
					board.tools.cancel();
				}
			}
		})();
	}, [isLoading, exportTool]);

	const handleCancel = () => {
		board.tools.cancel();
	};

	if (!exportTool) {
		return null;
	}

	return (
		<>
			<div className={style.panel}>
				<UiButton
					id="ExportConfirm"
					onClick={handleConfirm}
					width={130}
				>
					{t("export.confirm")}
				</UiButton>
				<UiButton id="ExportCancel" onClick={handleCancel} width={130}>
					{t("export.cancel")}
				</UiButton>
			</div>
			{isLoading && (
				<div className={style.loader}>
					<span>Загрузка...</span>
				</div>
			)}
		</>
	);
}
