import React, { useRef } from "react";
import { Item } from "../../Board/Items";
import { useDomMbr } from "../../Board/Items/Mbr/useDomMbr";
import { useAppContext } from "../AppContext";
import { UiButton } from "../Ui/UiButton";
import { Icon } from "../Icon";

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
		subjects: ["camera"],
		targetMbr: item.getMbr(),
	});

	const handleClick = () => {
		window.location.replace(item.linkTo);
	};

	return (
		<UiButton
			style={{
				position: "absolute",
				left: mbr.right,
				top: mbr.bottom,
			}}
			ref={linkToButtonRef}
			tooltip={item.linkTo}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
		>
			<Icon iconName="miro" />
		</UiButton>
	);
};
