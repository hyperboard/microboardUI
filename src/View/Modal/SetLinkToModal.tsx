import { Modal } from "shared/ui-lib/Modal";
import React, { useRef, useState } from "react";
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
		if (
			!form?.linkTo.value ||
			!(import.meta.env.NODE_ENV === "production"
				? form?.linkTo.value.startsWith("https://")
				: form?.linkTo.value.startsWith("http"))
		) {
			return setError("modalLinkTo.error");
		}
		if (item) {
			item.linkTo.setLinkTo(form?.linkTo.value);
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
					id="linkTo"
					onChange={removeError}
					placeholder={t("modalLinkTo.input")}
				/>
				<Button className={styles.submitBtn} type="submit" size="sm">
					{t("common.confirm")}
				</Button>
				{error && <p className={styles.error}>{t(error)}</p>}
			</form>
		</Modal>
	);
};
