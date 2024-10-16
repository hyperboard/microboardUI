import React from "react";
import { useDomMbr } from "../../Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "../../Board/useBoardSubscription";
import { useForceUpdate } from "../../lib/useForceUpdate";
import { useAppContext } from "../AppContext";
import { LinkToButton } from "./LinkToButton";

export const LinksProvider = () => {
	const { app, board } = useAppContext();

	const forceUpdate = useForceUpdate();

	useAppSubscription(app, {
		subjects: ["items", "camera"],
		observer: () => {
			forceUpdate();
		},
	});

	return (
		<>
			{board.items
				.listAll()
				.filter(
					item => item.linkTo && item.isInView(board.camera.getMbr()),
				)
				.map(item => {
					return <LinkToButton item={item} key={item.getId()} />;
				})}
		</>
	);
};
