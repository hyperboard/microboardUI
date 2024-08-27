import { Modal } from "shared/ui-lib/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import ImportMiroStartImg from "shared/assets/imgs/importMiroStart.png";
import { UiButton } from "View/Ui/UiButton";
import styles from "./ImportMiroStartModal.module.css";

interface ImportMiroStartModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const ImportMiroStartModal = ({
	isOpen,
	setIsOpen,
}: ImportMiroStartModalProps): JSX.Element => {
	const { t } = useTranslation();

	// TODO fix loader png
	const importMiroStartImg = ImportMiroStartImg?.toString().replace(".", "");

	const onClick = (): void => {
		// TODO using ENV after transferring to the client
		// const clientId = import.meta.env.MIRO_CLIENT_ID;
		// const clientSecret = import.meta.env.MIRO_CLIENT_SECRET;
		// const baseURl = import.meta.env.BASE_URL
		const clientId = "3458764589599848573";
		const redirectUrl = window.location.origin + "/boards/:boardId/";

		window.location.href =
			"https://miro.com/oauth/authorize?response_type=code&client_id=" +
			clientId +
			"&redirect_uri=" +
			redirectUrl;
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen}>
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
