import { Modal } from "shared/ui-lib/Modal";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SetLinkToModal.module.css";
import { useModal } from "View/Modal/ModalProvider";
import { Input } from "../../shared/ui-lib/Input";
import { Button } from "../../shared/ui-lib/Button";
import { useAppContext } from "../AppContext";

export const SetLinkToModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const { isModalOpen, hideModal } = useModal();
	const formRef = useRef<HTMLFormElement | null>(null);
	const [error, setError] = useState<undefined | string>(undefined);

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = formRef.current;
		const item = board.selection.items.getSingle();
		const inputValue = form?.linkToInput.value;
		if (
			!inputValue ||
			!(import.meta.env.NODE_ENV === "production"
				? inputValue.startsWith("https://")
				: inputValue.startsWith("http"))
		) {
			return setError("modalLinkTo.error");
		}
		if (item && item.itemType !== "Placeholder") {
			item.linkTo.setLinkTo(inputValue);
		}
		form.reset();
		hideModal("setLinkTo");
	};

	const removeError = () => {
		if (error) {
			setError(undefined);
		}
	};

	return (
		<Modal
			isOpen={isModalOpen("setLinkTo")}
			hideModal={hideModal}
			modalName="setLinkTo"
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
			onPaste={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
		>
			<form
				className={styles.form}
				onSubmit={onSubmit}
				ref={formRef}
				id="setLinkToForm"
			>
				<p className={styles.title}>{t("modalLinkTo.title")}</p>
				<Input
					id="linkToInput"
					onChange={removeError}
					placeholder={t("modalLinkTo.input")}
					shouldFocus={true}
				/>
				<Button className={styles.submitBtn} type="submit">
					{t("common.confirm")}
				</Button>
				{error && <p className={styles.error}>{t(error)}</p>}
			</form>
		</Modal>
	);
};
