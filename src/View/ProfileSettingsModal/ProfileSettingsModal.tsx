import { useAccount } from "App/useAccount";
import { CHANGE_PASSWORD_MODAL } from "View/ChangePasswordModal";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import { ChangePassword } from "View/UserPanel/icons/ChangePassword";
import { Logout } from "View/UserPanel/icons/Logout";
import { debounce } from "lib/debounce";
import React, {
	useCallback,
	useRef,
	useState,
	type ChangeEventHandler,
	type KeyboardEventHandler,
	type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input";
import styles from "./ProfileSettingsModal.module.css";
import { UserAvatar } from "View/UserPanel/UserAvatar/UserAvatar";
import { notify } from "View/Ui/Toast";
import { USER_PLAN_MODAL_ID } from "View/UserPlan";
import { Icon } from "View/Icon";
import { useMediaQuery } from "lib/useMediaQuery";

export const PROFILE_SETTINGS_MODAL_ID = Symbol("profileSettingsModal");
const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];

export function ProfileSettingsModal() {
	const isMediaMatches = useMediaQuery("(max-width: 1170px)");
	const account = useAccount();
	const [name, setName] = useState(() => account.info?.name ?? "");
	const [updateState, setUpdateState] = useState<
		"idle" | "error" | "loading" | "success"
	>("idle");
	const { openModal, closeModal } = useUiModalContext();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const setIdleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const abortController = useRef(new AbortController());

	const debouncedChangeInfo = useCallback(
		debounce(async (newName: string) => {
			setUpdateState("loading");
			await account.changeInfo(
				{ name: newName },
				abortController.current.signal,
			);
			setUpdateState("success");

			setIdleTimeoutRef.current = setTimeout(() => {
				setUpdateState("idle");
			}, 3000);
		}, 2000),
		[account],
	);

	const handleNameChange: ChangeEventHandler<HTMLInputElement> = ev => {
		ev.stopPropagation();
		abortController.current.abort();
		abortController.current = new AbortController();
		const newName = ev.target.value;
		setUpdateState("idle");
		setName(newName);
		if (setIdleTimeoutRef.current) {
			clearTimeout(setIdleTimeoutRef.current);
		}
		debouncedChangeInfo(newName);
	};

	const handleOpenPasswordChange: MouseEventHandler = ev => {
		ev.stopPropagation();
		openModal(CHANGE_PASSWORD_MODAL);
	};

	const handleAvatarChange: ChangeEventHandler<
		HTMLInputElement
	> = async ev => {
		ev.preventDefault();
		const file = ev.target.files?.[0];
		if (!file) {
			return;
		}
		if (file.size > MAX_AVATAR_SIZE) {
			notify({
				variant: "error",
				header: t("profile.avatarUploadError"),
				body: t("profile.avatarSizeConstraint"),
			});
			return;
		}

		if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
			notify({
				variant: "error",
				header: t("profile.avatarUploadError"),
				body: t("profile.avatarTypeConstraint"),
			});
			return;
		}

		await account.uploadAvatar(file);
		ev.target.value = "";
	};

	const handleAvatarSelectOpen: MouseEventHandler = ev => {
		ev.stopPropagation();
		ev.preventDefault();

		const target = avatarInputRef.current;

		if (!target) {
			return;
		}

		target.click();
	};

	const handlePlanModalOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		if (isMediaMatches) {
			navigate("/user/plan");
		} else {
			openModal(USER_PLAN_MODAL_ID);
		}
	};

	const handleAvatarRemove: MouseEventHandler = async ev => {
		ev.preventDefault();
		ev.stopPropagation();

		await account.removeAvatar();
	};

	const handleLogout: MouseEventHandler = async ev => {
		ev.stopPropagation();

		await account.logout();

		closeModal();
		navigate("/");
	};

	const preventEvt: KeyboardEventHandler = ev => {
		ev.stopPropagation();
	};

	return (
		<UiModal modalId={PROFILE_SETTINGS_MODAL_ID}>
			<div className={styles.container}>
				<h1 className={styles.heading}>{t("profile.title")}</h1>
				<div className={styles.avatar}>
					<UserAvatar
						src={account.info?.avatar}
						width={56}
						height={56}
					/>
					<input
						type="file"
						accept={ACCEPTED_AVATAR_TYPES.join(",")}
						style={{ display: "none" }}
						ref={avatarInputRef}
						onChange={handleAvatarChange}
					/>
					<div className={styles.avatarBtns}>
						<Button
							onClick={handleAvatarSelectOpen}
							className={styles.avatarBtn}
							pattern="tertiary"
						>
							{t("profile.upload")}
						</Button>
						<Button
							className={styles.avatarBtn}
							pattern="secondary"
							onClick={handleAvatarRemove}
							disabled={account.info?.avatarGenerated}
						>
							{t("profile.remove")}
						</Button>
					</div>
				</div>
				<div className={styles.inputs}>
					<p className={styles.email}>{account.info?.email}</p>
					<Input
						label={t("profile.name")}
						value={name}
						id="name"
						onChange={handleNameChange}
						onKeyDown={preventEvt}
						onKeyUp={preventEvt}
						onKeyPress={preventEvt}
						autoFocus={false}
						isSuccess={updateState === "success"}
						successText={
							updateState === "success" ? t("profile.saved") : ""
						}
						helperText={
							updateState === "idle" || updateState === "loading"
								? t("profile.msg")
								: ""
						}
					/>
				</div>
				<div className={styles.btns}>
					<Button
						type="button"
						onClick={handleOpenPasswordChange}
						pattern="ghost"
						className={styles.btn}
					>
						<ChangePassword /> {t("profile.changePassword")}
					</Button>
					<Button
						type="button"
						onClick={handlePlanModalOpen}
						pattern="ghost"
						className={styles.btn}
					>
						<Icon iconName="ArrowUpCircle" width={20} height={20} />{" "}
						{t("profile.changePassword")}
					</Button>
					<Button
						type="button"
						onClick={handleLogout}
						pattern="ghost"
						className={styles.btn}
					>
						<Logout /> {t("profile.logout")}
					</Button>
				</div>
			</div>
		</UiModal>
	);
}
