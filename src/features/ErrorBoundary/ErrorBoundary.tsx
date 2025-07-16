import React, { PropsWithChildren, ErrorInfo } from "react";
import style from "./ErrorBoundary.module.css";
import { Button } from "shared/ui-lib/Button/Button";

class ErrorBoundary extends React.Component<
  PropsWithChildren<{
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }>,
  {
    hasError: boolean;
    error: Error | null;
    recoveryAttempts: number;
    lastErrorTime: number | null;
  }
> {
  private readonly MAX_RECOVERY_ATTEMPTS = 3;
  private readonly RECOVERY_TIMEOUT = 1000; // 1 second

  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      recoveryAttempts: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
    recoveryAttempts: number;
    lastErrorTime: number;
  } {
    return {
      hasError: true,
      error,
      recoveryAttempts: 0,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Caught Error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);

    if (
      this.state.lastErrorTime === null ||
      Date.now() - this.state.lastErrorTime > this.RECOVERY_TIMEOUT
    ) {
      this.attemptRecovery();
    }
  }

  componentDidUpdate(
    prevProps: PropsWithChildren<{}>,
    prevState: { hasError: boolean },
  ) {
    if (
      !prevState.hasError &&
      this.state.hasError &&
      this.state.recoveryAttempts < this.MAX_RECOVERY_ATTEMPTS
    ) {
      this.attemptRecovery();
    }
  }

  attemptRecovery = () => {
    if (this.state.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
      return; // Stop trying after max attempts
    }

    this.setState((prevState) => ({
      recoveryAttempts: prevState.recoveryAttempts + 1,
      hasError: false,
      error: null,
    }));
  };

  render(): React.ReactNode {
    if (
      this.state.hasError &&
      this.state.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS
    ) {
      return (
        <div className={style.wrapper}>
          <div className={style.errorContainer}>
            <div className={style.errorMessage}>
              <h2>Something went wrong</h2>
              <p>An error occurred:</p>
              <p className={style.recoveryInfo}>
                {this.state.error?.message ||
                  `We tried to recover automatically ${this.MAX_RECOVERY_ATTEMPTS} times but couldn't fix the issue.`}
              </p>
              <div className={style.errorButtons}>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
