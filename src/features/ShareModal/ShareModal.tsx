import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import { useContextMenuContext } from "features/ContextMenu";
import { UserAvatar } from "features/UserPanel/UserAvatar/UserAvatar";
import i18next from "i18next";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { usersApi } from "shared/api";
import { boardsApiV2 } from "shared/apiV2";
import {
	DirectAccessType,
	UserAccessType,
	type GrantedUser,
} from "shared/apiV2/boards";
import { debounce } from "shared/lib/debounce";
import { getEmailPrefix } from "shared/lib/getEmailPrefix";
import { Button } from "shared/ui-lib/Button";
import { Icon } from "shared/ui-lib/Icon";
import { Link } from "shared/ui-lib/Link";
import { notify } from "shared/ui-lib/Toast";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { UiSelector, type Option } from "shared/ui-lib/UiSelector";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { UiSkeleton } from "shared/ui-lib/UiSkeleton";
import { SearchInput } from "./SearchInput";
import styles from "./ShareModal.module.css";

export const SHARE_MODAL_ID = Symbol("shareModal");

const PRIVACY_SELECTOR_OPTIONS: Option[] = [
	{
		label: i18next.t("sharing.privacyOptions.public"),
		value: "public",
		icon: <Icon width={20} height={20} iconName="publicDrafts" />,
	},
	{
		label: i18next.t("sharing.privacyOptions.private"),
		value: "private",
		icon: <Icon width={20} height={20} iconName="lock" />,
	},
];

const MODE_SELECTOR_OPTIONS: Option[] = [
	{
		label: i18next.t("sharing.accessOptions.edit"),
		value: "edit",
		icon: <Icon width={20} height={20} iconName="drawingPen" />,
	},
	{
		label: i18next.t("sharing.accessOptions.view"),
		value: "view",
		icon: <Icon width={20} height={20} iconName="canView" />,
	},
];

