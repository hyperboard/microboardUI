import React from "react";
import { ConfirmModalProvider } from "./ConfirmModal";
import { InfoModalProvider } from "./InfoModal";

type Props = {
	children: React.ReactNode;
};

const ModalsWrapper: React.FC<Props> = ({ children }) => {
	return (
		<ConfirmModalProvider>
			<InfoModalProvider>{children}</InfoModalProvider>
		</ConfirmModalProvider>
	);
};

export default ModalsWrapper;
