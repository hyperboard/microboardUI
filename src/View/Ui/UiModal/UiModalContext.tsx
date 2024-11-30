import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState, type PropsWithChildren } from "react";

export type ModalId = string | symbol | null;

type UiModalContextPayload = {
	openedModalId: ModalId;
	openModal: (modalId: ModalId) => void;
	closeModal: () => void;
};

const UiModalContext = createStrictContext<UiModalContextPayload>();

export const useUiModalContext = () => useStrictContext(UiModalContext);

export function UiModalContextProvider({ children }: PropsWithChildren<{}>) {
	const [openedModalId, setOpenedModalId] = useState<ModalId>(null);

	const openModal = (modalId: ModalId) => {
		console.log("openModal", modalId);
		setOpenedModalId(modalId);
	};

	const closeModal = () => {
		setOpenedModalId(null);
	};

	return (
		<UiModalContext.Provider
			value={{ openedModalId, closeModal, openModal }}
		>
			{children}
		</UiModalContext.Provider>
	);
}
