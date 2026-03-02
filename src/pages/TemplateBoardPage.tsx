import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppContext, useAppContext } from "features/AppContext";
import { AppView } from "features/AppView";
import { useAccount } from "App/useAccount";

export const TemplateBoardPage = (): React.JSX.Element => {
  const { app } = useAppContext();
  const board = app.getBoard();
  const { templateId } = useParams<{ templateId: string }>();
  const account = useAccount();

  useEffect(() => {
    if (templateId) {
      app.openBoard(templateId).then(() => {
        app.render();
      });
    }
  }, []);

  if (!board || !account.isInitialized) {
    return <div></div>;
  }

  return (
    <AppContext.Provider value={{ app, board }}>
      <AppView />
    </AppContext.Provider>
  );
};
