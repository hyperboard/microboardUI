import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthClipboardModal, ImgAuthClipboardModal } from "View/ImportMiro";
import {
	LoadingNotification,
	SuccessNotification,
	WarnClipboardNotification,
	WarnNotification,
} from "View/ImportMiro/ImportMiroBoards/Notifications";

export type ModalName =
	| "startImportMiro"
	| "authClipboardMiro"
	| "loadingNotification"
	| "errorNotification"
	| "successNotification"
	| "warnClipboardNotification"
	| "warnNotification"
	| "imgAuthClipboardNotification";

interface ModalContextType {
	modals: Record<ModalName, boolean>;
	showModal: (modalName: ModalName) => void;
	hideModal: (modalName: ModalName) => void;
	isModalOpen: (modalName: ModalName) => boolean;
	data: unknown;
	setModalData: (data: unknown) => void;
}

const ModalContext = createContext<ModalContextType>({
	modals: {
		startImportMiro: false,
		authClipboardMiro: false,
		loadingNotification: false,
		errorNotification: false,
		successNotification: false,
		warnClipboardNotification: false,
		imgAuthClipboardNotification: false,
		warnNotification: false,
	},
	showModal: modalName => {},
	hideModal: modalName => {},
	isModalOpen: modalName => false,
	data: undefined,
	setModalData: data => {},
});

let globalModalFunctions: {
	showModal: ((modalName: ModalName) => void) | null;
	hideModal: ((modalName: ModalName) => void) | null;
	isModalOpen: ((modalName: ModalName) => boolean) | null;
	data: unknown | null;
	setModalData: ((data: unknown) => void) | null;
} = {
	showModal: null,
	hideModal: null,
	isModalOpen: null,
	data: null,
	setModalData: null,
};

export const setGlobalModalFunctions = (functions: {
	showModal: ((modalName: ModalName) => void) | null;
	hideModal: ((modalName: ModalName) => void) | null;
	isModalOpen: ((modalName: ModalName) => boolean) | null;
	data: unknown | null;
	setModalData: ((data: unknown) => void) | null;
}): void => {
	globalModalFunctions = functions;
};

export const getGlobalModalFunctions = () => globalModalFunctions;

export const ModalProvider = ({ children }) => {
	const [modals, setModals] = useState<Record<ModalName, boolean>>({
		startImportMiro: false,
		authClipboardMiro: false,
		loadingNotification: false,
		errorNotification: false,
		successNotification: false,
		warnClipboardNotification: false,
		imgAuthClipboardNotification: false,
		warnNotification: false,
	});
	const [data, setModalData] = useState<unknown>();

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

	console.log("isModalOpen", isModalOpen("loadingNotification"));

	useEffect(() => {
		setGlobalModalFunctions({
			showModal,
			hideModal,
			isModalOpen,
			data,
			setModalData,
		});
		return () =>
			setGlobalModalFunctions({
				showModal: null,
				hideModal: null,
				isModalOpen: null,
				data: null,
				setModalData: null,
			});
	}, [showModal, hideModal, isModalOpen, setModalData, data]);

	return (
		<ModalContext.Provider
			value={{
				modals,
				showModal,
				hideModal,
				isModalOpen,
				data,
				setModalData,
			}}
		>
			{children}
			<AuthClipboardModal />
			<ImgAuthClipboardModal />
			<LoadingNotification />
			<WarnClipboardNotification />
			<SuccessNotification />
			<WarnNotification />
		</ModalContext.Provider>
	);
};

export const useModal = () => useContext(ModalContext);
