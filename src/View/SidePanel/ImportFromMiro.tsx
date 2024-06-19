import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

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
		<UiButton id={"miro"} onClick={onClickButtonImport}>
			{t("miro.importMiroBtn")}
		</UiButton>
	);
}
