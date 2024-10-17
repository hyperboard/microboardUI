import { shouldShow } from "lib/queryStringParser";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { Canvas } from "View/Canvas";
import { ContextMenu } from "View/ContextMenu";
import { ContextPanel } from "View/ContextPanel";
import { ExportPanel } from "View/ExportPanel";
import { ExportVisible } from "View/ExportPanel/ExportVisible";
import { ImportMiroBoards } from "View/ImportMiro";
import { LandingMenu, MobileLandingMenu } from "View/LandingMenu";
import { SidePanelsContainer } from "View/SidePanelsContainer";
import { TextEditors } from "View/TextEditor/TextEditor";
import { ToastProvider } from "View/ToastProvider";
import { UserPanel } from "View/UserPanel/UserPanel";
import { ViewModeGuard } from "View/ViewModeGuard";
import { ZoomPanel } from "View/ZoomPanel";
import style from "./AppView.module.css";
import { InactiveBoardHidder } from "./InactiveBoardHidder";
import NoBoardIsOpen from "./NoBoardIsOpen";
import { QuickAddPanel } from "./QuickAddPanel";
import { ImportMiroStartModal, AuthClipboardModal } from "View/ImportMiro";
import { ItemTooltip } from "View/ItemTooltip";

export function AppView() {
	const { app, board } = useAppContext();
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const forceUpdate = useForceUpdate();
	const animationId = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const update = () => {
		if (animationId.current) {
			return; // Function already scheduled to run
		}

		animationId.current = requestAnimationFrame(() => {
			forceUpdate();
			animationId.current = null;
		});
	};

	useEffect(() => {
		const handlePaste = (event: ClipboardEvent) => {
			controller.onPaste(event, app);
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
			window.addEventListener("keyup", controller.onKeyUp);
			window.addEventListener("copy", controller.onCopy);
			window.addEventListener("paste", handlePaste);
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
				window.removeEventListener("keyup", controller.onKeyUp);
				window.removeEventListener("copy", controller.onCopy);
				window.removeEventListener("paste", handlePaste);
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
			<ViewModeGuard>
				<ExportVisible>
					<SidePanelsContainer
						isBlank={appBoard.getBoardId() === "blank"}
					/>
					<ContextMenu />
					<ItemTooltip />
				</ExportVisible>
			</ViewModeGuard>
			<ViewModeGuard>
				<ExportVisible>
					{shouldShow("userPanel") && <UserPanel app={app} />}
				</ExportVisible>
			</ViewModeGuard>
			<InactiveBoardHidder>
				<ZoomPanel />
			</InactiveBoardHidder>
			<ViewModeGuard>
				<ContextPanel />
				<QuickAddPanel />
				<ExportPanel />
			</ViewModeGuard>
			<ToastProvider />
			<ImportMiroBoards app={app} />
			<ImportMiroStartModal />
			<AuthClipboardModal />
		</div>
	);
}

function preventDefault(event: TouchEvent) {
	event.preventDefault();
}
