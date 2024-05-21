import { UiButton } from "View/Ui/UiButton";
import React from "react";

export function ImportFromMiro() {
	const onClickButtonImport = () => {
		const clientId = "3458764589599848573";
		const redirectUrl = import.meta.env.BASE_URL + "/boards/:boardId";

		window.location.href =
			"https://miro.com/oauth/authorize?response_type=code&client_id=" +
			clientId +
			"&redirect_uri=" +
			redirectUrl;
	};

	return (
		<UiButton id={"miro"} onClick={onClickButtonImport}>
			Импортировать доску из Miro
		</UiButton>
	);
}
