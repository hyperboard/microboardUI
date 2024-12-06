import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import clsx from "clsx";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./ExportPanel.module.css";

type Props = { board: Board; app: App };

export function ExportPanel({ board, app }: Props) {
	const [isLoading, setIsLoading] = useState(false);

	const forceUpdate = useForceUpdate();
	useAppSubscription({ observer: forceUpdate, subjects: ["tools"] });
	const { t } = useTalkTranslation();
	const exportTool = board.tools.getExport();

	useEffect(() => {
		if (isLoading) {
			const exportTool = board.tools.getExport();
			exportTool
				?.takeSnapshot()
				?.then(() => {
					setIsLoading(false);
					board.tools.cancel();
				})
				.catch(() => {
					toast.error(t("export.error"), {
						duration: 4000,
						position: "bottom-left",
					});
					setIsLoading(false);
					board.tools.cancel();
				});
		}
	}, [isLoading]);

	const handleConfirm = () => {
		if (isLoading) {
			return;
		}
		setIsLoading(true);
	};

	const handleCancel = () => {
		board.tools.cancel();
	};

	if (!exportTool) {
		return null;
	}

	return (
		<UiPanel className={style.panel}>
			<UiButton
				className={clsx(style.button)}
				onClick={handleConfirm}
				variant="action"
			>
				{t("export.confirm")}
			</UiButton>
			<UiButton
				className={clsx(style.button)}
				onClick={handleCancel}
				variant="secondary"
			>
				{t("export.cancel")}
			</UiButton>
		</UiPanel>
	);
}
