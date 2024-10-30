import React, { useEffect, useRef, useState } from "react";
import { Connector, Item } from "../../../Board/Items";
import { useDomMbr } from "../../../Board/Items/Mbr/useDomMbr";
import { useAppContext } from "../../AppContext";
import { UiButton } from "../../Ui/UiButton";
import { Icon } from "../../Icon";
import styles from "./LinkToButton.module.css";
import { notify } from "../../Ui/Toast";
import { useTranslation } from "react-i18next";
import { useAppSubscription } from "../../../Board/useBoardSubscription";

async function getFavicon(url: string) {
	try {
		const response = await fetch(url);
		const text = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, "text/html");

		const iconLink = doc.querySelector(
			'link[rel="icon"], link[rel="shortcut icon"]',
		);

		if (iconLink && iconLink.getAttribute("href")) {
			return new URL(iconLink.getAttribute("href")!, url).href;
		} else {
			return undefined;
		}
	} catch {
		return undefined;
	}
}

interface Props {
	item: Item;
}

export const LinkToButton = ({ item }: Props) => {
	const linkToButtonRef = useRef<HTMLButtonElement | null>(null);
	const [iconUrl, setIconUrl] = useState<string | undefined>(
		item.getLinkTo()
			? `${new URL(item.getLinkTo()!).origin}/favicon.ico`
			: undefined,
	);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const { app, board } = useAppContext();

	const mbr = useDomMbr({
		app,
		board,
		ref: linkToButtonRef,
		targetMbr:
			item instanceof Connector
				? item.endPointer.path.getMbr()
				: item.getMbr(),
		subjects: ["camera", "selection"],
		fit: "linkToBtn",
	});

	const { t } = useTranslation();

	useEffect(() => {
		const url = item.getLinkTo()
			? `${new URL(item.getLinkTo()!).origin}/favicon.ico`
			: undefined;
		if (url !== iconUrl) {
			setIconUrl(url);
		}
	}, [item.getLinkTo()]);

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

	const setIcon = async () => {
		setIconUrl(undefined);
		if (!item.getLinkTo()) {
			return;
		}
		setIconUrl(await getFavicon(new URL(item.getLinkTo()!).origin));
	};

	const handleClick = () => {
		const link = item.getLinkTo();
		if (!link) {
			return;
		}
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
		return window.open(url, "_blank");
	};

	return (
		<UiButton
			style={{
				position: "absolute",
				left: mbr.left,
				top: mbr.top,
			}}
			className={styles.btn}
			ref={linkToButtonRef}
			tooltip={item.getLinkTo()}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
		>
			{iconUrl ? (
				<img
					ref={imgRef}
					className={styles.icon}
					src={iconUrl}
					alt="#"
					onError={setIcon}
				/>
			) : (
				<Icon iconName="linkTo" width={20} height={20} />
			)}
		</UiButton>
	);
};
