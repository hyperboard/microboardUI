import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { useAppSubscription } from "App/useBoardSubscription";
import clsx from "clsx";
import Cookies from "js-cookie";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import {
  type ChangeEventHandler,
  MouseEventHandler,
  default as React,
  type RefObject,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { useSidePanelContext } from "features/SidePanel/SidePanelContext";
import { notify } from "shared/ui-lib/Toast/notify";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { ViewModeGuard } from "features/ViewModeGuard";
import { getApiUrl } from "../../Config";
import style from "./TitlePanel.module.css";
import { useClickOutside } from "shared/lib/useClickOutside";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { UiButton } from "shared/ui-lib/UiButton";
import { Icon, Logo } from "shared/ui-lib/Icon";
import { BoardRename } from "entities/BoardName";
import { createPortal } from "react-dom";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { CREATE_TEMPLATE_MODAL } from "features/Templates/CreateTemplateModal/CreateTemplateModal";
import { SHARE_SNAPSHOT_MODAL_ID } from "features/ShareSnapshotModal/ShareSnapshotModal";
import { isIframe } from "shared/lib/isIframe";
import { redirectParentPage } from "shared/lib/IframeModule";

const MAX_BOARD_TITLE_LENGTH = 32;

export function TitlePanel(): React.JSX.Element | null {
  const forceUpdate = useForceUpdate();
  const { t } = useTranslation();
  const { openModal } = useUiModalContext();
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
  const [gravityEnabled, setGravityEnabled] = useState(false);
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

  const handleBoardRename: ChangeEventHandler<HTMLInputElement> = (event) => {
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
  const handleBoardRenameStart: MouseEventHandler = (_event) => {
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

  const openShareSnapshot = (): void => {
    openModal(SHARE_SNAPSHOT_MODAL_ID);
    setIsDropdownOpen(false);
  };

  const exportHTML = (): string => {
    const htmlContent = board.serializeHTML();
    const blob = new Blob([htmlContent], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anch = document.createElement("a");
    anch.href = url;
    anch.download = `${boardName}.html`;
    anch.click();
    URL.revokeObjectURL(url);
    return htmlContent;
  };

  const toggleExportDropdown = (): void => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleGravity = (): void => {
    if (gravityEnabled) {
      board.disableGravity();
    } else {
      board.enableGravity();
    }
    setGravityEnabled((prev) => !prev);
  };

  const templateIdKey = `templateId:${board.getBoardId()}`;

  const saveTemplate = (): void => {
    const templateId = localStorage.getItem(templateIdKey);
    if (templateId) {
      updateTemplateReq(templateId);
    } else {
      openModal(CREATE_TEMPLATE_MODAL);
    }
  };

  async function updateTemplateReq(templateId: string): Promise<void> {
    try {
      const response = await fetch(`${getApiUrl()}/templates/${templateId}`, {
        method: "PATCH",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({}),
        redirect: "follow",
        referrerPolicy: "no-referrer",
      });

      if (response.status === 404) {
        // Шаблон удалён на сервере — сбрасываем и открываем форму создания
        localStorage.removeItem(templateIdKey);
        return openModal(CREATE_TEMPLATE_MODAL);
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
      console.error("Failed to update template.", error);
    }
  }

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
        <div className={style.logo}>
          <Logo id="logo" />
          <span translate="no">{t("appTitle")}</span>
        </div>
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
          onClick={(evt) => {
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
          rounded={
            window.enableTemplateCreating || window.enableGravity
              ? "none"
              : "right"
          }
          tooltip={isDropdownOpen ? undefined : t("export.tooltip")}
          tooltipPosition="bottom"
        >
          <Icon iconName="Export" />
        </UiButton>
        {isDropdownOpen && (
          <ExportDropdown
            buttonRef={clickOutsideRef}
            exportHTML={exportHTML}
            openExport={openExport}
            openShareSnapshot={openShareSnapshot}
          />
        )}
        {window.enableTemplateCreating && (
          <>
            <UiSeparator vertical className={style.tabletHide} />
            <UiButton
              className={style.tabletHide}
              onClick={saveTemplate}
              variant="secondary"
              rounded={window.enableGravity ? "none" : "right"}
              tooltip={t("template.save")}
              tooltipPosition="bottom"
            >
              <Icon iconName="Pen" />
            </UiButton>
          </>
        )}
        {window.enableGravity && (
          <>
            <UiSeparator vertical className={style.tabletHide} />
            <UiButton
              className={style.tabletHide}
              onClick={toggleGravity}
              variant="secondary"
              rounded="right"
              active={gravityEnabled}
              tooltip={gravityEnabled ? t("gravity.stop") : t("gravity.start")}
              tooltipPosition="bottom"
            >
              🪐
            </UiButton>
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

  const onClick = () => {
    if (isIframe()) {
      const currentPage = window.location.href;
      redirectParentPage(
        currentPage,
        currentPage.includes("dev")
          ? "https://dev-landing.microboard.io/"
          : "https://microboard.io/",
      );
      return;
    }
    toggle();
  };

  return (
    <UiButton
      id={isOpen ? "CloseSidePanel" : "OpenSidePanel"}
      tooltip={isOpen ? t("titlePanel.menu.close") : t("titlePanel.menu.open")}
      tooltipPosition="bottom-left"
      onClick={onClick}
      variant="secondary"
      rounded="left"
      className={className}
    >
      <Icon iconName={isOpen ? "SidePanelClose" : "SidePanelOpen"} />
    </UiButton>
  );
}

type ExportDropdownProps = {
  buttonRef: RefObject<HTMLButtonElement>;
  openExport: () => void;
  exportHTML: () => void;
  openShareSnapshot: () => void;
};

function ExportDropdown({
  buttonRef,
  openExport,
  exportHTML,
  openShareSnapshot,
}: ExportDropdownProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [buttonRef]);

  if (!position) return null;

  return createPortal(
    <div
      className={style.exportDropdown}
      style={{
        position: "absolute",
        top: position.top + 8,
        left: position.left,
      }}
    >
      <div onClick={openExport}>
        <Icon iconName="ExportPNG" width={20} height={20} />
        <p>{t("export.PNGTitle")}</p>
      </div>
      <div onClick={exportHTML}>
        <Icon iconName="ExportFile" width={20} height={20} />
        <p>{t("export.HTMLTitle")}</p>
      </div>
      <div onClick={openShareSnapshot}>
        <Icon iconName="ShareSnapshotLink" width={20} height={20} />
        <p>{t("export.HTMLSnapshot.HTMLSnapshotLink")}</p>
      </div>
    </div>,
    document.body,
  );
}
