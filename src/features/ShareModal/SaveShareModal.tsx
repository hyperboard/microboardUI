import React from "react";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import styles from "./SaveShareModal.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { SHARE_MODAL_ID } from "./ShareModal";
import { Icon } from "shared/ui-lib/Icon";

export const SAVE_SHARE_MODAL = Symbol("saveShareModal");
type SaveShareModalType = {
	onSave: () => void;
};

export function SaveShareModal({ onSave }: SaveShareModalType): JSX.Element {
	const { openModal, closeModal } = useUiModalContext();
	const onBackBtnClick: React.MouseEventHandler<HTMLButtonElement> = (
		ev,
	): void => {
		ev.stopPropagation();
		closeModal();
		openModal(SHARE_MODAL_ID);
	};

	return (
		<UiModal
			modalId={SAVE_SHARE_MODAL}
			wrClassName={styles.modalWr}
			className={styles.wr}
			closeByBgClick={false}
			disableClose
		>
			<div className={styles.container}>
				<h2 className={styles.title}>Сохранить изменения?</h2>
				<UiButton
					variant="quaternary"
					onClick={closeModal}
					className={styles.btn}
				>
					Не сохранять
				</UiButton>
				<UiButton
					variant="primary"
					onClick={onSave}
					className={styles.btn}
				>
					Сохранить
				</UiButton>
			</div>
			<UiButton
				variant="ghost"
				onClick={onBackBtnClick}
				className={styles.backBtn}
			>
				<Icon iconName={"ArrowLeft1"} />
				Back to access settings
			</UiButton>
		</UiModal>
	);
}
