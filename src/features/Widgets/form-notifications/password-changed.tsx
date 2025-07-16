import React from "react";
import styles from "./password-changed.module.css";
import { useTranslation } from "react-i18next";

export const PasswordChanged: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.requested}>
      <div className={styles.requestedIcon}>
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30 55C16.1925 55 5 43.8075 5 30C5 16.1925 16.1925 5 30 5C43.8075 5 55 16.1925 55 30C55 43.8075 43.8075 55 30 55ZM30 50C35.3043 50 40.3914 47.8929 44.1421 44.1421C47.8929 40.3914 50 35.3043 50 30C50 24.6957 47.8929 19.6086 44.1421 15.8579C40.3914 12.1071 35.3043 10 30 10C24.6957 10 19.6086 12.1071 15.8579 15.8579C12.1071 19.6086 10 24.6957 10 30C10 35.3043 12.1071 40.3914 15.8579 44.1421C19.6086 47.8929 24.6957 50 30 50V50ZM27.5075 40L16.9 29.3925L20.435 25.8575L27.5075 32.93L41.6475 18.7875L45.185 22.3225L27.5075 40Z"
            fill="#26BD6C"
          />
        </svg>
      </div>
      <h1 className={styles.resetPassword}>{t("profile.passwordChanged")}</h1>
    </div>
  );
};
