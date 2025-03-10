import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImportMiroStartModal.module.css";
import { Button } from "shared/ui-lib/Button";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const IMPORT_MIRO_START_MODAL = Symbol("startImportMiro");

export const ImportMiroStartModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { closeModal } = useUiModalContext();

	const onClick = (): void => {
		window.location.href = "https://miro.com/app/dashboard/";
	};

	return (
		<UiModal modalId={IMPORT_MIRO_START_MODAL}>
			<h3 className={styles.title}>{t("miro.importMiro")}</h3>
			<p className={styles.text}>{t("miro.startModal.text")}</p>
			<div className={styles.btnsWr}>
				<Button
					pattern="tertiary"
					onClick={closeModal}
					className={styles.cancelBtn}
				>
					{t("miro.startModal.cancel")}
				</Button>
				<Button
					id={"miro"}
					pattern="primary"
					onClick={onClick}
					className={styles.goToMiroBtn}
				>
					{t("miro.startModal.goToMiroBtn")}
				</Button>
			</div>
		</UiModal>
	);
};
