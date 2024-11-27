import React, { useCallback } from "react";
import { useAppSubscription } from "../../Board/useBoardSubscription";
import { useForceUpdate } from "../../lib/useForceUpdate";
import { useAppContext } from "../AppContext";
import { LinkToButton } from "./LinkToButton/LinkToButton";
import { Item } from "../../Board/Items";
import { notify } from "View/Ui/Toast/notify";
import { useTranslation } from "react-i18next";

export const LinksProvider = () => {
	const { app, board } = useAppContext();

	const forceUpdate = useForceUpdate();

	useAppSubscription(app, {
		subjects: ["items", "camera"],
		observer: () => {
			forceUpdate();
		},
	});

	const { t } = useTranslation();

	const handleClick = useCallback((item: Item) => {
		const link = item.getLinkTo();
		if (!link) {
			return;
		}

		const handleNotFoundItemLink = async () => {
			try {
				notify({
					body: t("linkToToast.noItem"),
					variant: "info",
					duration: 3000,
				});
			} catch (err) {
				console.error(err);
				notify({
					header: t("linkToToast.error.title"),
					body: t("linkToToast.error.description"),
					variant: "error",
				});
			}
		};

		const url = new URL(link);
		const separatedLink = link.split("boards/");
		if (
			url.origin === window.location.origin &&
			separatedLink.length > 1 &&
			separatedLink[1].includes(board.getBoardId())
		) {
			const itemId = url.searchParams.get("focus");
			if (!itemId) {
				return;
			}
			const item = board.items.getById(itemId);
			if (!item) {
				return handleNotFoundItemLink();
			}
			return board.camera.zoomToFit(item.getMbr());
		}
		window.open(url, "_blank");
	}, []);

	return (
		<>
			{[...board.items.listAll(), ...board.items.listFrames()]
				.filter(item => item.getLinkTo())
				.map(item => {
					return (
						<LinkToButton
							item={item}
							key={item.getId()}
							handleClick={handleClick}
						/>
					);
				})}
		</>
	);
};
