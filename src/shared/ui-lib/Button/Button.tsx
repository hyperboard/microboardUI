import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";
import { Loader } from "./Loader";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pattern?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "quaternary"
    | "ghostFilled";
  loading?: boolean;
}

export const Button: React.FC<Props> = ({
  pattern = "primary",
  children,
  className,
  loading,
  ...props
}) => {
  return (
    <button
      className={clsx(
        styles.button,
        styles[pattern],
        className,
        loading && styles.loading, // Use loading here
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <div className={styles.loader}>
          <Loader />
        </div>
      )}
      {children}
    </button>
  );
};
