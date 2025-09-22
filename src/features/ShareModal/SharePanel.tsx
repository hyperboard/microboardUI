import React, { useState, forwardRef, ForwardedRef } from "react";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import styles from "./SharePanel.module.css";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "features/UserPanel/UserAvatar/UserAvatar";
import { SearchInput } from "features/ShareModal/SearchInput";
import { GrantedUser } from "shared/api/boards/types";
import { usersApi } from "shared/api";
import { useAccount } from "App/useAccount";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import clsx from "clsx";
import shareModalStyles from "./ShareModal.module.css";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { UiSelector, Option } from "shared/ui-lib/UiSelector";
import { UserAccessType } from "shared/api/boards";
import { conf } from "microboard-temp";

const MODE_SELECTOR_OPTIONS: Option[] = [
  {
    label: conf.i18n.t("sharing.accessOptions.edit"),
    value: "edit",
    icon: <Icon width={20} height={20} iconName="drawingPen" />,
  },
  {
    label: conf.i18n.t("sharing.accessOptions.view"),
    value: "view",
    icon: <Icon width={20} height={20} iconName="canView" />,
  },
];

interface Props {
  boardName?: string;
  grantedUsers: GrantedUser[];
  onInput: (value: string) => void;
  searchOptions: usersApi.User[];
  userEmails2: string[];
  userEmails: string[];
  setUserEmails: (userEmails: string[]) => void;
  setUserEmails2: (userEmails2: string[]) => void;
  usersMode: UserAccessType;
  usersMode2: UserAccessType;
  setUsersMode: (newUsers: UserAccessType) => void;
  setUsersMode2: (newUsers: UserAccessType) => void;
  handleAddUser: (
    setUserEmails: (val: string[]) => void,
  ) => (values: string[], currValue: string) => void;
  isLoading: boolean;
  onSubmit: () => Promise<void>;
  toggleIsOpen: () => void;
}

export const SharePanel = forwardRef(
  (
    {
      boardName,
      userEmails2,
      userEmails,
      setUserEmails,
      setUserEmails2,
      handleAddUser,
      onInput,
      searchOptions,
      isLoading,
      grantedUsers,
      usersMode,
      usersMode2,
      setUsersMode2,
      setUsersMode,
      onSubmit,
      toggleIsOpen,
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const { t } = useTranslation();
    const account = useAccount();
    const [isSecondInputVisible, setIsSecondInputVisible] = useState(false);

    const handleSecondInputToggle = (event: React.MouseEvent) => {
      event.stopPropagation();
      setIsSecondInputVisible(!isSecondInputVisible);
    };

    return (
      <div className={styles.blackout}>
        <UiPanel ref={ref} className={styles.panel} vertical>
          <UiButton
            variant="secondary"
            className={clsx(styles.closeBtn)}
            onClick={(evt) => {
              evt.stopPropagation();
              toggleIsOpen();
            }}
          >
            <Icon width={28} height={28} iconName="Close" />
          </UiButton>
          <div className={styles.wrapper}>
            <h1 className={styles.heading}>
              {t("sharing.sharePanel.access")} - {boardName}
            </h1>
            <div
              className={clsx(
                shareModalStyles.selectors,
                shareModalStyles.searchInputWrapper,
                userEmails.length > 0 && shareModalStyles.modeVisibleShort,
              )}
            >
              <div>
                <SearchInput
                  excludeValues={grantedUsers.map(({ email }) => email)}
                  isLoading={isLoading}
                  addedEmails={userEmails}
                  onValuesChange={handleAddUser(setUserEmails)}
                  onInput={onInput}
                  options={searchOptions
                    .filter(
                      (user) =>
                        user.id !== account.info?.id &&
                        !grantedUsers.find(
                          (granted) => granted.id === user.id,
                        ) &&
                        !userEmails2.find((added) => added === user.email),
                    )
                    .map((user) => ({
                      value: user.email || "",
                      label: user.email || "",
                      icon: (
                        <UserAvatar width={20} height={20} src={user.avatar} />
                      ),
                    }))}
                  placeholder={t("sharing.addUsers")}
                />
              </div>
              <div className={shareModalStyles.selector}>
                <UiSelector
                  value={usersMode}
                  options={MODE_SELECTOR_OPTIONS}
                  iconColor="rgba(105, 107, 118, 1)"
                  onChange={(val) => {
                    setUsersMode(val as UserAccessType);
                  }}
                />
              </div>
            </div>

            {isSecondInputVisible && (
              <div
                className={clsx(
                  shareModalStyles.selectors,
                  shareModalStyles.searchInputWrapper,
                  userEmails2.length > 0 && shareModalStyles.modeVisibleShort,
                )}
              >
                <div>
                  <SearchInput
                    excludeValues={grantedUsers.map(({ email }) => email)}
                    isLoading={isLoading}
                    onValuesChange={handleAddUser(setUserEmails2)}
                    onInput={onInput}
                    options={searchOptions
                      .filter(
                        (user) =>
                          user.id !== account.info?.id &&
                          !grantedUsers.find(
                            (granted) => granted.id === user.id,
                          ) &&
                          !userEmails.find((added) => added === user.email),
                      )
                      .map((user) => ({
                        value: user.email || "",
                        label: user.email || "",
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
                <div className={shareModalStyles.selector}>
                  <UiSelector
                    options={MODE_SELECTOR_OPTIONS}
                    value={usersMode2}
                    iconColor="rgba(105, 107, 118, 1)"
                    onChange={(val) => {
                      setUsersMode2(val as UserAccessType);
                    }}
                  />
                </div>
              </div>
            )}

            {!isSecondInputVisible && userEmails.length > 0 && (
              <button
                className={shareModalStyles.secondInputBtn}
                onClick={handleSecondInputToggle}
              >
                <Icon iconName="Plus" width={20} height={20} />{" "}
                {t("sharing.addAccessLevel")}
              </button>
            )}

            <div className={styles.btns}>
              <UiButton
                variant="ghost"
                onClick={(evt) => {
                  evt.stopPropagation();
                  toggleIsOpen();
                }}
                className={styles.btn}
                size="lg"
              >
                {t("sharing.sharePanel.cancel")}
              </UiButton>
              <UiButton
                onClick={() => {
                  onSubmit().then(toggleIsOpen);
                }}
                disabled={isLoading}
                className={clsx(styles.btn)}
                variant="primary"
                size="lg"
              >
                {t("sharing.sharePanel.openAccess")}
              </UiButton>
            </div>
          </div>
        </UiPanel>
      </div>
    );
  },
);
