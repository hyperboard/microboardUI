import { useTranslation } from "react-i18next";
import styles from "./LoginWith.module.css";
import React from "react";

export const LoginWith = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={styles.wr}>
      <span className={styles.line}></span>
      <span className={styles.text}>{t("auth.loginWith")}</span>
      <span className={styles.line}></span>
    </div>
  );
};
