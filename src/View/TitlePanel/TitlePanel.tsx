import { useAppSubscription } from "Board/useBoardSubscription";
import clsx from "clsx";
import { useForceUpdate } from "lib/useForceUpdate";
import {
	type ChangeEventHandler,
	default as React,
	type MouseEventHandler,
	useEffect,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { BoardRename } from "View/BoardName";
import { useSidePanelContext } from "View/SidePanel/SidePanelContext";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import { Icon, Logo } from "../Icon";
import style from "./TitlePanel.module.css";

const MAX_BOARD_TITLE_LENGTH = 32;

export function TitlePanel(): JSX.Element | null {
	const forceUpdate = useForceUpdate();
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const { isOpen, toggleSideMenu } = useSidePanelContext();
	useAppSubscription(app, { observer: forceUpdate, subjects: ["tools"] });
	useEffect(() => {
		app.storage.subject.subscribe(forceUpdate);

		return () => {
			app.storage.subject.unsubscribe(forceUpdate);
		};
	}, []);

	const boardId = board.getBoardId();
	const boardName =
		app.storage.getBoard(boardId)?.name || t("board.untitled");

	const [isRenaming, setIsRenaming] = useState(false);
	const [newBoardName, setNewBoardName] = useState(boardName);

	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}

	const handleBoardRename: ChangeEventHandler<HTMLInputElement> = event => {
		if (!event.currentTarget) {
			return;
		}
		setNewBoardName(event.currentTarget.value);
	};

	const handleRenameCancel = () => {
		setIsRenaming(false);
	};

	const handleBoardRenameStart: MouseEventHandler = () => {
		setIsRenaming(true);
		setNewBoardName(boardName);
	};

	const handleRenameConfirm = () => {
		app.storage.renameBoard(boardId, newBoardName);
	};

	const openExport = () => {
		board.tools.export();
	};

	// @ts-expect-error import.meta object didn't exists in common-js modules
	const isMicroboard = import.meta.env.INTEGRATION_UI === "microboard";

	const strippedName =
		(boardName?.length ?? 0) > MAX_BOARD_TITLE_LENGTH
			? `${boardName?.slice(0, MAX_BOARD_TITLE_LENGTH)}...`
			: boardName ?? "";
	return (
		<UiPanel className={style.panel} padding={0} zIndex={10}>
			<SidePanelButton
				isOpen={isOpen}
				toggle={toggleSideMenu}
				className={style.menuButton}
			/>
			<UiSeparator vertical className={style.mobileHide} />
			<UiButton
				rounded="none"
				variant="secondary"
				className={clsx(style.mobileHide, style.logoWrapper)}
			>
				{isMicroboard ? (
					<div className={style.logo}>
						<Logo id="logo" />
						<span translate="no">{t("appTitle")}</span>
					</div>
				) : (
					<span className={style.logo} translate="no">
						{t("appTitle")}
					</span>
				)}
			</UiButton>
			<UiSeparator vertical className={style.tabletHide} />
			<UiButton
				variant="secondary"
				rounded="none"
				onDoubleClick={handleBoardRenameStart}
				className={style.tabletHide}
				onClick={evt => {
					evt.preventDefault();
					evt.stopPropagation();
				}}
			>
				{isRenaming ? (
					<BoardRename
						width={newBoardName.length}
						value={newBoardName}
						onCancel={handleRenameCancel}
						onChange={handleBoardRename}
						onConfirm={handleRenameConfirm}
						className={style.rename}
					/>
				) : (
					<span className={style.name}>{strippedName}</span>
				)}
			</UiButton>
			<UiSeparator vertical className={style.tabletHide} />
			<UiButton
				className={style.tabletHide}
				onClick={openExport}
				variant="secondary"
				rounded="right"
				tooltip={t("export.tooltip")}
				tooltipPosition="bottom"
			>
				<Icon iconName="Export" />
			</UiButton>
		</UiPanel>
	);
}

function SidePanelButton({
	isOpen,
	toggle,
	className,
}: {
	isOpen: boolean;
	toggle: () => void;
	className?: string;
}): React.ReactElement {
	const { t } = useTranslation();

	// @ts-expect-error import.meta object didn't exists in common-js modules
	if (import.meta.env.INTEGRATION_UI !== "microboard") {
		return <></>;
	}
	return (
		<UiButton
			id={isOpen ? "CloseSidePanel" : "OpenSidePanel"}
			tooltip={
				isOpen ? t("titlePanel.menu.close") : t("titlePanel.menu.open")
			}
			tooltipPosition="bottom-left"
			onClick={toggle}
			variant="secondary"
			rounded="left"
			className={className}
		>
			<Icon iconName={isOpen ? "SidePanelClose" : "SidePanelOpen"} />
		</UiButton>
	);
}
