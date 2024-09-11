import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { FolderItem, Folders } from "View/Folder";
import { Icon, Logo } from "../Icon";
import style from "./SelectBoard.module.css";
import { BoardName } from "View/BoardName";
import { App } from "App";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { VisitedPublicBoard } from "App/Storage";
import Selector, { SelectorHandle } from "./Selector";
import { useAuth } from "shared/hooks/useAuth";
import { getEmbedUrl } from "lib/getEmbedUrl";
import Cookies from "js-cookie";
import { getApiUrl } from "Config";
import toast from "react-hot-toast";
import { notify } from "View/Ui/Toast";
import { ICreateStringAttachment } from "@cucumber/cucumber/lib/runtime/attachment_manager";

const customHeader: CSSProperties = {
	padding: "6px",
};
const customList: CSSProperties = {
	marginLeft: "16px",
};
const customItemStyle: CSSProperties = {
	gap: "8px",
	alignItems: "center",
};
const customIcon = (
	<Icon
		iconName="EmbedBoardIcon"
		width={20}
		height={20}
		className={style.embedBoardIcon}
	/>
);

const getName = (i18t: TFunction, name?: string): string =>
	name || i18t("board.untitled");

const SelectBoard: React.FC<{ app: App }> = ({ app }) => {
	const { t } = useTranslation();
	const searchRef = useRef<HTMLInputElement>(null);
	const newBoardRef = useRef<HTMLInputElement>(null);
	const selectorRef = useRef<SelectorHandle>(null);
	const { isAuth } = useAuth(app);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selected, setSelected] = useState<
		VisitedPublicBoard | null | "addNew"
	>(null);
	const [newBoardName, setNewBoardName] = useState(t("board.untitled"));
	const [filteredPublicBoards, setFilteredPublicBoards] = useState(
		app.storage.listPublicBoards(),
	);
	const [filteredSharedBoards, setFilteredSharedBoards] = useState(
		app.storage.listSharedBoards(),
	);

	function handleError(er: unknown): void {
		window.opener?.postMessage(
			{
				error: er,
			},
			"*",
		);
		// "*" - ANY OPENER ORIGIN, REPLACE HERE
	}

	function successMessageToParent(
		authorLinkId: string,
		visitorsLinkId: string,
		name: string,
		id?: string,
	): void {
		window.opener?.postMessage(
			{
				success: {
					visitorsLink: `${getEmbedUrl()}/boards/${visitorsLinkId}?titlePanel=false`,
					authorLink: `${getEmbedUrl()}/boards/${authorLinkId}?titlePanel=false`,
					name,
					id,
				},
			},
			"*",
		);
		// "*" - ANY OPENER ORIGIN, REPLACE HERE
	}

	async function handleSuccess(
		boardId: string,
		name?: string,
		actualId?: string,
		authorKey?: string,
	): Promise<void> {
		if (
			selectorRef.current?.getSelectedOption().value === "view" &&
			actualId
		) {
			console.log("VIEW", boardId, actualId, authorKey);
			const authedUrl = `${getApiUrl()}/boards/${actualId}/links`;
			const unauthedUrl = `${getApiUrl()}/boards/${actualId}/links/unauthed`;
			const url = app.storage.isAuth
				? authedUrl
				: authorKey
				? unauthedUrl
				: "";
			if (!url) {
				throw new Error("unable to create link");
			}
			const body = JSON.stringify({
				type: "view",
				authorKey,
			});

			let response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body,
			});

			if (!response.ok) {
				// user might be authed, but could not claim board
				// so try to create link with authorKey instead of token
				response = await fetch(unauthedUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body,
				});
			}
			const { linkId } = await response.json();
			console.log("created link", linkId);
			if (!linkId) {
				handleError(
					"could not create view link, try again later or with new board",
				);
			}
			successMessageToParent(boardId, linkId, getName(t, name), actualId);
		} else {
			successMessageToParent(
				boardId,
				boardId,
				getName(t, name),
				actualId,
			);
		}
	}

	useEffect(() => {
		setFilteredPublicBoards(
			app.storage
				.listPublicBoards()
				.filter(board =>
					getName(t, board.name)
						.toLowerCase()
						.includes(searchQuery.trim().toLowerCase()),
				),
		);
		setFilteredSharedBoards(
			app.storage
				.listSharedBoards()
				.filter(board =>
					getName(t, board.name)
						.toLowerCase()
						.includes(searchQuery.trim().toLowerCase()),
				),
		);
	}, [searchQuery]);

	useEffect(() => {
		if (selected === "addNew" && newBoardRef.current) {
			newBoardRef.current.focus();
			newBoardRef.current.select();
		}
	}, [selected]);

	const handleEmbed = async (): Promise<void> => {
		if (selected === "addNew") {
			try {
				const created = await app.createPublicBoard(
					newBoardRef.current?.value,
				);
				const stored = app.storage.getBoard(created);
				handleSuccess(
					created,
					newBoardRef.current?.value,
					stored?.actualId,
					stored?.authorKey,
				);
			} catch (er) {
				handleError(er);
			}
		} else if (selected) {
			handleSuccess(
				selected.boardId,
				selected.name,
				selected.actualId,
				selected.authorKey,
			);
		}
	};

	return (
		<>
			<div className={style.container}>
				<div className={style.header}>
					<div className={style.logo}>
						<Logo id="logo" />
						<div className={style.headerTitle}>Microboard</div>
					</div>
					{isAuth && (
						<div className={style.profile}>
							<Icon iconName="UserPic" width={16} height={16} />
						</div>
					)}
				</div>
				<div className={style.title}>
					{!selected && t("embedding.title")}
					{selected && t("embedding.customize")}
				</div>
				{!selected && (
					<>
						<div
							className={style.search}
							onClick={() => searchRef.current?.focus()}
						>
							<input
								type="text"
								ref={searchRef}
								placeholder={t("embedding.inputPlaceholder")}
								value={searchQuery}
								onChange={event =>
									setSearchQuery(event.target.value)
								}
							/>
							<Icon iconName="Search" width={20} height={20} />
						</div>
						<div
							className={style.addContainer}
							onClick={() => setSelected("addNew")}
						>
							<button
								className={style.add}
								onClick={() => setSelected("addNew")}
							>
								<Icon
									iconName="addButton"
									width={16}
									height={16}
								/>
							</button>
							<span>{t("embedding.addNew")}</span>
						</div>
						<Folders
							containerClassName={style.folders}
							isAuth={isAuth}
							isPublicOpened={true}
							isSharedOpened={true}
							publicBoards={filteredPublicBoards}
							sharedBoards={filteredSharedBoards}
							boardNameOnClick={board => setSelected(board)}
							customFolderItemStyle={customItemStyle}
							customHeaderStyle={customHeader}
							customListStyle={customList}
							boardNameChildren={board => (
								<>
									{customIcon} {getName(t, board.name)}
								</>
							)}
						/>
					</>
				)}
				{selected && selected !== "addNew" && (
					<FolderItem
						key={selected.boardId}
						customStyle={{
							...customItemStyle,
							padding: 0,
						}}
					>
						<BoardName
							customStyle={{
								backgroundColor: "#F7F1FD",
								cursor: "default",
							}}
						>
							{customIcon} {getName(t, selected.name)}
						</BoardName>
					</FolderItem>
				)}
				{selected === "addNew" && (
					<div className={style.search}>
						<input
							type="text"
							placeholder={t("embedding.newBoardPlaceholder")}
							ref={newBoardRef}
							value={newBoardName}
							onChange={event =>
								setNewBoardName(event.target.value)
							}
						/>
					</div>
				)}
				{selected && (
					<>
						<div className={style.selectorsContainer}>
							{/* {selected !== "addNew" &&
							<Selector
								label={t("embedding.startingView")}
								options={[
									{
										value: "full",
										label: (
											<span>
												{t("embedding.fullBoard")}
											</span>
										),
									},
									// TODO add frames
								]}
							/>} */}
							{selected === "addNew" ||
							app.storage
								.listPublicBoards()
								.includes(selected) ? (
								<Selector
									ref={selectorRef}
									label={t("embedding.allVisitors")}
									options={[
										{
											value: "edit",
											label: (
												<div
													className={
														style.selectorText
													}
												>
													{
														<Icon
															style={{
																marginRight:
																	"10px",
															}}
															iconName="canEdit"
															width={20}
															height={20}
														/>
													}{" "}
													{t("embedding.canEdit")}
												</div>
											),
										},
										{
											value: "view",
											label: (
												<div
													className={
														style.selectorText
													}
												>
													{
														<Icon
															style={{
																marginRight:
																	"10px",
															}}
															iconName="canView"
															width={20}
															height={20}
														/>
													}{" "}
													{t("embedding.canView")}
												</div>
											),
										},
									]}
								/>
							) : (
								<div className={style.infoMessage}>
									<div>
										<Icon
											iconName="Info"
											width={16}
											height={16}
										/>
										{t("embedding.notOwner")}
									</div>
									<div className={style.secondary}>
										{t("embedding.optionsUnavailable")}
									</div>
								</div>
							)}
						</div>
						<div className={style.buttonContainer}>
							<button
								className={`${style.button} ${style.primary}`}
								onClick={handleEmbed}
							>
								{t("embedding.embedBoardButton")}
							</button>
							<button
								className={`${style.button} ${style.secondary}`}
								onClick={() => setSelected(null)}
							>
								{t("embedding.back")}
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default SelectBoard;
