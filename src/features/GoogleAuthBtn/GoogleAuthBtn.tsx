import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./GoogleAuthBtn.module.css";

export function GoogleAuthBtn() {
	const { t } = useTranslation();

	const handleClick = (_ev): void => {
		window.location.replace(`${window.location.origin}/api/v1/auth/google`);
	};

	return (
		<button onClick={handleClick} className={styles.baseStyle}>
			<Icon iconName={"GoogleIcon"} />
			<span>{t("auth.googleAuth")}</span>
		</button>
	);
}
