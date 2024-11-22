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
import { api, boardsApi } from "shared/api";
import { useBoardsList } from "App/useBoardsList";
import { useAccount } from "App/useAccount";
import { Logout } from "View/UserPanel/icons/Logout";

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
	const account = useAccount();
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
	): void {
		window.opener?.postMessage(
			{
				success: {
					visitorsLink: `${getEmbedUrl()}/boards/${visitorsLinkId}?titlePanel=false`,
					authorLink: `${getEmbedUrl()}/boards/${authorLinkId}?titlePanel=false`,
					name,
				},
			},
			"*",
		);
		// "*" - ANY OPENER ORIGIN, REPLACE HERE
	}

	async function handleSuccess(
		boardId: string,
		name?: string | null,
		authorKey?: string,
	): Promise<void> {
		if (selectorRef.current?.getSelectedOption().value === "view") {
			const authedUrl = `/boards/${boardId}/links`;
			const unauthedUrl = `/boards/${boardId}/links/unauthed`;
			const url = app.account.isLoggedIn
				? authedUrl
				: authorKey
					? unauthedUrl
					: "";
			if (!url) {
				throw new Error("unable to create link");
			}
			const body = {
				type: "view",
				authorKey,
			};

			const { data } = await api.post(url, body);
			const { linkId } = data;

			if (!linkId) {
				handleError(
					"could not create view link, try again later or with new board",
				);
				return;
			}
			successMessageToParent(boardId, linkId, getName(t, name));
		} else {
			successMessageToParent(boardId, boardId, getName(t, name));
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
			await account.init();
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
		};

		fetchBoards();
	}, []);

	const handleEmbed = async (): Promise<void> => {
		try {
			if (selected === "addNew") {
				const createdId = await boardsList.createBoard(
					newBoardRef.current?.value,
					true,
				);
				const unauthedData = app.storage.getCreatedBoard(createdId);
				if (unauthedData) {
					handleSuccess(
						unauthedData.id,
						unauthedData.title,
						unauthedData.authorKey,
					);
				} else {
					handleSuccess(createdId, newBoardRef.current?.value);
				}
			} else if (selected) {
				setLoading(true);
				const res = await fetch(
					`${getApiUrl()}/boards/${selected.id}/exists`,
					{
						method: "GET",
					},
				);
				if (!res.ok) {
					setLoading(false);
					// selected.notFound = true;
					// TODO fixed not found boards
					setSelected({ ...selected, notFound: true });
					boardsList.subject.publish();
					// app.storage.subject.publish();
					forceUpdate();
				} else {
					const unauthedData = app.storage.getCreatedBoard(
						selected.id,
					);
					if (unauthedData) {
						handleSuccess(
							unauthedData.id,
							unauthedData.title,
							unauthedData.authorKey,
						);
					} else {
						handleSuccess(selected.id, selected.title || "");
					}
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
						<div
							ref={userPanelRef}
							className={style.profile}
							onClick={() => setIsDropdownOpen(prev => !prev)}
						>
							{account.info?.avatar ? (
								<img src={account.info?.avatar} />
							) : (
								<Icon
									iconName="UserPic"
									width={16}
									height={16}
								/>
							)}
							<UserDropDown
								openerRef={userPanelRef}
								isOpen={isDropdownOpen}
								setIsDropdownOpen={setIsDropdownOpen}
								customTop={50}
								email={account.info?.email}
								buttons={[
									<Button
										key="userDropDown2"
										pattern="ghost"
										onClick={async () => {
											await account.logout();
											await boardsList.loadBoards();
										}}
									>
										<Logout /> {t("auth.logout")}
									</Button>,
								]}
							/>
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
