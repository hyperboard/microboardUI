import React from "react";
import { ConfirmModalProvider } from "./ConfirmModal";
import { InfoModalProvider } from "./InfoModal";
import { ModalProvider } from "./ModalProvider";

type Props = {
	children: React.ReactNode;
};

const ModalsWrapper: React.FC<Props> = ({ children }) => {
	return (
		<ConfirmModalProvider>
			<ModalProvider>
				<InfoModalProvider>{children}</InfoModalProvider>
			</ModalProvider>
		</ConfirmModalProvider>
	);
};

export default ModalsWrapper;
