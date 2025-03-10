import { Modal } from "shared/ui-lib/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AuthClipboardModal.module.css";
import { useModal } from "features/Modal/ModalProvider";
import { Button } from "shared/ui-lib/Button";

export const AuthClipboardModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();

	const onClick = (): void => {
		window.location.href = "/auth/sign-in";
	};

	return (
		<Modal
			isOpen={isModalOpen("authClipboardMiro")}
			hideModal={hideModal}
			modalName="authClipboardMiro"
		>
			<h3 className={styles.title}>
				{t("miro.authClipboardModal.title")}
			</h3>
			<p className={styles.text}>
				{t("miro.authClipboardModal.description")}
			</p>
			<Button onClick={onClick} className={styles.btn} pattern="primary">
				{t("miro.authClipboardModal.authBtn")}
			</Button>
		</Modal>
	);
};