export function ShareModal() {
	const { boardId } = useContextMenuContext();
	const { closeModal } = useUiModalContext();
	const boardsList = useBoardsList();
	const account = useAccount();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userEmails, setUserEmails] = useState<string[]>([]);
	const [userEmails2, setUserEmails2] = useState<string[]>([]);
	const [usersMode, setUsersMode] = useState<UserAccessType>(
		UserAccessType.Edit,
	);
	const [usersMode2, setUsersMode2] = useState<UserAccessType>(
		UserAccessType.View,
	);
	const [isSecondInputVisible, setIsSecondInputVisible] = useState(false);
	const [isGrantedUsersLoading, setIsGrantedUsersLoading] = useState(true);
	const [grantedUsers, setGrantedUsers] = useState<boardsApiV2.GrantedUser[]>(
		[],
	);
	const [searchOptions, setSearchOptions] = useState<usersApi.User[]>([]);
	const [isSearchOptionsLoading, setIsSearchOptionsLoading] = useState(false);
	const [highlightedEmail, setHighlightedEmail] = useState<string | null>(
		null,
	);
	const { t } = useTranslation();

	const loadInfo = async () => {
		if (!boardId) {
			return;
		}
		try {
			const { data } = await boardsApiV2.getGrantedUsers(boardId);
			setGrantedUsers(
				data?.map(user => {
					return {
						...user,
						name: user.name || getEmailPrefix(user.email),
					};
				}) ?? [],
			);
		} catch {
			setGrantedUsers([]);
		} finally {
			setIsGrantedUsersLoading(false);
		}
	};

	useEffect(() => {
		loadInfo();
	}, [boardId]);

	const boardInfo = boardsList.getBoardInfo(boardId);
	const [isPublic, setIsPublic] = useState<boolean>(
		() => boardInfo?.isPublic ?? true,
	);
	const [mode, setMode] = useState<DirectAccessType>(
		() => boardInfo?.directAccessType ?? DirectAccessType.EDIT,
	);

	const isOwner = account.permissions.checkPermissions(
		"owns",
		"boards",
		boardId,
	);

	useEffect(() => {
		setIsPublic(boardInfo?.isPublic ?? true);
		setMode(boardInfo?.directAccessType ?? DirectAccessType.EDIT);
	}, [boardInfo]);

	const disabled = !account.isLoggedIn || !isOwner || isSubmitting;

	const handleUserAccessChange = (info: {
		userId: number;
		accessType: UserAccessType;
	}) => {
		const copy = structuredClone(grantedUsers);
		const targetIdx = copy.findIndex(user => user.id === info.userId);
		if (!copy[targetIdx]) {
			return;
		}
		copy[targetIdx].accessType = info.accessType;
		setGrantedUsers(copy);
	};
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(
				`${window.location.origin}/boards/${boardId}`,
			);
			notify({
				body: t("sharing.copyLink.success"),
				variant: "success",
			});
		} catch {
			notify({ body: t("sharing.copyLink.error"), variant: "error" });
		}
	};

	const handleSearchInput = async (val: string) => {
		const { data } = await usersApi.getUsers(val, 1);
		if (data) {
			setSearchOptions(data);
		}
		setIsSearchOptionsLoading(false);
	};

	const debouncedHandleInputSearch = useCallback(
		debounce(handleSearchInput, 700),
		[usersApi],
	);

	const handleInputChange = (val: string) => {
		setIsSearchOptionsLoading(true);
		debouncedHandleInputSearch(val);
	};

	const handleSubmit = async () => {
		if (!mode || typeof isPublic !== "boolean" || !boardId) {
			return;
		}

		setIsSubmitting(true);

		const filteredGrantedUsers = grantedUsers.filter(user => !user.isOwner);
		await boardsList.manageAccess(boardId, {
			users: [
				...filteredGrantedUsers.map(user => ({
					userId: user.id,
					accessType: user.accessType,
				})),
				...userEmails.map(email => ({
					userId: searchOptions.find(user => user.email === email)
						?.id!,
					accessType: usersMode,
				})),
				...userEmails2.map(email => ({
					userId: searchOptions.find(user => user.email === email)
						?.id!,
					accessType: usersMode2,
				})),
			],
			directAccessType: mode,
			isPublic,
		});

		await loadInfo();
		closeModal();
		setIsSubmitting(false);
	};

	const handleAddUser =
		(setUserEmails: (val: string[]) => void) =>
		(values: string[], currValue: string) => {
			const addedUser = grantedUsers.find(
				({ email }) => email === currValue.trim(),
			);

			if (addedUser) {
				setHighlightedEmail(addedUser.email);
				setTimeout(() => {
					setHighlightedEmail(null);
				}, 3000);
				return;
			}

			setUserEmails(values);
		};
	return (
		<UiModal className={styles.modalContainer} modalId={SHARE_MODAL_ID}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>
					{t("sharing.share")} - {boardInfo?.title}
				</h1>
				{account.isLoggedIn && isOwner && (
					<>
						<div
							className={clsx(
								styles.selectors,
								styles.searchInputWrapper,
								userEmails.length > 0 &&
									styles.modeVisibleShort,
							)}
						>
							<div>
								<SearchInput
									excludeValues={grantedUsers.map(
										({ email }) => email,
									)}
									isLoading={isSearchOptionsLoading}
									onValuesChange={handleAddUser(
										setUserEmails,
									)}
									onInput={handleInputChange}
									options={searchOptions
										.filter(
											user =>
												user.id !== account.info?.id &&
												!grantedUsers.find(
													granted =>
														granted.id === user.id,
												) &&
												!userEmails2.find(
													added =>
														added === user.email,
												),
										)
										.map(user => ({
											value: user.email,
											label: user.email,
											icon: (
												<UserAvatar
													width={20}
													height={20}
													src={user.avatar}
												/>
											),
										}))}
									placeholder={t("sharing.addUsers")}
								/>
							</div>
							<div className={styles.selector}>
								<UiSelector
									value={usersMode}
									options={MODE_SELECTOR_OPTIONS}
									iconColor="rgba(105, 107, 118, 1)"
									onChange={val =>
										setUsersMode(val as UserAccessType)
									}
								/>
							</div>
						</div>
						{isSecondInputVisible && (
							<div
								className={clsx(
									styles.selectors,
									styles.searchInputWrapper,
									userEmails2.length > 0 &&
										styles.modeVisibleShort,
								)}
							>
								<SearchInput
									excludeValues={grantedUsers.map(
										({ email }) => email,
									)}
									isLoading={isSearchOptionsLoading}
									onValuesChange={handleAddUser(
										setUserEmails2,
									)}
									onInput={handleInputChange}
									options={searchOptions
										.filter(
											user =>
												user.id !== account.info?.id &&
												!grantedUsers.find(
													granted =>
														granted.id === user.id,
												) &&
												!userEmails.find(
													added =>
														added === user.email,
												),
										)
										.map(user => ({
											value: user.email,
											label: user.email,
											icon: (
												<UserAvatar
													width={20}
													height={20}
													src={user.avatar}
												/>
											),
										}))}
									placeholder={t("sharing.addUsers")}
								/>
								<div className={styles.selector}>
									<UiSelector
										options={MODE_SELECTOR_OPTIONS}
										value={usersMode2}
										iconColor="rgba(105, 107, 118, 1)"
										onChange={val =>
											setUsersMode2(val as UserAccessType)
										}
									/>
								</div>
							</div>
						)}
						{!isSecondInputVisible && userEmails.length > 0 && (
							<button
								className={styles.secondInputBtn}
								onClick={ev => {
									ev.stopPropagation();
									setIsSecondInputVisible(true);
								}}
							>
								<Icon iconName="Plus" width={20} height={20} />{" "}
								{t("sharing.addAccessLevel")}
							</button>
						)}
						<div className={styles.grantedUsers}>
							<h2 className={styles.settingsHeading}>
								{t("sharing.grantedUsers")}
							</h2>
							<div className={styles.usersList}>
								{isGrantedUsersLoading ? (
									<GrantedUserSkeleton />
								) : (
									<TransitionGroup component={null}>
										{grantedUsers.map(user => (
											<CSSTransition
												key={user.id}
												timeout={500}
												classNames={{
													enter: styles.fadeEnter,
													enterActive:
														styles.fadeEnterActive,
													exit: styles.fadeExit,
													exitActive:
														styles.fadeExitActive,
												}}
											>
												<GrantedUser
													highlighted={
														highlightedEmail ===
														user.email
													}
													onChange={
														handleUserAccessChange
													}
													{...user}
												/>
											</CSSTransition>
										))}
									</TransitionGroup>
								)}
							</div>
							<UiSeparator />
						</div>
					</>
				)}
				{!account.isLoggedIn && isOwner && (
					<p className={styles.notAuth}>
						{t("sharing.notAuthMsg")}{" "}
						<Link to="/auth/sign-in">{t("sharing.login")}</Link>{" "}
						{t("sharing.or")}{" "}
						<Link to="/auth/sign-up">{t("sharing.register")}</Link>.
					</p>
				)}
				<div className={styles.settings}>
					{account.isLoggedIn && isOwner && (
						<h2 className={styles.settingsHeading}>
							{t("sharing.publicAccess")}
						</h2>
					)}
					<div
						className={clsx(
							styles.selectors,
							isPublic && styles.modeVisible,
						)}
					>
						<UiSelector
							isLoading={boardsList.isLoading}
							disabled={disabled}
							iconColor="rgba(105, 107, 118, 1)"
							options={PRIVACY_SELECTOR_OPTIONS}
							onChange={opt => setIsPublic(opt === "public")}
							value={
								isPublic
									? PRIVACY_SELECTOR_OPTIONS[0].value
									: PRIVACY_SELECTOR_OPTIONS[1].value
							}
						/>
						<div className={styles.selector}>
							<UiSelector
								isLoading={boardsList.isLoading}
								disabled={disabled}
								iconColor="rgba(105, 107, 118, 1)"
								options={MODE_SELECTOR_OPTIONS}
								onChange={opt =>
									setMode(opt as DirectAccessType)
								}
								value={
									mode === boardsApiV2.DirectAccessType.EDIT
										? MODE_SELECTOR_OPTIONS[0].value
										: MODE_SELECTOR_OPTIONS[1].value
								}
							/>
						</div>
					</div>
					{boardInfo?.isPublic && (
						<p className={styles.publicMsg}>
							{t("sharing.publicBoard")}
						</p>
					)}
				</div>
				<div className={styles.btns}>
					<Button
						onClick={handleCopy}
						className={clsx(styles.btn, styles.copyBtn)}
						pattern="ghostFilled"
					>
						<span className={styles.copyIcon}>
							<Icon iconName="CopyLink" />{" "}
						</span>
						<span>{t("sharing.copyLink.label")}</span>
					</Button>
					<Button
						onClick={handleSubmit}
						className={styles.btn}
						disabled={disabled}
					>
						{t("sharing.submit")}
					</Button>
				</div>
			</div>
			{isSubmitting && <div className={styles.loader} />}
		</UiModal>
	);
}

