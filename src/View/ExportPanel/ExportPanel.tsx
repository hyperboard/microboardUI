import { useAppSubscription } from "Board/useBoardSubscription";
import clsx from "clsx";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { notify } from "View/Ui/Toast";
import { UiButton } from "View/Ui/UiButton";
import { UiLoader } from "View/Ui/UiLoader";
import style from "./ExportPanel.module.css";

export function ExportPanel(): React.ReactElement | null {
	const [isLoading, setIsLoading] = useState(false);
	const { board } = useAppContext();
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();
	useAppSubscription({ observer: forceUpdate, subjects: ["tools"] });
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

	const handleConfirm = (): void => {
		if (isLoading) {
			return;
		}
		setIsLoading(true);
	};

	const handleCancel = (): void => {
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
				{isLoading ? <UiLoader /> : t("export.confirm")}
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
