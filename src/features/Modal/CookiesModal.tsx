import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  InfoColor,
  Notification,
} from "shared/ui-lib/Notification/Notification";
import { UiButton } from "shared/ui-lib/UiButton";
import {
  getConsent,
  setConsent,
  clearPreferenceStorage,
} from "App/consentStorage";
import styles from "./CookiesModal.module.css";

interface CookiesModalProps {
  className?: string;
}

export const CookiesModal = ({
  className,
}: CookiesModalProps): React.ReactElement => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if (getConsent() === null) {
      setOpen(true);
    }
  }, []);

  const handleAcceptAll = (): void => {
    setConsent("accepted");
    setOpen(false);
  };

  const handleDecline = (): void => {
    setConsent("declined");
    clearPreferenceStorage();
    setOpen(false);
  };

  const policyUrl = "https://microboard.io/privacy-policy";

  return (
    <Notification
      isOpen={open}
      className={className}
      infoIcon
      infoColor={InfoColor.info}
      setIsOpen={() => setOpen(false)}
      position="bottom"
    >
      <div className={styles.wr}>
        <h4 className={styles.title}>{t("cookiesModal.title")}</h4>
        <p className={styles.text}>{t("cookiesModal.text")}</p>

        <button
          className={styles.detailsToggle}
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails
            ? t("cookiesModal.hideDetails", "Hide details")
            : t("cookiesModal.showDetails", "What do we store?")}
        </button>

        {showDetails && (
          <div className={styles.details}>
            <p className={styles.detailsCategory}>
              {t("cookiesModal.necessaryTitle", "Necessary (always active)")}
            </p>
            <ul className={styles.detailsList}>
              <li>
                {t(
                  "cookiesModal.necessary1",
                  "cookie_consent — your consent choice (cookie, 6 months)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary2",
                  "accessToken / refreshToken — authentication (cookie, session)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary3",
                  "currentUser / userId — active session identity (localStorage)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary4",
                  "userColor — your cursor color in collaboration (localStorage)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary5",
                  "ui-theme — light/dark theme preference (localStorage)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary6",
                  "controlMode — mouse/trackpad input mode (localStorage)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary7",
                  "lastSeenBoard — last opened board (localStorage)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.necessary8",
                  "Per-board UI state: connector styles, font sizes, etc. (sessionStorage, cleared on tab close)",
                )}
              </li>
            </ul>
            <p className={styles.detailsCategory}>
              {t(
                "cookiesModal.preferencesTitle",
                "Preferences (optional, requires your consent)",
              )}
            </p>
            <ul className={styles.detailsList}>
              <li>
                {t(
                  "cookiesModal.pref1",
                  "anonKey — anonymous identifier for board authorship (localStorage)",
                )}
              </li>
              <li>
                {t(
                  "cookiesModal.pref2",
                  "createdBoards / visitedBoards — history of boards you opened (localStorage)",
                )}
              </li>
            </ul>
          </div>
        )}

        <a
          href={policyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.learnMore}
        >
          {t("cookiesModal.learnMoreBtn")}
        </a>
        <div className={styles.btns}>
          <UiButton
            variant="secondary"
            onClick={handleDecline}
            className={styles.btn}
          >
            {t("cookiesModal.declineBtn", "Necessary only")}
          </UiButton>
          <UiButton
            variant="primary"
            onClick={handleAcceptAll}
            className={styles.btn}
          >
            {t("cookiesModal.acceptBtn")}
          </UiButton>
        </div>
      </div>
    </Notification>
  );
};
