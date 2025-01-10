import { shouldShow } from "lib/queryStringParser";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useRef } from "react";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { AccessDeniedModal } from "View/AccessDeniedModal";
import { AIInput } from "View/AIInput/AIInput";
import { useAppContext } from "View/AppContext";
import { Canvas } from "View/Canvas";
import { ChangePasswordModal } from "View/ChangePasswordModal";
import { ContextMenu } from "View/ContextMenu";
import { ContextPanel } from "View/ContextPanel";
import { ExportPanel } from "View/ExportPanel";
import { ExportVisible } from "View/ExportPanel/ExportVisible";
import { ImportMiro, ImportMiroStartModal } from "View/ImportMiro";
import { ItemTooltip } from "View/ItemTooltip";
import { LandingMenu, MobileLandingMenu } from "View/LandingMenu";
import { UserTracking } from "View/Presence/UserTracking/UserTracking";
import { ProfileSettingsModal } from "View/ProfileSettingsModal";
import { ShareModal } from "View/ShareModal";
import { SidePanelsContainer } from "View/SidePanelsContainer";
import { TextEditors } from "View/TextEditor/TextEditor";
import { ToastProvider } from "View/ToastProvider";
import { UiModalBackground } from "View/Ui/UiModal";
import { UserPanelLayout } from "View/UserPanel/UserPanel";
import { ViewModeGuard } from "View/ViewModeGuard";
import { ZoomPanel } from "View/ZoomPanel";
import { CommentsContextProvider, CommentsProvider } from "../CommentsProvider";
import { LinksProvider } from "../LinksProvider/LinksProvider";
import { SetLinkToModal } from "../Modal/SetLinkToModal";
import style from "./AppView.module.css";
import { InactiveBoardHidder } from "./InactiveBoardHidder";
import NoBoardIsOpen from "./NoBoardIsOpen";
import { QuickAddPanel } from "./QuickAddPanel";
import { LocalFileSaveProgress } from "View/LocalFileSavingProgress";
import { UserPlanModal } from "View/UserPlan";
import { AiUnavailableModal } from "View/AiUnavailableModal/AiUnavailableModal";
import { CookiesModal } from "View/Modal/CookiesModal";

export function AppView(): JSX.Element {
	const { app, board } = useAppContext();
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const forceUpdate = useForceUpdate();
	const animationId = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [searchParams] = useSearchParams();
	const authCode = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	let canPasteAgain = true;

	function update(): void {
		if (animationId.current) {
			return; // Function already scheduled to run
		}

		animationId.current = requestAnimationFrame(() => {
			forceUpdate();
			animationId.current = null;
		});
	}

	useEffect(() => {
		const handleCtrlWheel = (ev: WheelEvent): void => {
			if (ev.ctrlKey) {
				ev.preventDefault();
			}
		};

		const handlerOnKeyUp = (event: KeyboardEvent): void => {
			controller.onKeyUp(event);
			canPasteAgain = true;
		};

		const handlerOnPaste = (event: ClipboardEvent): void => {
			if (!canPasteAgain) {
				return;
			}
			controller.onPaste(event);
			canPasteAgain = false;
		};

		app.boardSubject.subscribe(update);
		const container = containerRef.current;
		const controller = app.controller;
		if (container) {
			document.addEventListener("touchmove", preventDefault, {
				passive: false,
			});
			container.addEventListener("wheel", controller.onWheel, {
				capture: true,
				passive: false,
			});
			document.addEventListener("wheel", handleCtrlWheel, {
				passive: false,
			});
			window.addEventListener("resize", controller.onResize);
			container.addEventListener(
				"contextmenu",
				controller.onContextMenu,
				{
					capture: false,
					passive: false,
				},
			);
			container.addEventListener(
				"pointermove",
				controller.onPointerMove,
				{
					capture: true,
				},
			);
			window.addEventListener("keydown", controller.onKeyDown);
			window.addEventListener("keyup", handlerOnKeyUp);
			window.addEventListener("copy", controller.onCopy);
			window.addEventListener("paste", handlerOnPaste);
			window.addEventListener("drop", controller.onDrop);
			window.addEventListener("dragover", event =>
				event.preventDefault(),
			);
		}

		return () => {
			app.boardSubject.unsubscribe(update);

			if (container) {
				document.removeEventListener("touchmove", preventDefault);
				container.removeEventListener("wheel", controller.onWheel);
				document.removeEventListener("wheel", handleCtrlWheel);
				window.removeEventListener("resize", controller.onResize);
				container.removeEventListener(
					"contextmenu",
					controller.onContextMenu,
				);
				container.removeEventListener(
					"pointermove",
					controller.onPointerMove,
				);
				window.removeEventListener("keydown", controller.onKeyDown);
				window.removeEventListener("keyup", handlerOnKeyUp);
				window.removeEventListener("copy", controller.onCopy);
				window.removeEventListener("paste", handlerOnPaste);
				window.removeEventListener("drop", controller.onDrop);
			}
		};
	}, [containerRef.current]);

	const appBoard = app.getBoard();

	return (
		<div className={style.wrapper}>
			{shouldShow("titlePanel") && <LandingMenu />}
			{shouldShow("titlePanel") && <MobileLandingMenu />}
			<InactiveBoardHidder>
				<div ref={containerRef}>
					<Canvas
						router={{ location, navigate, params }}
						app={app}
						board={board}
					/>
					<TextEditors app={app} board={board} />
				</div>
			</InactiveBoardHidder>
			{appBoard.getBoardId() === "blank" && <NoBoardIsOpen />}
			<ExportVisible>
				<SidePanelsContainer
					isBlank={appBoard.getBoardId() === "blank"}
				/>
				<ContextMenu />
				<ItemTooltip />
				<AIInput />
			</ExportVisible>
			<ExportVisible>
				<CommentsContextProvider>
					<UserPanelLayout app={app} />
					<CommentsProvider />
				</CommentsContextProvider>
			</ExportVisible>
			<ExportVisible>
				<UserTracking board={board} />
			</ExportVisible>
			<InactiveBoardHidder>
				<ZoomPanel />
			</InactiveBoardHidder>
			<ViewModeGuard>
				<LinksProvider />
				<ContextPanel />
				<QuickAddPanel />
				<ExportPanel />
			</ViewModeGuard>
			<ToastProvider />
			{authCode && teamIdSearch ? <ImportMiro /> : null}
			<ImportMiroStartModal />
			<CookiesModal />
			<SetLinkToModal />
			<UiModalBackground>
				<UserPlanModal />
				<ShareModal />
				<ProfileSettingsModal />
				<ChangePasswordModal />
				<AccessDeniedModal />
				<AiUnavailableModal />
			</UiModalBackground>
			<LocalFileSaveProgress />
		</div>
	);
}

function preventDefault(event: TouchEvent): void {
	event.preventDefault();
}
