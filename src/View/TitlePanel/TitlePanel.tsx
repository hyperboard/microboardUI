import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "View/AppContext";
import { useSidePanelContext } from "View/SidePanel/SidePanelContext";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import { isIframe } from "lib/isIframe";
import { useForceUpdate } from "lib/useForceUpdate";
import React, {
	ChangeEventHandler,
	MouseEventHandler,
	useEffect,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Icon, Logo } from "../Icon";
import style from "./TitlePanel.module.css";
import { BoardRename, useBoardRenameContext } from "View/BoardName";

const MAX_BOARD_TITLE_LENGTH = 32;

export function TitlePanel() {
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

	const isMicroboardIframe =
		isIframe() && import.meta.env.INTEGRATION_UI !== "microboard";
	const isExport = board.tools.getExport();
	if (isExport) {
		return null;
	}

	const handleBoardRename: ChangeEventHandler = event => {
		setNewBoardName(event.currentTarget.value);
	};

	const handleRenameCancel = () => {
		setIsRenaming(false);
	};

	const handleBoardRenameStart: MouseEventHandler = event => {
		setIsRenaming(true);
		setNewBoardName(boardName);
	};

	const handleRenameConfirm = () => {
		app.storage.renameBoard(boardId, newBoardName);
	};

	const openExport = () => {
		board.tools.export();
	};

	const strippedName =
		boardName?.length > MAX_BOARD_TITLE_LENGTH
			? `${boardName?.slice(0, MAX_BOARD_TITLE_LENGTH)}...`
			: boardName;
	return (
		<UiPanel className={style.panel} padding={0} zIndex={10}>
			<SidePanelButton isOpen={isOpen} toggle={toggleSideMenu} />
			<UiSeparator vertical />
			<UiButton rounded="none" variant="secondary">
				{isMicroboardIframe ? (
					<span className={style.logo} translate="no">
						{t("appTitle")}
					</span>
				) : (
					<div className={style.logo}>
						<Logo />
						<span translate="no">{t("appTitle")}</span>
					</div>
				)}
			</UiButton>
			<UiSeparator vertical />
			<UiButton
				variant="secondary"
				rounded="none"
				onDoubleClick={handleBoardRenameStart}
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
			<UiSeparator vertical />
			<UiButton
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
}: {
	isOpen: boolean;
	toggle: () => void;
}): React.ReactElement {
	const { t } = useTranslation();

	if (isIframe() && import.meta.env.INTEGRATION_UI !== "microboard") {
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
		>
			<Icon iconName={isOpen ? "SidePanelClose" : "SidePanelOpen"} />
		</UiButton>
	);
}
