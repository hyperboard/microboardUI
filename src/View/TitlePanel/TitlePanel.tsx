import {useAccount} from "App/useAccount";
import {useBoardsList} from "App/useBoardsList";
import {useAppSubscription} from "Board/useBoardSubscription";
import clsx from "clsx";
import {useForceUpdate} from "lib/useForceUpdate";
import {
    type ChangeEventHandler,
    MouseEventHandler,
    default as React,
    useState,
} from "react";
import {useTranslation} from "react-i18next";
import {useAppContext} from "View/AppContext";
import {BoardRename} from "View/BoardName";
import {useSidePanelContext} from "View/SidePanel/SidePanelContext";
import {UiButton} from "View/Ui/UiButton";
import {UiPanel} from "View/Ui/UiPanel";
import {UiSeparator} from "View/Ui/UiSeparator";
import {Icon, Logo} from "../Icon";
import style from "./TitlePanel.module.css";
import {ViewModeGuard} from "View/ViewModeGuard";
import {CreateTemplateModal} from "../Templates";
import {getApiUrl} from "../../Config";
import {useModal} from "../Modal/ModalProvider";
import Cookies from "js-cookie";
import {notify} from "View/Ui/Toast/notify";

const MAX_BOARD_TITLE_LENGTH = 32;

export function TitlePanel(): JSX.Element | null {
    const forceUpdate = useForceUpdate();
    const {t} = useTranslation();
    const {showModal} = useModal();
    const {app, board} = useAppContext();
    const {isOpen, toggleSideMenu} = useSidePanelContext();
    useAppSubscription(app, {observer: forceUpdate, subjects: ["tools"]});
    const boardsList = useBoardsList();
    const account = useAccount();

    const boardId = board.getBoardId();
    const boardName =
        boardsList.getBoardInfo(boardId)?.title || t("board.untitled");
    const isBlank = boardId === "blank";

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

    const handleRenameCancel = (): void => {
        setIsRenaming(false);
    };

    const canRename = account.permissions.checkPermissions(
        "owns",
        "boards",
        boardId ?? "",
    );
    const handleBoardRenameStart: MouseEventHandler = _event => {
        if (!canRename || isBlank || board.interfaceType === "view") {
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

    const saveTemplate = () => {
        const body = JSON.stringify({snapshot: board.getSnapshot()});
        saveTemplateReq(body)
    };

    async function saveTemplateReq(body: any) {
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
            if (!response.ok) {
                if (response.status === 404) {
                    return showModal("createTemplate")
                }
                throw new Error("response not OK");
            }
            notify({
                body: t("template.saveSuccess"),
                variant: "info",
                duration: 3000,
            })
        } catch (error) {
            console.error("Failed to create template.", error);
        }
    }

    // @ts-expect-error import.meta object didn't exists in common-js modules
    const isMicroboard = import.meta.env.INTEGRATION_UI === "microboard";

    const strippedName =
        (boardName?.length ?? 0) > MAX_BOARD_TITLE_LENGTH
            ? `${boardName?.slice(0, MAX_BOARD_TITLE_LENGTH)}...`
            : boardName ?? "";
    return (
        <UiPanel className={style.panel} padding={0} zIndex={10}>
            <ViewModeGuard>
                <SidePanelButton
                    isOpen={isOpen}
                    toggle={toggleSideMenu}
                    className={style.menuButton}
                />
                <UiSeparator vertical className={style.mobileHide}/>
            </ViewModeGuard>
            <UiButton
                rounded="none"
                variant="secondary"
                className={clsx(
                    style.mobileHide,
                    style.logoWrapper,
                    board.interfaceType === "view" && style.viewMode,
                )}
            >
                {isMicroboard ? (
                    <div className={style.logo}>
                        <Logo id="logo"/>
                        <span translate="no">{t("appTitle")}</span>
                    </div>
                ) : (
                    <span className={style.logo} translate="no">
						{t("appTitle")}
					</span>
                )}
            </UiButton>
            <UiSeparator vertical className={style.tabletHide}/>
            <UiButton
                variant="secondary"
                rounded="none"
                onDoubleClick={handleBoardRenameStart}
                className={clsx(
                    style.tabletHide,
                    board.interfaceType === "view" && style.viewMode,
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
            <ViewModeGuard>
                <UiSeparator vertical className={style.tabletHide}/>
                <UiButton
                    className={style.tabletHide}
                    onClick={openExport}
                    variant="secondary"
                    rounded="right"
                    tooltip={t("export.tooltip")}
                    tooltipPosition="bottom"
                >
                    <Icon iconName="Export"/>
                </UiButton>
                {window.enableTemplateCreating &&
                    <>
                        <UiSeparator vertical className={style.tabletHide}/>
                        <UiButton
                            className={style.tabletHide}
                            onClick={saveTemplate}
                            variant="secondary"
                            rounded="right"
                            tooltip={t("template.save")}
                            tooltipPosition="bottom"
                        >
                            <Icon iconName="Pen"/>
                        </UiButton>
                        <CreateTemplateModal/>
                    </>
                }
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
    const {t} = useTranslation();

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
            <Icon iconName={isOpen ? "SidePanelClose" : "SidePanelOpen"}/>
        </UiButton>
    );
}
