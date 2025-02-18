import React from "react";
import { Icon } from "View/Icon";
import { useTranslation } from "react-i18next";
import styles from "./styles.module.css";

export function GoogleAuthBtn(): JSX.Element {
	const { t } = useTranslation();

	const handleClick = e => {
		window.location.replace(`${window.location.origin}/api/v1/auth/google`);
	};

	return (
		<button onClick={handleClick} className={styles.baseStyle}>
			<Icon iconName={"GoogleIcon"} />
			<span>{t("auth.googleAuth")}</span>
		</button>
	);
}
