import { useAIContext } from "entities/AIInput/AIContext";
import { AiGenerationButton } from "entities/AIInput/AIGenerationButton";
import { AIInput } from "entities/AIInput/AIInput";
import { Canvas } from "entities/Canvas";
import { AccessDeniedModal } from "features/AccessDeniedModal";
import { AiUnavailableModal } from "features/AiUnavailableModal/AiUnavailableModal";
import { useAppContext } from "features/AppContext";
import { AudioProvider } from "features/AudioPlayer/AudioProvider";
import { ChangePasswordModal } from "features/ChangePasswordModal";
import { ContextMenu } from "features/ContextMenu";
import { ContextPanel } from "features/ContextPanel";
import { ExportPanel } from "features/ExportPanel";
import { ExportVisible } from "features/ExportPanel/ExportVisible";
import { HyperLink } from "features/hyperLink/HyperLink";
import { useHyperLinkContext } from "features/hyperLink/HyperLinkContext";
import { HyperLinkInput } from "features/hyperLink/HyperLinkInput/HyperLinkInput";
import {
	AuthClipboardModal,
	ImgAuthClipboardModal,
	ImportMiro,
	ImportMiroStartModal,
} from "features/ImportMiro";
import {
	ErrorNotification,
	LoadingNotification,
	SuccessNotification,
	WarnClipboardNotification,
	WarnNotification,
} from "features/ImportMiro/ImportMiroBoards/Notifications";
import { ItemTooltip } from "features/ItemTooltip";
import { LandingMenu, MobileLandingMenu } from "features/LandingMenu";
import { LocalFileSaveProgress } from "features/LocalFileSavingProgress";
import { CookiesModal } from "features/Modal/CookiesModal";
import { UserTracking } from "features/Presence/UserTracking/UserTracking";
import { ProfileSettingsModal } from "features/ProfileSettingsModal";
import { ShareModal } from "features/ShareModal";
import { SidePanelsContainer } from "features/SidePanelsContainer";
import { CreateTemplateModal, SelectTemplateModal } from "features/Templates";
import { TextEditors } from "features/TextEditor/TextEditor";
import { ToastProvider } from "features/ToastProvider";
import { UserPanelLayout } from "features/UserPanel/UserPanel";
import { UserPlanModal } from "features/UserPlan";
import { HistoryModal } from "features/UserPlan/HistoryModal";
import { LimitsModal } from "features/UserPlan/LimitsModal";
import { SelectPaymentModal } from "features/UserPlan/SelectPaymentModal";
import { VideosProvider } from "features/VideoPlayer/VideosProvider";
import { ViewModeGuard } from "features/ViewModeGuard";
import { ZoomPanel } from "features/ZoomPanel";
import React, { useEffect, useRef } from "react";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { shouldShow } from "shared/lib/queryStringParser";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { UIMainLoader } from "shared/ui-lib/UIMainLoader/UIMainLoader";
import { UiModalBackground } from "shared/ui-lib/UiModal";
import {
	CommentsContextProvider,
	CommentsProvider,
} from "../../entities/comments";
import { LinksProvider } from "../LinksProvider/LinksProvider";
import { SetLinkToModal } from "../Modal/SetLinkToModal";
import style from "./AppView.module.css";
import { InactiveBoardHidder } from "./InactiveBoardHidder";
import NoBoardIsOpen from "./NoBoardIsOpen";
import { QuickAddPanel } from "./QuickAddPanel";
import { MediaUnavailableModal } from "features/MediaUnavailableModal/MediaUnavailableModal";
import { ShareSnapshotModal } from "features/ShareSnapshotModal";
import { BoardMenu } from "entities/BoardMenu";
import { MouseOrTrackpadModal } from "entities/BoardMenu/MouseOrTracpadModal/MouseOrTrackpadModal";

