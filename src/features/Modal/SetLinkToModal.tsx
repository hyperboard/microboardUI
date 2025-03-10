import { Modal } from "shared/ui-lib/Modal";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SetLinkToModal.module.css";
import { useModal } from "features/Modal/ModalProvider";
import { Input } from "../../shared/ui-lib/Input";
import { Button } from "../../shared/ui-lib/Button";
import { useAppContext } from "../AppContext";

export const SetLinkToModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const { isModalOpen, hideModal, setModalData, data } = useModal();
	const formRef = useRef<HTMLFormElement | null>(null);
	const [error, setError] = useState<"modalLinkTo.error" | undefined>(
		undefined,
	);
	const item = board.selection.items.getSingle();

	const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const form = formRef.current;
		const inputValue = form?.linkToInput.value;
		if (
			!inputValue ||
			(!inputValue.startsWith("http") && !inputValue.startsWith("www"))
		) {
			return setError("modalLinkTo.error");
		}
		if (item && item.itemType !== "Placeholder") {
			item.linkTo.setLinkTo(inputValue);
		}
		form.reset();
		setModalData(undefined);
		hideModal("setLinkTo");
	};

	const removeError = (): void => {
		if (error) {
			setError(undefined);
		}
	};

	const handleRemoveLink = (
		ev: React.MouseEvent<HTMLButtonElement>,
	): void => {
		ev.preventDefault();
		if (item && item.itemType !== "Placeholder") {
			item.linkTo.removeLinkTo();
			setModalData(undefined);
			hideModal("setLinkTo");
		}
	};

	const handleCloseModal = (): void => {
		setModalData(undefined);
		hideModal("setLinkTo");
	};

	return (
		<Modal
			isOpen={isModalOpen("setLinkTo")}
			hideModal={handleCloseModal}
			modalName="setLinkTo"
			onPaste={(event: React.KeyboardEvent<HTMLDivElement>) =>
				event.stopPropagation()
			}
			onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) =>
				event.stopPropagation()
			}
		>
			<form
				className={styles.form}
				onSubmit={onSubmit}
				ref={formRef}
				id="setLinkToForm"
			>
				<p className={styles.title}>{t("modalLinkTo.title")}</p>
				<p className={styles.text}>{t("modalLinkTo.text")}</p>
				<Input
					id="linkToInput"
					inputContainerClassName={styles.input}
					onChange={removeError}
					placeholder={t("modalLinkTo.input")}
					shouldFocus={true}
					defaultValue={typeof data === "string" ? data : undefined}
				/>
				<div className={styles.buttonsBox}>
					<Button className={styles.btn} type="submit">
						{t("modalLinkTo.submit")}
					</Button>
					{data && (
						<Button
							className={styles.btn}
							pattern="tertiary"
							onClick={ev => handleRemoveLink(ev)}
							type="button"
						>
							{t("modalLinkTo.deleteLink")}
						</Button>
					)}
				</div>
				{error && <p className={styles.error}>{t(error)}</p>}
			</form>
		</Modal>
	);
};
