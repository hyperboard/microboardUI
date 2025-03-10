import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { AuthClipboardModal, ImgAuthClipboardModal } from "features/ImportMiro";
import {
	LoadingNotification,
	SuccessNotification,
	WarnClipboardNotification,
	WarnNotification,
} from "features/ImportMiro/ImportMiroBoards/Notifications";

export type ModalName =
	| "startImportMiro"
	| "authClipboardMiro"
	| "loadingNotification"
	| "errorNotification"
	| "successNotification"
	| "warnClipboardNotification"
	| "warnNotification"
	| "imgAuthClipboardNotification"
	| "setLinkTo"
	| "createTemplate"
	| "selectTemplate";

interface ModalContextType {
	modals: Record<ModalName, boolean>;
	showModal: (modalName: ModalName) => void;
	hideModal: (modalName: ModalName) => void;
	isModalOpen: (modalName: ModalName) => boolean;
	data: unknown;
	setModalData: (data: unknown) => void;
}

type GlobalModalFunctionsType = {
	showModal: ((modalName: ModalName) => void) | null;
	hideModal: ((modalName: ModalName) => void) | null;
	isModalOpen: ((modalName: ModalName) => boolean) | null;
	data: unknown | null;
	setModalData: ((data: unknown) => void) | null;
};

interface ModalProviderProps {
	children: ReactNode;
}

const ModalContext = createContext<ModalContextType>({
	modals: {
		startImportMiro: false,
		authClipboardMiro: false,
		loadingNotification: true,
		errorNotification: false,
		successNotification: false,
		warnClipboardNotification: false,
		imgAuthClipboardNotification: false,
		warnNotification: false,
		selectTemplate: false,
		createTemplate: false,
		setLinkTo: false,
	},
	showModal: () => {},
	hideModal: () => {},
	isModalOpen: () => false,
	data: undefined,
	setModalData: () => {},
});

let globalModalFunctions: GlobalModalFunctionsType = {
	showModal: null,
	hideModal: null,
	isModalOpen: null,
	data: null,
	setModalData: null,
};

export const setGlobalModalFunctions = (
	functions: GlobalModalFunctionsType,
): void => {
	globalModalFunctions = functions;
};

export const getGlobalModalFunctions = (): GlobalModalFunctionsType =>
	globalModalFunctions;

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
	const [modals, setModals] = useState<Record<ModalName, boolean>>({
		startImportMiro: false,
		authClipboardMiro: false,
		loadingNotification: false,
		errorNotification: false,
		successNotification: false,
		warnClipboardNotification: false,
		imgAuthClipboardNotification: false,
		warnNotification: false,
		selectTemplate: false,
		createTemplate: false,
		setLinkTo: false,
	});
	const [data, setModalData] = useState<unknown>();

	const showModal = (modalName: ModalName): void => {
		setModals(prevModals => ({
			...prevModals,
			[modalName]: true,
		}));
	};

	const hideModal = (modalName: ModalName): void => {
		setModals(prevModals => ({
			...prevModals,
			[modalName]: false,
		}));
	};

	const isModalOpen = (modalName: ModalName): boolean => !!modals[modalName];

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

export const useModal = (): ModalContextType => useContext(ModalContext);
