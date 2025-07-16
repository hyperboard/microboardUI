import { useAccount } from "App/useAccount";
import { CHANGE_PASSWORD_MODAL } from "features/ChangePasswordModal";
import { ChangePassword } from "features/UserPanel/icons/ChangePassword";
import { Logout } from "features/UserPanel/icons/Logout";
import { UserAvatar } from "features/UserPanel/UserAvatar/UserAvatar";
import { USER_PLAN_MODAL_ID } from "features/UserPlan";
import React, {
  ReactElement,
  useCallback,
  useRef,
  useState,
  type ChangeEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { debounce } from "shared/lib/debounce";
import { Checkbox } from "shared/ui-lib/Checkbox";
import { Icon } from "shared/ui-lib/Icon";
import { Input } from "shared/ui-lib/Input";
import { OuterLink } from "shared/ui-lib/OuterLink";
import { notify } from "shared/ui-lib/Toast";
import { UiButton } from "shared/ui-lib/UiButton";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import styles from "./ProfileSettingsModal.module.css";

export const PROFILE_SETTINGS_MODAL_ID = Symbol("profileSettingsModal");
const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];

export function ProfileSettingsModal(): ReactElement {
  // const isMediaMatches = useMediaQuery("(max-width: 1170px)");
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
  const isEmailExist = Boolean(account.info?.email);

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

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    ev.stopPropagation();
    abortController.current.abort();
    abortController.current = new AbortController();
    const newName = ev.target.value;
    setUpdateState("idle");
    setName(newName);
    if (setIdleTimeoutRef.current) {
      clearTimeout(setIdleTimeoutRef.current);
    }
    debouncedChangeInfo(newName, account.info?.newsletter);
  };

  const debouncedChangeNewsletter = useCallback(
    debounce(async (newsletter: boolean) => {
      await account.changeNewsletter(
        { newsletter },
        abortController.current.signal,
      );
    }, 2000),
    [account],
  );

  const handleNewsletterChange = (_newsletter: boolean): void => {
    abortController.current.abort();
    abortController.current = new AbortController();
    if (setIdleTimeoutRef.current) {
      clearTimeout(setIdleTimeoutRef.current);
    }
    debouncedChangeNewsletter(!account.info?.newsletter);
  };

  const handleOpenPasswordChange: MouseEventHandler = (ev) => {
    ev.stopPropagation();
    openModal(CHANGE_PASSWORD_MODAL);
  };

  const handleAddEmail: MouseEventHandler = (ev) => {
    ev.stopPropagation();
    navigate("/bind-email/add-email" + window.location.search);
  };

  const handleAvatarChange: ChangeEventHandler<HTMLInputElement> = async (
    ev,
  ) => {
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

  const handleAvatarSelectOpen: MouseEventHandler = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    const target = avatarInputRef.current;

    if (!target) {
      return;
    }

    target.click();
  };

  const handlePlanModalOpen: MouseEventHandler = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    // if (isMediaMatches) {
    // 	navigate("/user/plan");
    // } else {
    openModal(USER_PLAN_MODAL_ID);
    // }
  };

  const handleAvatarRemove: MouseEventHandler = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    await account.removeAvatar();
  };

  const handleLogout: MouseEventHandler = async (ev) => {
    ev.stopPropagation();

    await account.logout();

    closeModal();
    navigate("/");
  };

  const preventEvt: KeyboardEventHandler = (ev) => {
    ev.stopPropagation();
  };

  return (
    <UiModal modalId={PROFILE_SETTINGS_MODAL_ID} closeByBgClick={false}>
      <div className={styles.container}>
        <h1 className={styles.heading}>{t("profile.title")}</h1>
        <div className={styles.avatar}>
          <UserAvatar src={account.info?.avatar} width={56} height={56} />
          <input
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(",")}
            style={{ display: "none" }}
            ref={avatarInputRef}
            onChange={handleAvatarChange}
          />
          <div className={styles.avatarBtns}>
            <UiButton
              onClick={handleAvatarSelectOpen}
              className={styles.avatarBtn}
              variant="tertiary"
              size="lg"
            >
              {t("profile.upload")}
            </UiButton>
            <UiButton
              className={styles.avatarBtn}
              variant="quaternary"
              onClick={handleAvatarRemove}
              disabled={account.info?.avatarGenerated}
              size="lg"
            >
              {t("profile.remove")}
            </UiButton>
          </div>
        </div>
        {account.info?.address && (
          <div className={styles.cryptoWallet}>
            {t("profile.cryptoWallet")}: {account.info?.address}
          </div>
        )}
        <div className={styles.inputs}>
          <Input
            label={t("profile.email")}
            placeholder={t("profile.email")}
            disabled
            value={account.info?.email ?? ""}
            id="email"
            autoFocus={false}
            isSuccess={updateState === "success"}
            helperText={isEmailExist ? "" : t("profile.emailDesc")}
          />
          {!isEmailExist && (
            <UiButton
              variant="quaternary"
              size="md"
              className={styles.btn}
              onClick={handleAddEmail}
            >
              {t("profile.addEmail")}
            </UiButton>
          )}
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
            successText={updateState === "success" ? t("profile.saved") : ""}
            helperText={
              updateState === "idle" || updateState === "loading"
                ? t("profile.msg")
                : ""
            }
          />
        </div>
        <NewsLetterCheckbox
          accountNewsletter={account.info?.newsletter}
          onChange={handleNewsletterChange}
        />
        <div className={styles.btns}>
          <UiButton
            type="button"
            onClick={handleOpenPasswordChange}
            variant="ghost"
            className={styles.btn}
            size="lg"
          >
            <ChangePassword /> {t("profile.changePassword")}
          </UiButton>
          <UiButton
            type="button"
            onClick={handlePlanModalOpen}
            variant="ghost"
            className={styles.btn}
            size="lg"
          >
            <span className={styles.icon}>
              <Icon iconName="ArrowUpCircle" width={20} height={20} />
            </span>{" "}
            {t("userPlan.upgradePlan")}
          </UiButton>
          <UiButton
            type="button"
            onClick={handleLogout}
            variant="ghost"
            className={styles.btn}
            size="lg"
          >
            <Logout /> {t("profile.logout")}
          </UiButton>
        </div>
      </div>
    </UiModal>
  );
}

const NewsLetterCheckbox = ({
  accountNewsletter,
  onChange,
}: {
  accountNewsletter?: boolean;
  onChange: (isChecked: boolean) => void;
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={styles.newsletter}>
      <Checkbox checked={accountNewsletter} onChange={onChange}>
        <span className={styles.newsletter}>
          {t("auth.newsletter")}
          <OuterLink
            href={"https://microboard.io/privacy-policy"}
            className={styles.newsletterLink}
          >
            {" "}
            Microboard.io
          </OuterLink>
        </span>
      </Checkbox>
    </div>
  );
};
