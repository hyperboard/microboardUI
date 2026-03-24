import React from "react";
import { ConfirmModalProvider } from "./ConfirmModal";
import { InfoModalProvider } from "./InfoModal";

type Props = React.PropsWithChildren;

const ModalsWrapper = ({ children }: Props): React.JSX.Element => {
  return (
    <ConfirmModalProvider>
      <InfoModalProvider>{children}</InfoModalProvider>
    </ConfirmModalProvider>
  );
};

export default ModalsWrapper;
