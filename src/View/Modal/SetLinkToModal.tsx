import { Modal } from "shared/ui-lib/Modal";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "View/Ui/UiButton";
import styles from "./ImportMiroStartModal.module.css";
import { useModal } from "View/Modal/ModalProvider";
import { Input } from "../../shared/ui-lib/Input";
import { Button } from "../../shared/ui-lib/Button";
import { useAppContext } from "../AppContext";
import { Shape } from "../../Board/Items";

export const SetLinkToModal = (): JSX.Element => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const { isModalOpen, hideModal } = useModal();
	const formRef = useRef<HTMLFormElement | null>(null);

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = formRef.current;
		const item = board.selection.items.getSingle();
		item.linkTo.setLinkTo(form?.linkTo.value);
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
			<form onSubmit={onSubmit} ref={formRef} id="setLinkToForm">
				<Input id="linkTo" />
				<Button type="submit" size="sm">
					confirm
				</Button>
			</form>
		</Modal>
	);
};
