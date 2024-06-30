import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";

export function ImportFromMiro() {
	const { t } = useTranslation();

	const onClickButtonImport = () => {
		const clientId = "3458764589599848573";
		const redirectUrl = window.location.origin + "/boards/:boardId/";

		window.location.href =
			"https://miro.com/oauth/authorize?response_type=code&client_id=" +
			clientId +
			"&redirect_uri=" +
			redirectUrl;
	};

	return (
		<Button id={"miro"} onClick={onClickButtonImport} pattern="secondary">
			{t("miro.importMiroBtn")}
		</Button>
	);
}
