import React from "react";
import style from "./ErrorBoundary.module.css";
import { Button } from "shared/ui-lib/Button/Button";

type Props = {
  message?: string;
};

export function ErrorScreen({ message }: Props): React.ReactElement {
  return (
    <div className={style.wrapper}>
      <div className={style.errorContainer}>
        <div className={style.errorMessage}>
          <h2>Something went wrong</h2>
          {message && <p className={style.recoveryInfo}>{message}</p>}
          <p>
            Please reload the page. If the problem persists, try clearing your
            browser cache.
          </p>
          <div className={style.errorButtons}>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
