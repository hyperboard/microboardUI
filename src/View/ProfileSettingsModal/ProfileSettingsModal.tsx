import { useAccount } from "App/useAccount";
import { CHANGE_PASSWORD_MODAL } from "View/ChangePasswordModal";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import { UserAvatar } from "View/UserPanel/UserPanel";
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

export const PROFILE_SETTINGS_MODAL_ID = Symbol("profileSettingsModal");

export function ProfileSettingsModal() {
	const account = useAccount();
	const [name, setName] = useState(() => account.info?.name ?? "");
	const [updateState, setUpdateState] = useState<
		"idle" | "error" | "loading" | "success"
	>("idle");
	const { openModal, closeModal } = useUiModalContext();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const debouncedChangeInfo = useCallback(
		debounce(async (newName: string) => {
			setUpdateState("loading");
			await account.changeInfo({ name: newName });
			setUpdateState("success");

			setTimeout(() => {
				setUpdateState("idle");
			}, 3000);
		}, 2000),
		[account],
	);

	const handleNameChange: ChangeEventHandler<HTMLInputElement> = ev => {
		ev.stopPropagation();
		const newName = ev.target.value;
		setName(newName);

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

		if (file) {
			await account.uploadAvatar(file);
		}
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
						accept="image/jpeg,image/png,image/svg+xml"
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
					{/* <Input
						label="Email"
						value={account.info?.email}
						autoFocus={false}
						disabled
						id="email"
					/> */}
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
							updateState === "idle" ? t("profile.msg") : ""
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
