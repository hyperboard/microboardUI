import React from "react";
import { ConfirmModalProvider } from "./ConfirmModal";
import { InfoModalProvider } from "./InfoModal";

const ModalsWrapper: React.FC = ({ children }) => {
  return (
    <ConfirmModalProvider>
      <InfoModalProvider>{children}</InfoModalProvider>
    </ConfirmModalProvider>
  );
};

export default ModalsWrapper;
