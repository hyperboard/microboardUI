import React from "react";
import { ConfirmModalProvider } from "./ConfirmModal";
import { InfoModalProvider } from "./InfoModal";
import { ModalProvider } from "./ModalProvider";

const ModalsWrapper: React.FC = ({ children }) => {
	return (
		<ConfirmModalProvider>
			<ModalProvider>
				<InfoModalProvider>{children}</InfoModalProvider>
			</ModalProvider>
		</ConfirmModalProvider>
	);
};

export default ModalsWrapper;
