import React from "react";
import { useDomMbr } from "../../Board/Items/Mbr/useDomMbr";
import { useAppSubscription } from "../../Board/useBoardSubscription";
import { useForceUpdate } from "../../lib/useForceUpdate";
import { useAppContext } from "../AppContext";
import { LinkToButton } from "./LinkToButton";
import { Mbr } from "../../Board/Items";

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
			{[...board.items.listAll(), ...board.items.listFrames()]
				.filter(item => {
					const itemMbr = item.getMbr();
					const camera = board.camera.getMbr();
					return (
						item.getLinkTo() &&
						item.isInView(
							new Mbr(
								camera.left,
								camera.top + itemMbr.getHeight() - 22,
								camera.right - itemMbr.getWidth() + 22,
								camera.bottom,
							),
						)
					);
				})
				.map(item => {
					return <LinkToButton item={item} key={item.getId()} />;
				})}
		</>
	);
};
