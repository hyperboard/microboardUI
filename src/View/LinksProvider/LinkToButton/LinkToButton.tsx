import React, { memo, useEffect, useRef, useState } from "react";
import { Connector, Item } from "../../../Board/Items";
import { useDomMbr } from "../../../Board/Items/Mbr/useDomMbr";
import { useAppContext } from "../../AppContext";
import { UiButton } from "../../Ui/UiButton";
import { Icon } from "../../Icon";
import styles from "./LinkToButton.module.css";

async function getFavicon(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return undefined;
		}
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
	handleClick: (item: Item) => void;
}

export const LinkToButton = ({ item, handleClick }: Props) => {
	const linkToButtonRef = useRef<HTMLButtonElement | null>(null);
	const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
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

	useEffect(() => {
		let url: string | undefined = undefined;
		try {
			console.log(item.getLinkTo());
			url = `${new URL(item.getLinkTo()!).origin}/favicon.ico`;
		} catch {}

		if (url !== iconUrl) {
			setIconUrl(url);
		}
	}, [item.getLinkTo()]);

	const setIcon = async () => {
		if (!item.getLinkTo() || !iconUrl) {
			return;
		}
		const favicon = await getFavicon(new URL(item.getLinkTo()!).origin);

		if (favicon && favicon !== iconUrl) {
			setIconUrl(favicon);
		} else {
			setIconUrl(undefined);
		}
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
			onClick={() => handleClick(item)}
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
