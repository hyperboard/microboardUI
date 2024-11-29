import { Modal } from "shared/ui-lib/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImgAuthClipboardModal.module.css";
import { useModal } from "View/Modal/ModalProvider";
import { Button } from "shared/ui-lib/Button";
import { Icon } from "View/Icon";
import { useCopyBoardItems } from "../ImportMiroBoards/ImportBoardItem/useCopyBoardItems";
import { useAppContext } from "View/AppContext";

export const ImgAuthClipboardModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();
	const { board } = useAppContext();

	const onAuthClick = (): void => {
		hideModal("imgAuthClipboardNotification");

		// @ts-expect-error import.meta object didn't exists in common-js modules
		const clientId = import.meta.env.MIRO_CLIENT_ID;
		const redirectRoute = "/boards/blank?clipboard=true";
		const redirectUrl = window.location.origin + redirectRoute;

		window.location.href =
			"https://miro.com/oauth/authorize?response_type=code&client_id=" +
			clientId +
			"&redirect_uri=" +
			redirectUrl;
	};

	const onContinueClick = (): void => {
		hideModal("imgAuthClipboardNotification");
		useCopyBoardItems(board, undefined, true);
	};

	return (
		<Modal
			isOpen={isModalOpen("imgAuthClipboardNotification")}
			hideModal={hideModal}
			modalName="imgAuthClipboardNotification"
		>
			<h3 className={styles.title}>
				{t("miro.imgAuthClipboardModal.title")}
			</h3>
			<p className={styles.text}>
				{t("miro.imgAuthClipboardModal.description")}
			</p>
			<div className={styles.btnWrapper}>
				<Button
					onClick={onAuthClick}
					className={styles.btn}
					pattern="primary"
				>
					<Icon
						iconName="miro"
						width={16}
						height={16}
						style={{ color: "#050038" }}
					/>
					{t("miro.imgAuthClipboardModal.authBtn")}
				</Button>
				<Button
					onClick={onContinueClick}
					className={styles.btnContinue}
					pattern="tertiary"
				>
					{t("miro.imgAuthClipboardModal.continueBtn")}
				</Button>
			</div>
		</Modal>
	);
};