export function AppView(): JSX.Element {
	const { app, board } = useAppContext();
	const { setQuotedText, tryToSendGenerationRequest } = useAIContext();
	const { setHyperLinkData, hyperLinkData } = useHyperLinkContext();
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
		const abortController = new AbortController();
		if (container) {
			container.addEventListener("touchmove", preventDefault, {
				passive: false,
				signal: abortController.signal,
			});
			container.addEventListener("wheel", controller.onWheel, {
				capture: true,
				passive: false,
				signal: abortController.signal,
			});
			document.addEventListener("wheel", handleCtrlWheel, {
				passive: false,
				signal: abortController.signal,
			});
			window.addEventListener("resize", controller.onResize);
			container.addEventListener(
				"contextmenu",
				controller.onContextMenu,
				{
					capture: false,
					passive: false,
					signal: abortController.signal,
				},
			);
			container.addEventListener(
				"pointermove",
				controller.onPointerMove,
				{
					capture: true,
					signal: abortController.signal,
				},
			);
			window.addEventListener("keydown", controller.onKeyDown, {
				signal: abortController.signal,
			});
			window.addEventListener("keyup", handlerOnKeyUp, {
				signal: abortController.signal,
			});
			window.addEventListener("copy", controller.onCopy, {
				signal: abortController.signal,
			});
			window.addEventListener("paste", handlerOnPaste, {
				signal: abortController.signal,
			});
			window.addEventListener("drop", controller.onDrop, {
				signal: abortController.signal,
			});
			window.addEventListener(
				"dragover",
				event => event.preventDefault(),
				{
					signal: abortController.signal,
				},
			);
		}

		return () => {
			app.boardSubject.unsubscribe(update);
			abortController.abort();
		};
	}, [containerRef.current]);

	const appBoard = app.getBoard();

	return (
		<div className={style.wrapper}>
			{shouldShow("titlePanel") && <LandingMenu />}
			{shouldShow("titlePanel") && <MobileLandingMenu />}
			<InactiveBoardHidder>
				<div ref={containerRef} className="NoContextMenu">
					<ViewModeGuard
						mode={["edit", "view"]}
						fallback={
							<div className={style.loaderWrapper}>
								<UIMainLoader />
							</div>
						}
					/>
					<Canvas
						router={{ location, navigate, params }}
						app={app}
						board={board}
					>
						<LinksProvider />
						<VideosProvider />
						<AudioProvider />
					</Canvas>
					<TextEditors
						app={app}
						board={board}
						setQuotedText={setQuotedText}
						setHyperLinkData={setHyperLinkData}
						hyperLinkData={hyperLinkData}
						sendGenerationRequest={tryToSendGenerationRequest}
					/>
				</div>
			</InactiveBoardHidder>
			{appBoard.getBoardId() === "blank" && <NoBoardIsOpen />}
			<ExportVisible>
				<SidePanelsContainer
					isBlank={appBoard.getBoardId() === "blank"}
				/>
				<ContextMenu />
				<ItemTooltip />
				<ViewModeGuard mode={"edit"}>
					{interfaceType => {
						if (interfaceType === "edit") {
							return <AIInput />;
						}
						return null;
					}}
				</ViewModeGuard>
			</ExportVisible>
			<ExportVisible>
				<UserPanelLayout app={app} />
				<CommentsProvider />
			</ExportVisible>
			<ExportVisible>
				<UserTracking board={board} />
			</ExportVisible>
			<InactiveBoardHidder>
				<ZoomPanel />
			</InactiveBoardHidder>
			<ViewModeGuard>
				<ContextPanel />
				<QuickAddPanel />
				<ExportPanel />
				<BoardMenu />
			</ViewModeGuard>
			<HyperLink />
			<AiGenerationButton />
			<HyperLinkInput />
			<ToastProvider />
			{authCode && teamIdSearch ? <ImportMiro /> : null}
			<CookiesModal />
			<UiModalBackground>
				<ImportMiroStartModal />
				<SelectPaymentModal />
				<UserPlanModal />
				<LimitsModal />
				<HistoryModal />
				<ShareModal />
				<ShareSnapshotModal />
				<ProfileSettingsModal />
				<ChangePasswordModal />
				<AccessDeniedModal />
				<AiUnavailableModal />
				<MediaUnavailableModal />
				<SelectTemplateModal />
				<AuthClipboardModal />
				<ImgAuthClipboardModal />
				<LoadingNotification />
				<ErrorNotification />
				<SuccessNotification />
				<WarnClipboardNotification />
				<WarnNotification />
				<SetLinkToModal />
				<CreateTemplateModal />
				<MouseOrTrackpadModal />
			</UiModalBackground>
			<LocalFileSaveProgress />
		</div>
	);
}

function preventDefault(event: TouchEvent): void {
	event.preventDefault();
}
