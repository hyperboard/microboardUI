import React, { useEffect, useRef } from "react";
import { Item, Mbr } from "../../Board/Items";
import { useDomMbr } from "../../Board/Items/Mbr/useDomMbr";
import { useAppContext } from "../AppContext";
import { UiButton } from "../Ui/UiButton";
import { Icon } from "../Icon";
import styles from "./LinkToButton.module.css";
import * as process from "process";

interface Props {
	item: Item;
}

export const LinkToButton = ({ item }: Props) => {
	const linkToButtonRef = useRef<HTMLButtonElement | null>(null);
	const { app, board } = useAppContext();
	let mbr = useDomMbr({
		app,
		board,
		ref: linkToButtonRef,
		targetMbr: item.getMbr(),
		subjects: ["camera", "selection"],
		fit: "linkToBtn",
	});

	const handleClick = () => {
		const link = item.getLinkTo();
		if (!link) {
			return;
		}
		const url = new URL(link);
		const separatedLink = link.split("boards/");
		if (
			import.meta.env.BASE_URL === url.origin &&
			separatedLink.length > 1 &&
			separatedLink[1].includes(board.getBoardId())
		) {
			const itemId = url.searchParams.get("focus");
			if (!itemId) {
				return;
			}
			const item = board.items.getById(itemId);
			if (!item) {
				return;
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
			<Icon iconName="miro" width={20} height={20} />
		</UiButton>
	);
};
