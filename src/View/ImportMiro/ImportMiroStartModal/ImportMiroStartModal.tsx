import { Modal } from "shared/ui-lib/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImportMiroStartModal.module.css";
import { useModal } from "View/Modal/ModalProvider";
import { Button } from "shared/ui-lib/Button";
import { Icon } from "View/Icon";

export const ImportMiroStartModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();

	const onClick = (): void => {
		window.location.href = "https://miro.com/app/dashboard/";
	};

	return (
		<Modal
			isOpen={isModalOpen("startImportMiro")}
			hideModal={hideModal}
			modalName="startImportMiro"
		>
			<h3 className={styles.title}>{t("miro.importMiro")}</h3>
			<p className={styles.text}>{t("miro.startModal.text")}</p>
			<div className={styles.btnsWr}>
				<Button
					pattern="tertiary"
					onClick={() => hideModal("startImportMiro")}
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
					<Icon
						iconName="miro"
						width={16}
						height={16}
						style={{ color: "#050038" }}
					/>
					{t("miro.startModal.goToMiroBtn")}
				</Button>
			</div>
		</Modal>
	);
};
