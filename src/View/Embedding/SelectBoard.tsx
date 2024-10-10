import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { FolderItem, Folders } from "View/Folder";
import { Icon, Logo } from "../Icon";
import style from "./SelectBoard.module.css";
import { BoardName } from "View/BoardName";
import { App } from "App";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import Selector, { SelectorHandle } from "./Selector";
import { getEmbedUrl } from "lib/getEmbedUrl";
import { getApiUrl } from "Config";
import { UiButton } from "View/Ui/UiButton";
import { useForceUpdate } from "lib/useForceUpdate";
import Cookies from "js-cookie";
import { UserDropDown } from "View/UserPanel/UserPanel";
import { Button } from "shared/ui-lib/Button";
import { useNavigate } from "react-router-dom";
import { boardsApi } from "shared/api";
import { useBoardsList } from "App/useBoardsList";

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

const getName = (i18t: TFunction, name?: string | null): string =>
	name || i18t("board.untitled");

const SelectBoard: React.FC<{ app: App }> = ({ app }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const forceUpdate = useForceUpdate();
	// const { isAuth } = useAuth(app);
	const boardsList = useBoardsList();
	const isAuth = app.account.isLoggedIn;
	const searchRef = useRef<HTMLInputElement>(null);
	const newBoardRef = useRef<HTMLInputElement>(null);
	const selectorRef = useRef<SelectorHandle>(null);
	const userPanelRef = useRef<HTMLDivElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<boardsApi.Board | null | "addNew">(
		null,
	);
	const [newBoardName, setNewBoardName] = useState(t("board.untitled"));
	const [filteredPublicBoards, setFilteredPublicBoards] = useState(
		boardsList.publicBoards,
	);
	const [filteredSharedBoards, setFilteredSharedBoards] = useState(
		boardsList.sharedBoards,
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
			const authedUrl = `${getApiUrl()}/boards/${actualId}/links`;
			const unauthedUrl = `${getApiUrl()}/boards/${actualId}/links/unauthed`;
			const url = app.account.isLoggedIn
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
					Authorization: `Bearer ${Cookies.get("accessToken")}`,
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
			boardsList.publicBoards.filter(board =>
				getName(t, board.title)
					.toLowerCase()
					.includes(searchQuery.trim().toLowerCase()),
			),
		);
		setFilteredSharedBoards(
			boardsList.sharedBoards.filter(board =>
				getName(t, board.title)
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

	useEffect(() => {
		const fetchBoards = async (): Promise<void> => {
			await app.boardsList.loadBoards();
			setFilteredSharedBoards(
				boardsList.sharedBoards.filter(board =>
					getName(t, board.title)
						.toLowerCase()
						.includes(searchQuery.trim().toLowerCase()),
				),
			);
			setFilteredPublicBoards(
				boardsList.publicBoards.filter(board =>
					getName(t, board.title)
						.toLowerCase()
						.includes(searchQuery.trim().toLowerCase()),
				),
			);
		}

		fetchBoards();
	}, []);

	const handleEmbed = async (): Promise<void> => {
		try {
			if (selected === "addNew") {
				const created = await boardsList.createBoard(
					newBoardRef.current?.value,
					true,
				);
				const stored = boardsList.getBoardInfo(created);
				handleSuccess(created, newBoardRef.current?.value, stored?.id);
			} else if (selected) {
				setLoading(true);
				let res = await fetch(
					`${getApiUrl()}/boards/${selected.id}/exists`,
					{
						method: "GET",
					},
				);
				if (!res.ok && selected.id) {
					res = await fetch(
						`${getApiUrl()}/boards/${selected.id}/exists`,
						{
							method: "GET",
						},
					);
				}
				if (!res.ok) {
					setLoading(false);
					selected.notFound = true;
					if (
						boardsList.publicBoards.some(
							shared => shared.id === selected.id,
						)
					) {
						// app.storage.setPublicBoard(selected);
					} else {
						// app.storage.setPublicBoard(selected, false);
					}
					setSelected(selected);
					boardsList.subject.publish();
					// app.storage.subject.publish();
					forceUpdate();
				} else {
					handleSuccess(
						selected.id,
						selected.title || "",
						selected.id,
					);
				}
			}
		} catch (er) {
			setLoading(false);
			handleError(er);
		}
	};

	return (
		<>
			<div className={style.container}>
				<div className={style.header} style={{ position: "relative" }}>
					<div className={style.logo}>
						<Logo id="logo" />
						<div className={style.headerTitle}>Microboard</div>
					</div>
					{isAuth ? (
						<div className={style.profile}>
							<Icon iconName="UserPic" width={16} height={16} />
						</div>
					) : (
						<div
							ref={userPanelRef}
							className={`${style.profile} ${style.unAuth}`}
							onClick={() => setIsDropdownOpen(prev => !prev)}
						>
							<Icon iconName="UserPic" width={16} height={16} />
							<UserDropDown
								openerRef={userPanelRef}
								isOpen={isDropdownOpen}
								setIsDropdownOpen={setIsDropdownOpen}
								customTop={50}
								buttons={[
									<Button
										key="userDropDown1"
										onClick={() => {
											setIsDropdownOpen(false);
											navigate(
												"/auth/sign-in?backToSelect=true",
											);
										}}
										pattern="ghost"
									>
										<Icon
											iconName="SignIn"
											width={20}
											height={20}
										/>{" "}
										{t("auth.signIn")}
									</Button>,
									<Button
										key="userDropDown2"
										pattern="ghost"
										onClick={() => {
											setIsDropdownOpen(false);
											navigate(
												"/auth/sign-up?backToSelect=true",
											);
										}}
									>
										<Icon
											iconName="BoxedPlus"
											width={20}
											height={20}
										/>{" "}
										{t("auth.signUp")}
									</Button>,
								]}
							/>
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
									{customIcon} {getName(t, board.title)}
								</>
							)}
						/>
					</>
				)}
				{selected && selected !== "addNew" && (
					<FolderItem
						key={selected.id}
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
							{customIcon} {getName(t, selected.title)}
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
						boardsList.publicBoards.some(
							board => board.id === selected.id,
						) ? (
							<div className={style.selectorsContainer}>
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
							</div>
						) : (
							!selected.notFound && (
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
							)
						)}
						{selected !== "addNew" && selected.notFound && (
							<div
								className={`${style.infoMessage} ${style.error}`}
							>
								<div>
									<Icon
										iconName="Info"
										width={16}
										height={16}
									/>
									{t("modalInfo.accessDenied.title")}
								</div>
								<div className={style.secondary}>
									{t("modalInfo.accessDenied.description")}
								</div>
							</div>
						)}
						<div className={style.buttonContainer}>
							<UiButton
								className={`${style.button} ${style.primary}`}
								onClick={handleEmbed}
								disabled={
									loading ||
									(selected !== "addNew" && selected.notFound)
								}
								size="sm"
							>
								{t("embedding.embedBoardButton")}
							</UiButton>
							<UiButton
								className={`${style.button} ${style.secondary}`}
								onClick={() => setSelected(null)}
								disabled={loading}
								size="sm"
							>
								{t("embedding.back")}
							</UiButton>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default SelectBoard;
