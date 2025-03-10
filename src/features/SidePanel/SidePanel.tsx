import { SortableContext } from "@dnd-kit/sortable";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import { useClickOutside } from "shared/lib/useClickOutside";
import React, {
	useEffect,
	useRef,
	useState,
	type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useAppContext } from "features/AppContext";
import { useContextMenuContext } from "features/ContextMenu";
import {
	Folder,
	FoldersDndContext,
	useOpenedFoldersContext,
} from "entities/Folder";
import { FoldersContextProvider } from "entities/Folder/FoldersContext";
import { Icon } from "shared/ui-lib/Icon";
import { useModal } from "features/Modal/ModalProvider";
import { ResizableEdge } from "./ResizableEdge";
import style from "./SidePanel.module.css";
import { useSidePanelContext } from "./SidePanelContext";
import { UiButton } from "shared/ui-lib/UiButton";
import { Tooltip } from "shared/ui-lib/UiButton/Tooltip";

const MIN_PANEL_WIDTH = 280;

export function SidePanel(): JSX.Element {
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

	useEffect(() => {
		if (!foldersRef.current) {
			return;
		}

		setFoldersRefState(foldersRef.current);
	}, [foldersRef.current]);

	useEffect(() => {
		setId(board.getBoardId());
	}, [board.getBoardId()]);

	const { showModal } = useModal();

	const panelRef = useClickOutside(() => {
		close();
	});

	const handleContextMenuOpen: MouseEventHandler = event => {
		event.preventDefault();
		close();
		open(event.clientX, event.clientY);
	};

	const handleAddNewMenu: MouseEventHandler<HTMLButtonElement> = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		const MENU_Y_POS_OFFSET = -85;
		const buttonRect = ev.currentTarget.getBoundingClientRect();
		open(ev.clientX, buttonRect.top + MENU_Y_POS_OFFSET);
	};

	useEffect(() => {
		if (board.getBoardId() === "blank") {
			openMenu();
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
						<FoldersContextProvider>
							<FoldersDndContext>
								<SortableContext
									items={[
										boardsList.getRootFolder()?.id ?? 0,
										boardsList.getDraftsFolder()?.id ?? 1,
										boardsList.getSharedFolder()?.id ?? 2,
									]}
								>
									<Folder
										accordionClassName={style.rootFolder}
										folder={boardsList.getRootFolder()}
									/>
									<Folder
										accordionClassName={style.rootFolder}
										folder={boardsList.getDraftsFolder()}
									/>
									<Folder
										folder={boardsList.getSharedFolder()}
									/>
								</SortableContext>
							</FoldersDndContext>
						</FoldersContextProvider>
					</div>
				</div>
			</div>
			<div className={style.bottom}>
				<button className={style.add} onClick={handleAddNewMenu}>
					<Icon iconName="Plus" width={16} height={16} />
					<span>{t("sidePanel.addNew")}</span>
				</button>
				<Button
					id={"miro"}
					pattern="primary"
					onClick={() => showModal("startImportMiro")}
					disabled={!account.isLoggedIn}
					className={style.importMiroBtn}
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
				</Button>
			</div>
			<ResizableEdge panelWidth={width} setWidth={setWidth} />
		</UiPanel>
	);
}
