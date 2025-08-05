import { SortableContext } from "@dnd-kit/sortable";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import {
  Folder,
  FoldersDndContext,
  useOpenedFoldersContext,
} from "entities/Folder";
import { DraggingWrapper } from "entities/Folder/DraggingWrapper";
import { DraggingItem } from "entities/Folder/DragOverlay";
import { useAppContext } from "features/AppContext";
import { useContextMenuContext } from "features/ContextMenu";
import { IMPORT_MIRO_START_MODAL } from "features/ImportMiro/ImportMiroStartModal/ImportMiroStartModal";
import React, {
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "shared/lib/useClickOutside";
import { useIsPhoneScreen } from "shared/lib/useIsPhoneScreen";
import { Icon } from "shared/ui-lib/Icon";
import { Tooltip } from "shared/ui-lib/Tooltip";
import { UiButton } from "shared/ui-lib/UiButton";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { ResizableEdge } from "./ResizableEdge";
import style from "./SidePanel.module.css";
import { useSidePanelContext } from "./SidePanelContext";

const MIN_PANEL_WIDTH = 280;

export function SidePanel(): React.JSX.Element {
  const { board } = useAppContext();
  const { isOpen, toggleSideMenu, isHighlighted, openMenu } =
    useSidePanelContext();
  const { setFoldersRefState, setId } = useOpenedFoldersContext();
  const { open, close } = useContextMenuContext();
  const { t } = useTranslation();
  const [width, setWidth] = useState(300);
  const account = useAccount();
  const boardsList = useBoardsList();
  const foldersRef = useRef<HTMLDivElement>(null);
  const { openModal } = useUiModalContext();
  const isPhoneScreen = useIsPhoneScreen();

  useEffect(() => {
    if (!foldersRef.current) {
      return;
    }

    setFoldersRefState(foldersRef.current);
  }, [foldersRef.current]);

  useEffect(() => {
    setId(board.getBoardId());
  }, [board.getBoardId()]);

  const panelRef = useClickOutside(() => {
    close();
  });

  const handleContextMenuOpen: MouseEventHandler = (event) => {
    event.preventDefault();
    close();
    open(event.clientX, event.clientY);
  };

  const handleAddNewMenu: MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const MENU_Y_POS_OFFSET = -85;
    const buttonRect = ev.currentTarget.getBoundingClientRect();
    open(ev.clientX, buttonRect.top + MENU_Y_POS_OFFSET);
  };

  useEffect(() => {
    if (board.getBoardId() === "blank" && !isPhoneScreen) {
      openMenu();
    }

    if (board.getBoardId() !== "blank" && isPhoneScreen) {
      if (isOpen) {
        toggleSideMenu();
        return;
      }
      close();
    }
  }, [board.getBoardId()]);

  const newWidth = width <= MIN_PANEL_WIDTH ? MIN_PANEL_WIDTH : width;
  return (
    <UiPanel
      ref={panelRef}
      onContextMenu={handleContextMenuOpen}
      padding={0}
      className={clsx(style.sidePanel, {
        [style.open]: isOpen,
        [style.highlited]: isHighlighted,
      })}
      style={{ width: newWidth }}
    >
      <div className={style.content}>
        <div className={style.header}>
          <h3 className={style.title}>{t("sidePanel.title")}</h3>
          <UiButton
            onClick={toggleSideMenu}
            variant="secondary"
            className={style.close}
          >
            <Icon iconName="Close" />
          </UiButton>
        </div>
        <div className={style.folders} ref={foldersRef}>
          <div className={style.foldersWrapper}>
            <FoldersDndContext>
              <SortableContext
                items={[
                  boardsList.getRootFolder()?.id ?? 0,
                  boardsList.getDraftsFolder()?.id ?? 1,
                  boardsList.getSharedFolder()?.id ?? 2,
                ]}
              >
                <Folder
                  key={boardsList.getRootFolder()?.id ?? "root"}
                  accordionClassName={style.rootFolder}
                  folder={boardsList.getRootFolder()}
                />
                <Folder
                  key={boardsList.getDraftsFolder()?.id ?? "drafts"}
                  accordionClassName={style.rootFolder}
                  folder={boardsList.getDraftsFolder()}
                />
                <Folder
                  key={boardsList.getSharedFolder()?.id ?? "shared"}
                  folder={boardsList.getSharedFolder()}
                />
              </SortableContext>
              {createPortal(
                <DraggingWrapper>
                  <DraggingItem />
                </DraggingWrapper>,
                document.body,
              )}
            </FoldersDndContext>
          </div>
        </div>
      </div>
      <div className={style.bottom}>
        <button className={style.add} onClick={handleAddNewMenu}>
          <Icon iconName="Plus" width={16} height={16} />
          <span>{t("sidePanel.addNew")}</span>
        </button>
        <UiButton
          id={"miro"}
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            openModal(IMPORT_MIRO_START_MODAL);
          }}
          disabled={!account.isLoggedIn}
          className={style.importMiroBtn}
          size="lg"
        >
          <span>{t("miro.importMiroBtn")}</span>
          <Tooltip
            tooltip={
              !account.isLoggedIn
                ? t("miro.authTooltip")
                : t("miro.tooltipClipboardImport")
            }
            tooltipPosition="top-center-fixed"
            tooltipAlign="left"
          />
        </UiButton>
      </div>
      <ResizableEdge panelWidth={width} setWidth={setWidth} />
    </UiPanel>
  );
}
