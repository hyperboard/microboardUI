import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./KeycloakAuthBtn.module.css";
import { Button } from "shared/ui-lib/Button";
import { Icon } from "shared/ui-lib/Icon/Icon";

export const KeycloakAuthBtn: React.FC = () => {
	const { t } = useTranslation();

	const handleLogin = () => {
		window.location.href = "/api/v1/auth/keycloak";
	};

	return (
		<Button type="button" className={styles.button} onClick={handleLogin}>
			<Icon iconName="SignIn" className={styles.icon} />
			{t("auth.loginWithSSO")}
		</Button>
	);
};
