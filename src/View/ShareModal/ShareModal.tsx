import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import i18next from "i18next";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usersApi } from "shared/api";
import { boardsApiV2 } from "shared/apiV2";
import {
	DirectAccessType,
	UserAccessType,
	type GrantedUser,
} from "shared/apiV2/boards";
import { Button } from "shared/ui-lib/Button";
import { Link } from "shared/ui-lib/Link";
import { useContextMenuContext } from "View/ContextMenu";
import { Icon } from "View/Icon";
import { notify } from "View/Ui/Toast";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import { UiSelector, type Option } from "View/Ui/UiSelector";
import { SearchInput } from "./SearchInput";
import styles from "./ShareModal.module.css";
import { UserAvatar } from "View/UserPanel/UserPanel";
import { UiSeparator } from "View/Ui/UiSeparator";
import clsx from "clsx";

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
	const [userEmails, setUserEmails] = useState<string[]>([]);
	const [usersMode, setUsersMode] = useState<UserAccessType>(
		UserAccessType.Edit,
	);
	const [grantedUsers, setGrantedUsers] = useState<boardsApiV2.GrantedUser[]>(
		[],
	);
	const [searchOptions, setSearchOptions] = useState<usersApi.User[]>([]);
	const { t } = useTranslation();

	useEffect(() => {
		if (!boardId) {
			return;
		}
		boardsApiV2
			.getGrantedUsers(boardId)
			.then(({ data }) => setGrantedUsers(data ?? []));
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

	const disabled = !account.isLoggedIn || !isOwner;

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

	const handleSubmit = async () => {
		closeModal();
		if (!mode || typeof isPublic !== "boolean" || !boardId) {
			return;
		}
		await boardsList.updatePrivacySettings(
			boardId,
			isPublic ?? boardInfo?.isPublic,
			mode,
		);

		const filteredGrantedUsers = grantedUsers.filter(user => !user.isOwner);
		if (filteredGrantedUsers.length > 0) {
			await boardsApiV2.grantAccess(
				boardId,
				filteredGrantedUsers.map(user => ({
					userId: user.id,
					accessType: user.accessType,
				})),
			);
		}

		if (userEmails.length > 0) {
			await boardsApiV2.grantAccess(
				boardId,
				userEmails.map(email => ({
					userId: searchOptions.find(user => user.email === email)
						?.id!,
					accessType: usersMode,
				})),
			);
		}
	};
	return (
		<UiModal className={styles.modalContainer} modalId={SHARE_MODAL_ID}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>
					{t("sharing.share")} - {boardInfo?.title}
				</h1>
				{account.isLoggedIn && (
					<>
						<div className={styles.selectors}>
							<SearchInput
								onValueAdd={val => {
									setUserEmails(val);
								}}
								onInput={async val => {
									const { data } =
										await usersApi.getUsers(val);
									if (data) {
										setSearchOptions(data);
									}
								}}
								options={searchOptions
									.filter(
										user =>
											user.id !== account.info?.id ||
											!grantedUsers.find(
												granted =>
													granted.id === user.id,
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
							/>
							<UiSelector
								options={MODE_SELECTOR_OPTIONS}
								iconColor="rgba(105, 107, 118, 1)"
								onChange={val =>
									setUsersMode(val as UserAccessType)
								}
							/>
						</div>
						<div className={styles.grantedUsers}>
							<h2 className={styles.settingsHeading}>
								{t("sharing.grantedUsers")}
							</h2>
							<div className={styles.usersList}>
								{grantedUsers.map(user => (
									<GrantedUser
										onChange={handleUserAccessChange}
										{...user}
										key={user.id}
									/>
								))}
							</div>
							<UiSeparator />
						</div>
					</>
				)}
				{!account.isLoggedIn && (
					<p className={styles.notAuth}>
						{t("sharing.notAuthMsg")}{" "}
						<Link to="/auth/sign-in">{t("sharing.login")}</Link>{" "}
						{t("sharing.or")}{" "}
						<Link to="/auth/sign-up">{t("sharing.register")}</Link>.
					</p>
				)}
				<div className={styles.settings}>
					<h2 className={styles.settingsHeading}>
						{t("sharing.publicAccess")}
					</h2>
					<div className={styles.selectors}>
						<UiSelector
							disabled={disabled}
							iconColor="rgba(105, 107, 118, 1)"
							options={PRIVACY_SELECTOR_OPTIONS}
							onChange={opt => setIsPublic(opt === "public")}
							initialValue={
								isPublic
									? PRIVACY_SELECTOR_OPTIONS[0].value
									: PRIVACY_SELECTOR_OPTIONS[1].value
							}
						/>
						<UiSelector
							disabled={disabled}
							iconColor="rgba(105, 107, 118, 1)"
							options={MODE_SELECTOR_OPTIONS}
							onChange={opt => setMode(opt as DirectAccessType)}
							initialValue={
								mode === boardsApiV2.DirectAccessType.EDIT
									? MODE_SELECTOR_OPTIONS[0].value
									: MODE_SELECTOR_OPTIONS[1].value
							}
						/>
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
};

function GrantedUser({
	id,
	email,
	name,
	accessType,
	avatar,
	isOwner,
	onChange,
}: GrantedUserProps) {
	const account = useAccount();
	const isLoggedInUser = account.info?.id === id;
	const { t } = useTranslation();

	return (
		<div className={styles.grantedUser}>
			<div className={styles.userInfo}>
				<div className={styles.avatar}>
					<img src={avatar} />
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
						iconColor="rgba(105, 107, 118, 1)"
						options={USER_ACCESS_SELECTOR_OPTIONS}
						initialValue={accessType}
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
