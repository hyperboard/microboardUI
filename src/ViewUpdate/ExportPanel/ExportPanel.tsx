import { useAppSubscription } from "Board/useBoardSubscription";
import clsx from "clsx";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { notify } from "ViewUpdate/Ui/Toast";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import style from "./ExportPanel.module.css";

export function ExportPanel() {
	const [isLoading, setIsLoading] = useState(false);
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });
	const exportTool = board.tools.getExport();

	useEffect(() => {
		if (isLoading) {
			exportTool
				?.takeSnapshot()
				?.then(() => {
					setIsLoading(false);
					board.tools.cancel();
				})
				.catch(() => {
					notify({
						header: t("export.error.title"),
						body: t("export.error.description"),
						variant: "error",
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
		<div className={style.container}>
			<UiButton
				className={clsx(style.button)}
				onClick={handleConfirm}
				disabled={isLoading}
			>
				{isLoading ? (
					<div className={style.loader} />
				) : (
					t("export.confirm")
				)}
			</UiButton>
			<UiButton
				className={clsx(style.button)}
				onClick={handleCancel}
				variant="secondary"
			>
				{t("export.cancel")}
			</UiButton>
		</div>
	);
}
