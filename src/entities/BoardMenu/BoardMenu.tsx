import React, { useEffect, useRef, useState } from "react";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Mbr } from "../../Board/Items";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppSubscription } from "App/useBoardSubscription";
import { UiSeparator } from "shared/ui-lib/UiSeparator/UiSeparator";
import { Comments } from "entities/BoardMenu/sections/Comments";
import { Items } from "entities/BoardMenu/sections/Items";
import { MouseOrTrackpad } from "entities/BoardMenu/sections/MouseOrTrackpad";
import styles from "./BoardMenu.module.css";

export const BoardMenu = () => {
	const menuRef = useRef<HTMLDivElement>(null);
	const { board, app } = useAppContext();
	const cursorPosition = board.pointer.point;
	const [isOpen, setIsOpen] = useState(false);
	const position = useRef(new Mbr());
	const shouldUpdatePosition = useRef(true);

	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: [
			"items",
			"tools",
			"selection",
			"selectionItem",
			"selectionItems",
		],
		observer: () => {
			forceUpdate();
		},
	});

	const mbr = useDomMbr({
		app,
		board,
		ref: menuRef,
		targetMbr: new Mbr(
			cursorPosition.x,
			cursorPosition.y,
			cursorPosition.x,
			cursorPosition.y,
		),
		subjects: ["camera"],
		fit: "boardMenu",
	});

	if (shouldUpdatePosition.current) {
		position.current = mbr;
	} else {
		setTimeout(() => (shouldUpdatePosition.current = true), 100);
	}

	useEffect(() => {
		setIsOpen(board.getIsBoardMenuOpen());
	}, [board.getIsBoardMenuOpen()]);

	return isOpen ? (
		<UiPanel
			onPointerUp={() => (shouldUpdatePosition.current = false)}
			onPointerDown={() => (shouldUpdatePosition.current = false)}
			onClick={() => (shouldUpdatePosition.current = false)}
			vertical={true}
			ref={menuRef}
			style={{
				position: "absolute",
				left: position.current.left,
				top: position.current.top,
				gap: "2px",
			}}
			padding={4}
			zIndex={5}
		>
			<Items />
			<UiSeparator className={styles.separator} vertical={false} />
			<MouseOrTrackpad />
			<UiSeparator className={styles.separator} vertical={false} />
			<Comments />
		</UiPanel>
	) : (
		<></>
	);
};
