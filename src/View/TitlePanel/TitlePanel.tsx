import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { useAppSubscription } from "Board/useBoardSubscription";
import clsx from "clsx";
import Cookies from "js-cookie";
import { useForceUpdate } from "lib/useForceUpdate";
import {
	type ChangeEventHandler,
	MouseEventHandler,
	default as React,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { BoardRename } from "View/BoardName";
import { useSidePanelContext } from "View/SidePanel/SidePanelContext";
import { notify } from "View/Ui/Toast/notify";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import { ViewModeGuard } from "View/ViewModeGuard";
import { getApiUrl } from "../../Config";
import { Icon, Logo } from "../Icon";
import { useModal } from "../Modal/ModalProvider";
import { CreateTemplateModal } from "../Templates";
import style from "./TitlePanel.module.css";
import { useClickOutside } from "lib/useClickOutside";

const MAX_BOARD_TITLE_LENGTH = 32;

export function TitlePanel(): JSX.Element | null {
	const forceUpdate = useForceUpdate();
	const { t } = useTranslation();
	const { showModal } = useModal();
	const { board } = useAppContext();
	const { isOpen, toggleSideMenu } = useSidePanelContext();
	useAppSubscription({ observer: forceUpdate, subjects: ["tools"] });
	const boardsList = useBoardsList();
	const account = useAccount();

	const boardId = board.getBoardId();
	const boardName =
		boardsList.getBoardInfo(boardId)?.title || t("board.untitled");
	const isBlank = boardId === "blank";
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const clickOutsideRef = useClickOutside<HTMLButtonElement>(
		() => setIsDropdownOpen(false),
		[],
		true,
	);
	const [isRenaming, setIsRenaming] = useState(false);
	const [newBoardName, setNewBoardName] = useState(boardName);
	const [isBoardRenameBtnShown, setIsBoardRenameBtnShown] = useState(false);
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

	const handleRenameCancel = (): void => {
		setIsRenaming(false);
	};

	const canRename = account.permissions.checkPermissions(
		"owns",
		"boards",
		boardId ?? "",
	);
	const handleBoardRenameStart: MouseEventHandler = _event => {
		if (!canRename || isBlank || board.getInterfaceType() === "view") {
			return;
		}
		setIsRenaming(true);
		setNewBoardName(boardName);
	};

	const handleRenameConfirm = (): void => {
		boardsList.rename(boardId, newBoardName);
	};

	const openExport = (): void => {
		board.tools.export();
	};

	const exportHTML = async (): Promise<string> => {
		const htmlContent = await board.serializeHTML();
		const blob = new Blob([htmlContent], {
			type: "text/html;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const anch = document.createElement("a");
		anch.href = url;
		anch.download = `${board.getBoardId()}.html`;
		anch.click();
		URL.revokeObjectURL(url);
		return htmlContent;
	};

	const toggleExportDropdown = (): void => {
		setIsDropdownOpen(prev => !prev);
	};

	const saveTemplate = (): void => {
		const body = JSON.stringify({ snapshot: board.getSnapshot() });
		saveTemplateReq(body);
	};

	async function saveTemplateReq(body: any): Promise<void> {
		try {
			const response = await fetch(
				`${getApiUrl()}/templates/${board.getBoardId()}`,
				{
					method: "PATCH",
					mode: "cors",
					cache: "no-cache",
					credentials: "same-origin",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${Cookies.get("accessToken")}`,
					},
					body,
					redirect: "follow",
					referrerPolicy: "no-referrer",
				},
			);

			if (response.status === 204) {
				return showModal("createTemplate");
			}

			if (!response.ok) {
				throw new Error("response not OK");
			}
			notify({
				body: t("template.saveSuccess"),
				variant: "info",
				duration: 3000,
			});
		} catch (error) {
			console.error("Failed to create template.", error);
		}
	}

	// @ts-expect-error import.meta object didn't exists in common-js modules
	const isMicroboard = import.meta.env.INTEGRATION_UI === "microboard";

	const strippedName =
		(boardName?.length ?? 0) > MAX_BOARD_TITLE_LENGTH
			? `${boardName?.slice(0, MAX_BOARD_TITLE_LENGTH)}...`
			: (boardName ?? "");
	return (
		<UiPanel className={style.panel} padding={0} zIndex={10}>
			<ViewModeGuard iframe>
				<SidePanelButton
					isOpen={isOpen}
					toggle={toggleSideMenu}
					className={style.menuButton}
				/>
				<UiSeparator vertical className={style.mobileHide} />
			</ViewModeGuard>
			<UiButton
				rounded={isBoardRenameBtnShown ? "none" : "right"}
				variant="secondary"
				className={clsx(
					style.mobileHide,
					style.logoWrapper,
					board.getInterfaceType() === "view" && style.viewMode,
				)}
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
			<ViewModeGuard
				mode={["edit", "view"]}
				callback={() => setIsBoardRenameBtnShown(true)}
				fallbackCb={() => setIsBoardRenameBtnShown(false)}
			>
				<UiSeparator vertical className={style.tabletHide} />
				<UiButton
					variant="secondary"
					rounded="none"
					onDoubleClick={handleBoardRenameStart}
					className={clsx(
						style.tabletHide,
						board.getInterfaceType() === "view" && style.viewMode,
					)}
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
						<span className={style.name}>
							{isBlank ? t("noBoard.title") : strippedName}
						</span>
					)}
				</UiButton>
			</ViewModeGuard>
			<ViewModeGuard>
				<UiSeparator vertical className={style.tabletHide} />
				<UiButton
					ref={clickOutsideRef}
					className={style.tabletHide}
					onClick={toggleExportDropdown}
					variant="secondary"
					rounded="right"
					tooltip={t("export.tooltip")}
					tooltipPosition="bottom"
				>
					<Icon iconName="Export" />
				</UiButton>
				{isDropdownOpen && (
					<div className={style.exportDropdown}>
						<div onClick={openExport}>
							<strong>PNG</strong>
							<p>{t("export.PNGDescription")}</p>
						</div>
						<div onClick={exportHTML}>
							<strong>
								HTML<span className={style.betaTag}>Beta</span>
							</strong>
							<p>{t("export.HTMLDescription")}</p>
						</div>
					</div>
				)}
				{window.enableTemplateCreating && (
					<>
						<UiSeparator vertical className={style.tabletHide} />
						<UiButton
							className={style.tabletHide}
							onClick={saveTemplate}
							variant="secondary"
							rounded="right"
							tooltip={t("template.save")}
							tooltipPosition="bottom"
						>
							<Icon iconName="Pen" />
						</UiButton>
						<CreateTemplateModal />
					</>
				)}
			</ViewModeGuard>
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
