import React, { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AppContext, useAppContext } from "features/AppContext";
import { TemplatePreviewView } from "features/AppView";

export const TemplatePreviewPage = (): React.JSX.Element => {
  const { app } = useAppContext();
  const board = app.getBoard();
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const language = searchParams.get("lang") || undefined;

  useEffect(() => {
    if (templateId) {
      app.openOfflineTemplateBoard(templateId, language).then(() => {
        app.render();
      });
    }
  }, []);

  if (!board) return <div />;

  return (
    <AppContext.Provider value={{ app, board }}>
      <TemplatePreviewView />
    </AppContext.Provider>
  );
};
