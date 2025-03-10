import React from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";
import { useClickOutside } from "../../shared/lib/useClickOutside";
import { useTranslation } from "react-i18next";

type TModal = {
	boardLink: string;
	closeModal: () => void;
};

const ModalView = ({ boardLink, closeModal }: TModal): React.ReactElement => {
	const textToCopyRef = React.useRef(null);
	const { t } = useTranslation();

	function copyText(): void {
		const span = textToCopyRef.current;
		const range = document.createRange();
		if (!span) {
			return;
		}
		range.selectNode(span);

		window.getSelection()?.removeAllRanges();
		window.getSelection()?.addRange(range);
		document.execCommand("copy");

		window.getSelection()?.removeAllRanges();
	}

	const modalRef = useClickOutside(closeModal);

	return (
		<div className={styles.modalBg}>
			<div ref={modalRef} className={styles.wrapper}>
				<div className={styles.linkContainer}>
					<span ref={textToCopyRef}>{boardLink}</span>
					<select name="" id="">
						<option value="1">{t("modal.canEdit")}</option>
						<option value="2">{t("modal.canComment")}</option>
						<option value="3">{t("modal.canView")}</option>
						<option value="4">{t("modal.noAccess")}</option>
					</select>
					<button onClick={copyText}>{t("modal.copyLink")}</button>
				</div>
			</div>
		</div>
	);
};

export const Modal = (props: any): React.ReactPortal => {
	return createPortal(<ModalView {...props} />, window.document.body);
};
