import { useForceUpdate } from "lib/useForceUpdate";
import React, { MouseEventHandler, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
import { ZoomPanel } from "View/ZoomPanel";
import style from "./AppView.module.css";
import NoBoardIsOpen from "./NoBoardIsOpen";
import { InactiveBoardHidder } from "./InactiveBoardHidder";
import { showTitlePanel, showUserPanel } from "lib/queryStringParser";
import { ViewModeGuard } from "View/ViewModeGuard";

export function AppView() {
	const { app, board } = useAppContext();
	const location = useLocation();
	const { t } = useTranslation();
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
		app.boardSubject.subscribe(update);
		if (app.storage.isAuth) {
			app.storage.fetchBoards();
		}
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
			window.addEventListener("paste", controller.onPaste);
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
				window.removeEventListener("paste", controller.onPaste);
				window.removeEventListener("drop", controller.onDrop);
			}
		};
	}, [containerRef.current]);

	const urlString = new URL(window.location.href).pathname;
	const firstPath = urlString.split("/").pop();
	const boardId = params?.boardId || firstPath;

	if (boardId && firstPath !== "boards") {
		app.openBoard(boardId!);
	}

	if (!board && boardId !== "boards") {
		return <div></div>;
	}

	const appBoard = app.getBoard();
	return (
		<div className={style.wrapper}>
			{showTitlePanel() && <LandingMenu />}
			{showTitlePanel() && <MobileLandingMenu />}
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
				</ExportVisible>
			</ViewModeGuard>
			<ViewModeGuard>
				<ExportVisible>
					{showUserPanel() && <UserPanel app={app} />}
				</ExportVisible>
			</ViewModeGuard>
			<InactiveBoardHidder>
				<ZoomPanel />
			</InactiveBoardHidder>
			<ViewModeGuard>
				<ContextPanel />
				<ExportPanel />
			</ViewModeGuard>
			<ToastProvider />
			<ImportMiroBoards app={app} />
		</div>
	);
}

function preventDefault(event: TouchEvent) {
	event.preventDefault();
}
