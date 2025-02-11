import { App } from "App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { getApiUrl } from "Config";
import { TFunction } from "i18next";
import Selector, { SelectorHandle } from "../Ui/Selector/Selector";
import { getEmbedUrl } from "lib/getEmbedUrl";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { BoardName } from "View/BoardName";
import { Folder, FolderItem } from "View/Folder";
import { UiButton } from "View/Ui/UiButton";
// import { UserAvatar, UserDropDown } from "View/UserPanel/UserPanel";
import { Icon, Logo } from "../Icon";
import style from "./SelectBoard.module.css";
import { Logout } from "View/UserPanel/icons/Logout";
import { boardsApiV2 } from "shared/apiV2";
import { AccessKeyType } from "shared/apiV2/boards";
import { UserAvatar } from "View/UserPanel/UserAvatar/UserAvatar";
import { UserDropDown } from "View/UserPanel/UserDropdown/UserDropdown";

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
	const boardsList = useBoardsList();
	const account = useAccount();
	const isAuth = account.isLoggedIn;
	const newBoardRef = useRef<HTMLInputElement>(null);
	const selectorRef = useRef<SelectorHandle<false>>(null);
	const userPanelRef = useRef<HTMLDivElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<
		boardsApiV2.Board | null | "addNew"
	>(null);
	const [newBoardName, setNewBoardName] = useState(t("board.untitled"));

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
		boardId: string,
		accessKey: string,
		name: string,
	): void {
		window.opener?.postMessage(
			{
				success: {
					visitorsLink: `${getEmbedUrl()}/boards/${boardId}?titlePanel=false&accessKey=${accessKey}`,
					authorLink: `${getEmbedUrl()}/boards/${boardId}?titlePanel=false`,
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
		const accessKeyType = selectorRef.current?.getSelectedOptions().value;

		if (!accessKeyType) {
			throw new Error("Error creating access key");
		}

		const { data: accessKey } = await boardsApiV2.createAccessKey(
			boardId,
			{
				keyType: accessKeyType as AccessKeyType,
			},
			authorKey,
		);

		if (!accessKey) {
			throw new Error("Error creating access key");
		}

		successMessageToParent(boardId, accessKey.accessKey, getName(t, name));
	}

	useEffect(() => {
		if (selected === "addNew" && newBoardRef.current) {
			newBoardRef.current.focus();
			newBoardRef.current.select();
		}
	}, [selected]);

	useEffect(() => {
		const fetchBoards = async (): Promise<void> => {
			await app.boardsList.loadBoards();
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
						unauthedData.authorKey ?? undefined,
					);
				} else {
					handleSuccess(createdId, newBoardRef.current?.value);
				}
			} else if (selected) {
				setLoading(true);
				const res = boardsList.getBoardInfo(selected.id);
				if (!res) {
					setLoading(false);
					// selected.notFound = true;
					// TODO fixed not found boards
					setSelected({ ...selected, notFound: true });
					boardsList.subject.publish();
					// app.storage.subject.publish();
					forceUpdate();
				} else {
					handleSuccess(
						res.id,
						res.title,
						res.authorKey ?? undefined,
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
					<div
						ref={userPanelRef}
						className={`${style.profile} ${!isAuth && style.unAuth}`}
						onClick={() => setIsDropdownOpen(prev => !prev)}
					>
						<UserAvatar src={account.info?.avatar} />
						<UserDropDown
							openerRef={userPanelRef}
							isOpen={isDropdownOpen}
							setIsDropdownOpen={setIsDropdownOpen}
							customTop={50}
							email={account.info?.email}
							buttons={
								isAuth
									? [
											<Button
												key="userDropDown2"
												pattern="ghost"
												onClick={async () => {
													await account.logout();
												}}
											>
												<Logout /> {t("auth.logout")}
											</Button>,
										]
									: [
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
										]
							}
						/>
					</div>
				</div>
				<div className={style.title}>
					{!selected && t("embedding.title")}
					{selected && t("embedding.customize")}
				</div>
				{!selected && (
					<>
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
						<Folder
							folder={boardsList.getRootFolder()}
							handleOpenBoard={board => setSelected(board)}
						/>
						<Folder
							folder={boardsList.getSharedFolder()}
							handleOpenBoard={board => setSelected(board)}
						/>
					</>
				)}
				{selected && selected !== "addNew" && (
					<div className={style.selected}>
						<span className={style.selectedIcon}>
							<Icon
								iconName="EmbedBoardIcon"
								width={20}
								height={20}
							/>
						</span>
						<span>{selected.title}</span>
					</div>
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
						boardsList.getBoardInfo(selected.id) ? (
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
