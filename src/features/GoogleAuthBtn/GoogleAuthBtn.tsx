import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./GoogleAuthBtn.module.css";
import { getApiUrl } from "Config";

export function GoogleAuthBtn() {
  const { t } = useTranslation();

  const handleClick = (_ev): void => {
    window.location.replace(getApiUrl("auth/google"));
  };

  return (
    <button onClick={handleClick} className={styles.baseStyle}>
      <Icon iconName={"GoogleIcon"} />
      <span>{t("auth.googleAuth")}</span>
    </button>
  );
}
