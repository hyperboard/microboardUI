import React, { useRef } from "react";
import { Item } from "../../Board/Items";
import { useDomMbr } from "../../Board/Items/Mbr/useDomMbr";
import { useAppContext } from "../AppContext";
import { UiButton } from "../Ui/UiButton";
import { Icon } from "../Icon";
import styles from "./LinkToButton.module.css";

interface Props {
	item: Item;
}

export const LinkToButton = ({ item }: Props) => {
	const linkToButtonRef = useRef<HTMLButtonElement | null>(null);
	const { app, board } = useAppContext();
	const mbr = useDomMbr({
		app,
		board,
		ref: linkToButtonRef,
		targetMbr: item.getMbr(),
		subjects: ["camera", "selection"],
		fit: "linkToBtn",
	});

	const handleClick = () => {
		window.location.replace(item.getLinkTo());
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
