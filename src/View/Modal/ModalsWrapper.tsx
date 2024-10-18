import React from "react";
import { ConfirmModalProvider } from "./ConfirmModal";
import { InfoModalProvider } from "./InfoModal";
import { ModalProvider } from "./ModalProvider";

type Props = {
	children: React.ReactNode;
};

const ModalsWrapper: React.FC<Props> = ({ children }) => {
	return (
		<ModalProvider>
			<ConfirmModalProvider>
				<InfoModalProvider>{children}</InfoModalProvider>
			</ConfirmModalProvider>
		</ModalProvider>
	);
};

export default ModalsWrapper;
