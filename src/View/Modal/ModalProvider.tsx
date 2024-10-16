import React, { createContext, useContext, useState, useEffect } from "react";

export type ModalName = "startImportMiro" | "authClipboardMiro" | "setLinkTo";

interface ModalContextType {
	modals: Record<ModalName, boolean>;
	showModal: (modalName: ModalName) => void;
	hideModal: (modalName: ModalName) => void;
	isModalOpen: (modalName: ModalName) => boolean;
}

const ModalContext = createContext<ModalContextType>({
	modals: {
		startImportMiro: false,
		authClipboardMiro: false,
	},
	showModal: modalName => {},
	hideModal: modalName => {},
	isModalOpen: modalName => false,
});

let globalShowModal: ((modalName: ModalName) => void) | null = null;

export const setGlobalShowModal = (
	showModalFn: (modalName: ModalName) => void,
) => {
	globalShowModal = showModalFn;
};

export const getGlobalShowModal = () => globalShowModal;

export const ModalProvider = ({ children }) => {
	const [modals, setModals] = useState<Record<ModalName, boolean>>({
		startImportMiro: false,
		authClipboardMiro: false,
	});
	const showModal = modalName => {
		setModals(prevModals => ({
			...prevModals,
			[modalName]: true,
		}));
	};

	const hideModal = modalName => {
		setModals(prevModals => ({
			...prevModals,
			[modalName]: false,
		}));
	};

	const isModalOpen = modalName => !!modals[modalName];

	useEffect(() => {
		setGlobalShowModal(showModal);
		return () => setGlobalShowModal(null);
	}, [showModal]);

	return (
		<ModalContext.Provider
			value={{ modals, showModal, hideModal, isModalOpen }}
		>
			{children}
		</ModalContext.Provider>
	);
};

export const useModal = () => useContext(ModalContext);
