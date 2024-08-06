import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TextEditors } from "View/TextEditor/TextEditor";
import { UserPanel } from "View/UserPanel/UserPanel";
import { useAppContext } from "View/AppContext";
import { Canvas } from "View/Canvas";
import { ContextMenu, ContextMenuContextProvider } from "View/ContextMenu";
import { ContextPanel } from "View/ContextPanel";
import { ExportPanel } from "View/ExportPanel";
import { ExportVisible } from "View/ExportPanel/ExportVisible";
import { SidePanelContextProvider } from "View/SidePanel/SidePanelContext";
import { SidePanelsContainer } from "View/SidePanelsContainer";
import { ToastProvider } from "View/ToastProvider";
import { ZoomPanel } from "View/ZoomPanel";
import style from "./AppView.module.css";
import { ImportMiroBoards } from "../ImportMiroBoards";
import { InfoModal } from "View/Modal/InfoModal";

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
	}, []);

	const urlString = new URL(window.location.href).pathname;
	const boardId = params?.boardId || urlString.split("/").pop();
	const query = new URLSearchParams(location?.search);
	const codeSearch = query.get("code");
	const teamIdSearch = query.get("team_id");
	const isOpenMiroBoards = codeSearch && teamIdSearch;

	if (boardId) {
		app.openBoard(boardId!);
	}

	if (!board && boardId !== "boards") {
		return <div></div>;
	}

	return (
		<div className={style.wrapper}>
			{boardId !== "boards" && (
				<div ref={containerRef}>
					<Canvas
						router={{ location, navigate, params }}
						app={app}
						board={board}
					/>
					<TextEditors app={app} board={board} />
				</div>
			)}
			{boardId === "boards" && (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100%",
					}}
				>
					No board is open
				</div>
			)}
			<ContextMenuContextProvider>
				<SidePanelContextProvider>
					<ExportVisible>
						<SidePanelsContainer />
						<ContextMenu />
					</ExportVisible>
				</SidePanelContextProvider>
			</ContextMenuContextProvider>
			<ExportVisible>
				<UserPanel app={app} />
			</ExportVisible>
			<ZoomPanel />
			<ContextPanel />
			<ExportPanel />
			<ToastProvider />
			<ImportMiroBoards isOpen={isOpenMiroBoards} app={app} />
		</div>
	);
}

function preventDefault(event: TouchEvent) {
	event.preventDefault();
}
