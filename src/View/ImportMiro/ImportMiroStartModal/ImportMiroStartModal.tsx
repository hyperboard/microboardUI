import { Modal } from "shared/ui-lib/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import ImportMiroStartImg from "shared/assets/imgs/importMiroStart.png";
import { UiButton } from "View/Ui/UiButton";
import styles from "./ImportMiroStartModal.module.css";
import { useModal } from "View/Modal/ModalProvider";

export const ImportMiroStartModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();

	// TODO fix loader png
	const importMiroStartImg = ImportMiroStartImg?.toString().replace(".", "");

	const onClick = (): void => {
		// TODO using ENV after transferring to the client
		// const clientId = import.meta.env.MIRO_CLIENT_ID;
		// const clientSecret = import.meta.env.MIRO_CLIENT_SECRET;
		// const baseURl = import.meta.env.BASE_URL
		const clientId = "3458764589599848573";
		const redirectUrl = window.location.origin + "/boards";

		window.location.href =
			"https://miro.com/oauth/authorize?response_type=code&client_id=" +
			clientId +
			"&redirect_uri=" +
			redirectUrl;
	};

	return (
		<Modal
			isOpen={isModalOpen("startImportMiro")}
			hideModal={hideModal}
			modalName="startImportMiro"
		>
			<h3 className={styles.title}>{t("miro.importMiro")}</h3>
			<p className={styles.text}>{t("miro.startModalText")}</p>
			<div className={styles.img}>
				<img src={importMiroStartImg} alt={t("miro.importMiro")} />
			</div>
			<UiButton onClick={onClick} size="sm">
				{t("miro.nextStepBtn")}
			</UiButton>
		</Modal>
	);
};
