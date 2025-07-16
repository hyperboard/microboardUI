import { GoogleAuthBtn } from "features/GoogleAuthBtn";
import { LoginWith } from "features/LoginWith/LoginWith";
import { WalletLoginButton } from "features/WalletLoginButton";
import React, {
  type FormEventHandler,
  type PropsWithChildren,
  forwardRef,
} from "react";
import styles from "./AuthForm.module.css";

type Props = PropsWithChildren<{
  onSubmit: FormEventHandler;
  title: string;
  id: string;
  showPolicies?: boolean;
  showAnotherAuthWay?: boolean;
}>;

export const AuthForm = forwardRef<HTMLFormElement, Props>(
  (
    { onSubmit, title, id, children, showPolicies, showAnotherAuthWay },
    ref,
  ) => {
    return (
      <div className={styles.wrapper}>
        <form className={styles.form} id={id} onSubmit={onSubmit} ref={ref}>
          <h1 className={styles.title}>{title}</h1>
          {children}
        </form>
        {showAnotherAuthWay && (
          <div className={styles.anotherBtns}>
            <LoginWith />
            <WalletLoginButton />
            <GoogleAuthBtn />
          </div>
        )}
      </div>
    );
  },
);

// Set a display name for easier debugging
AuthForm.displayName = "AuthForm";
