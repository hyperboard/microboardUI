import React, { useRef, useState } from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "View/AppContext";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import styles from "./HyperLink.module.css";
import { Mbr } from "Board/Items/Mbr/Mbr";
import { useForceUpdate } from "lib/useForceUpdate";
import { Connector } from "Board/Items/Connector/Connector";

export const HyperLink = () => {
	const [currentLink, setCurrentLink] = useState<{
		hyperLink: string;
		linkMbr: Mbr;
	} | null>(null);
	const [isTooltipUnderPointer, setIsTooltipUnderPointer] = useState(false);
	const { board, app } = useAppContext();
	const forceUpdate = useForceUpdate();

	const link = board.items
		.getUnderPointer()
		.pop()
		?.getRichText()
		?.getHyperLinkByPointerCoordinates(board.pointer.point);
	if (
		link &&
		!isTooltipUnderPointer &&
		link.hyperLink !== currentLink?.hyperLink
	) {
		setCurrentLink(link);
	}
	if (!link && !isTooltipUnderPointer && currentLink) {
		setCurrentLink(null);
	}

	useAppSubscription({
		subjects: ["pointer"],
		observer: () => forceUpdate(),
	});
	const linkContainerRef = useRef<HTMLDivElement>(null);

	const mbr = useDomMbr({
		app,
		board,
		ref: linkContainerRef,
		targetMbr: currentLink?.linkMbr,
		subjects: ["pointer"],
		fit: "hyperLink",
	});

	if (!isTooltipUnderPointer && !currentLink) {
		return null;
	}

	return (
		<div
			ref={linkContainerRef}
			className={styles.linkContainer}
			style={{
				top: mbr.top,
				left: mbr.left,
			}}
			onMouseEnter={() => setIsTooltipUnderPointer(true)}
			onMouseLeave={() => setIsTooltipUnderPointer(false)}
		>
			<a
				className={styles.link}
				target="_blank"
				href={currentLink?.hyperLink}
				rel="noreferrer"
			>
				{currentLink?.hyperLink}
			</a>
		</div>
	);
};
