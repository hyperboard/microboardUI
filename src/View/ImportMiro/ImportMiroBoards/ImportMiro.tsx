import React, { useEffect } from "react";
import { ErrorNotification } from "./Notifications";
import { useCopyBoardItems } from "./ImportBoardItem/useCopyBoardItems";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { useModal } from "View/Modal/ModalProvider";

export function ImportMiro(): React.ReactElement | null {
	const { app } = useAppContext();
	const navigate = useNavigate();
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const authCode = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const { showModal } = useModal();

	const fetchToken = async () => {
		try {
			// TODO using ENV after transferring to the client
			// const clientId = import.meta.env.MIRO_CLIENT_ID;
			// const clientSecret = import.meta.env.MIRO_CLIENT_SECRET;
			// const baseURl = import.meta.env.BASE_URL
			const clientId = "3458764589599848573";
			const clientSecret = "RWatK9uBMqwxXlCKRpBhwxivQXmP12Je";
			const redirectRoute = "/boards/blank?clipboard=true";
			const redirectUrl = window.location.origin + redirectRoute;

			const response = await fetch(
				getApiUrl(
					"/miro/token" +
						"?grant_type=authorization_code&client_id=" +
						clientId +
						"&client_secret=" +
						clientSecret +
						"&code=" +
						authCode +
						"&redirect_uri=" +
						redirectUrl,
				),
				{
					method: "POST",
					headers: {
						Accept: "application/json, application/*+json, application/x-jackson-smile, application/cbor",
					},
				},
			);

			const token = await response.json();
			if (token) {
				Cookies.set("miro_accessToken", token.access_token);
				openSeenLastBoard();
			}
		} catch (error) {
			console.error(error);
			showModal?.("errorNotification");
		}
	};

	const openSeenLastBoard = async (): Promise<void> => {
		const lastSeenBoardId = app.getLastBoardId();

		if (!lastSeenBoardId) {
			console.error("Last seen board is undefined");
			return;
		}

		await app.openBoard(lastSeenBoardId).then(() => {
			navigate(`/boards/${lastSeenBoardId}?clipboard=true`, {
				replace: true,
			});
			app.render();
		});
		const lastSeenBoard = app.getBoard();
		useCopyBoardItems(lastSeenBoard);
	};

	useEffect(() => {
		const token = Cookies.get("miro_accessToken");

		if(!authCode && !teamIdSearch) {
			return
		}

		if (!token || token === "undefined") {
			fetchToken();
		}

		if (token && token !== "undefined") {
			openSeenLastBoard();
		}
	}, []);

	return <ErrorNotification />;
}