const USER_ACCESS_SELECTOR_OPTIONS: Option[] = [
	{
		value: "edit",
		label: i18next.t("sharing.accessOptions.edit"),
		icon: <Icon width={20} height={20} iconName="drawingPen" />,
	},
	{
		value: "view",
		label: i18next.t("sharing.accessOptions.view"),
		icon: <Icon width={20} height={20} iconName="canView" />,
	},
	{
		value: "noAccess",
		label: i18next.t("sharing.accessOptions.noAccess"),
		icon: <Icon width={20} height={20} iconName="Close" />,
	},
];

type GrantedUserProps = GrantedUser & {
	onChange: (userAcces: {
		userId: number;
		accessType: UserAccessType;
	}) => void;
	highlighted?: boolean;
};

function GrantedUser({
	id,
	email,
	name,
	accessType,
	avatar,
	isOwner,
	onChange,
	highlighted,
}: GrantedUserProps) {
	const account = useAccount();
	const isLoggedInUser = account.info?.id === id;
	const { t } = useTranslation();

	return (
		<div
			className={clsx(
				styles.grantedUser,
				highlighted && styles.highlighted,
			)}
		>
			<div className={styles.userInfo}>
				<div className={styles.avatar}>
					<UserAvatar
						width={40}
						height={40}
						src={avatar ?? undefined}
					/>
				</div>
				<div className={styles.userInfoText}>
					<h3 className={styles.userName}>
						{name} {isLoggedInUser && `(${t("sharing.itsYou")})`}
					</h3>
					<span className={styles.userEmail}>{email}</span>
				</div>
			</div>
			<div className={styles.userStatus}>
				{isOwner ? (
					<span className={styles.ownerLabel}>
						{t("sharing.owner")}
					</span>
				) : (
					<UiSelector
						className={styles.grantedUserSelector}
						iconColor="rgba(105, 107, 118, 1)"
						options={USER_ACCESS_SELECTOR_OPTIONS}
						value={accessType}
						onChange={type =>
							onChange({
								accessType: type as UserAccessType,
								userId: id,
							})
						}
					/>
				)}
			</div>
		</div>
	);
}

function GrantedUserSkeleton() {
	return (
		<div className={styles.grantedUser}>
			<div className={styles.userInfo}>
				<div className={styles.avatar}>
					<UiSkeleton
						className={styles.skeletonAvatar}
						width={40}
						height={40}
					/>
				</div>
				<div className={styles.userInfoText}>
					<h3 className={styles.userName}>
						<UiSkeleton className={styles.skeletonInfo} />
					</h3>
					<span className={styles.userEmail}>
						<UiSkeleton className={styles.skeletonInfo} />
					</span>
				</div>
			</div>
			<div className={styles.userStatus}>
				<UiSkeleton className={styles.skeletonSelector} />
			</div>
		</div>
	);
}
