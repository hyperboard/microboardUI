import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Mbr } from "../../Board/Items";
import { Button } from "../../shared/ui-lib/Button";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAppSubscription } from "Board/useBoardSubscription";
import styles from "./BoardMenu.module.css";
import { useCommentsContext } from "entities/comments";
import { useTranslation } from "react-i18next";
import { useAccount } from "App/useAccount";
import { ButtonWithMenu } from "features/ToolsPanel/Buttons/ButtonWithMenu/ButtonWithMenu";
import { ToggleMark } from "shared/ui-lib/ToggleMark/ToggleMark";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { UiSeparator } from "shared/ui-lib/UiSeparator/UiSeparator";

export const BoardMenu = () => {
	const menuRef = useRef<HTMLDivElement>(null);
	const { board, app } = useAppContext();
	const cursorPosition = board.pointer.point;
	const [isOpen, setIsOpen] = useState(false);
	const [isSetControlModeOpen, setIsSetControlModeOpen] = useState(false);
	const position = useRef(new Mbr());
	const shouldUpdatePosition = useRef(true);
	const { setShowResolved, showResolved } = useCommentsContext();
	const { t } = useTranslation();
	const account = useAccount();
	const isOwner = account.permissions.checkPermissions(
		"owns",
		"boards",
		board.getBoardId(),
	);

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

	const toggleShowResolved = () => {
		setShowResolved(!showResolved);
		board.setIsBoardMenuOpen(false);
	};

	const resolveAllComments = () => {
		const username = account.info?.email;
		if (!username) {
			return;
		}
		board.items.getComments().forEach(comment => {
			if (!comment.getResolved()) {
				comment.setResolved(true);
			}
		});
	};

	const setControlMode = (mode: "auto" | "mouse" | "trackpad") => {
		app.setControlMode(mode);
		setIsSetControlModeOpen(false);
	};

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
				padding: "12px 0",
			}}
			zIndex={5}
		>
			<ButtonWithMenu
				className={styles.buttonWithMenu}
				isOpen={isSetControlModeOpen}
				button={
					<Button
						onClick={() =>
							setIsSetControlModeOpen(!isSetControlModeOpen)
						}
						className={styles.btn}
						pattern="tertiary"
					>
						{t("boardMenu.controlMode.tooltip")}
					</Button>
				}
			>
				<UiPanel rounded={"full"} gap={8} grid vertical>
					<Button
						onClick={() => setControlMode("mouse")}
						className={styles.btn}
						pattern="tertiary"
					>
						<div className={styles.buttonContainer}>
							<Icon iconName="Mouse" width={16} height={16} />
							{t("boardMenu.controlMode.mouse")}
						</div>
						<ToggleMark
							isActive={app.getSettings().controlMode === "mouse"}
						/>
					</Button>
					<Button
						onClick={() => setControlMode("trackpad")}
						className={styles.btn}
						pattern="tertiary"
					>
						<div className={styles.buttonContainer}>
							<Icon iconName="Trackpad" width={16} height={16} />
							{t("boardMenu.controlMode.trackpad")}
						</div>
						<ToggleMark
							isActive={
								app.getSettings().controlMode === "trackpad"
							}
						/>
					</Button>
					<Button
						onClick={() => setControlMode("auto")}
						className={styles.btn}
						pattern="tertiary"
					>
						<div className={styles.buttonContainer}>
							<Icon iconName="Auto" width={16} height={16} />
							{t("boardMenu.controlMode.auto")}
						</div>
						<ToggleMark
							isActive={app.getSettings().controlMode === "auto"}
						/>
					</Button>
				</UiPanel>
			</ButtonWithMenu>
			{isOwner && (
				<>
					<UiSeparator vertical={false} />
					<Button
						onClick={toggleShowResolved}
						className={styles.btn}
						pattern="tertiary"
					>
						{showResolved
							? t("boardMenu.hideResolved")
							: t("boardMenu.showResolved")}
					</Button>
					<Button
						onClick={resolveAllComments}
						className={styles.btn}
						pattern="tertiary"
					>
						{t("boardMenu.resolveAll")}
					</Button>
				</>
			)}
		</UiPanel>
	) : (
		<></>
	);
};
