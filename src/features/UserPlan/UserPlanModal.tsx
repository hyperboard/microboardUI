import { useAccount } from "App/useAccount";
import { PROFILE_SETTINGS_MODAL_ID } from "features/ProfileSettingsModal";
import { UiSwitch } from "shared/ui-lib/UiSwitch";
import clsx from "clsx";
import React, { useEffect, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import {
  BasicPlanCard,
  PlusAIPlanCard,
  PlusPlanCard,
  ProPlanCard,
} from "./PlanCards";
import styles from "./UserPlanModal.module.css";
import { UserPlanUsage } from "./UserPlanUsage";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";

export const USER_PLAN_MODAL_ID = "USER_PLAN_MODAL_ID";

export function UserPlanModal() {
  const { openModal } = useUiModalContext();
  const { t, i18n } = useTranslation();
  const account = useAccount();

  // const currentModelId: OpenAIModels =
  //   account.billingInfo?.plan.name === "plusAI" ? "gpt-4o" : "gpt-4o-mini";
  // const currentModel = account.billingInfo?.models.find(
  //   ({ id }) => id === currentModelId,
  // );

  const handleOpenProfileSettings: MouseEventHandler = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    openModal(PROFILE_SETTINGS_MODAL_ID);
  };

  useEffect(() => {
    account.fetchBillingInfo();
  }, []);

  return (
    <UiModal modalId={USER_PLAN_MODAL_ID} closeByBgClick={false}>
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>{t("userPlan.upgradePlan")}</h1>
        <UserPlanUsage
          isFree={account.billingInfo?.plan.planId === "basic"}
          planName={
            window.MICROBOARD_CONFIG.planNames[
              account.billingInfo?.plan.name ?? "basic"
            ]
          }
          status={account.billingInfo?.plan.status ?? "active"}
          cancellationDate={account.billingInfo?.plan.endDate}
        />
        <UiSwitch
          options={[
            { label: "Monthly", value: false },
            {
              label: ({
                handleClick,
                btnClass,
                textClass,
                activeClass,
                isActive,
                value,
                ref: optionsRefs,
              }) => (
                <button
                  key={value.toString()}
                  onClick={handleClick}
                  className={clsx(btnClass, isActive && activeClass)}
                  ref={(ref) => optionsRefs.current?.push(ref)}
                >
                  <span className={clsx(textClass, styles.switchBtn)}>
                    <span>Annual</span>
                    <span
                      className={clsx(styles.badge, isActive && styles.active)}
                    >
                      Save 30%
                    </span>
                  </span>
                </button>
              ),
              value: true,
            },
          ]}
          onChange={(val) => account.setIsAnnualPayment(val as boolean)}
          value={account.getIsAnnualPayment()}
        />
        <div className={styles.cardsScroll}>
          <div className={styles.cards}>
            <BasicPlanCard />
            <PlusPlanCard />
            {window.enableAI && <PlusAIPlanCard />}
            <ProPlanCard />
          </div>
        </div>
        <UiButton
          variant="ghostFilled"
          className={styles.back}
          onClick={handleOpenProfileSettings}
          size="lg"
        >
          {t("userPlan.backToProfile")}
        </UiButton>
      </div>
    </UiModal>
  );
}
