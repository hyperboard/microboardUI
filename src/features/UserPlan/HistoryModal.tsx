import { HistoryTable } from "features/UserPlan/HistoryTable";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import styles from "./UserPlanModal.module.css";
import { USER_PLAN_MODAL_ID } from "features/UserPlan/UserPlanModal";
export const HISTORY_MODAL_ID = Symbol("historyModal");

export function HistoryModal() {
  const { t } = useTranslation();
  const { openModal } = useUiModalContext();
  const handleBackButton = () => openModal(USER_PLAN_MODAL_ID);

  return (
    <UiModal modalId={HISTORY_MODAL_ID} closeByBgClick={false}>
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>
          {t("userPlan.paymentHistoryHeading")}
        </h1>
        <HistoryTable />
        <button className={styles.plansBtn} onClick={handleBackButton}>
          <Icon iconName="ArrowLeft1" />
          {t("userPlan.backToPlans")}
        </button>
      </div>
    </UiModal>
  );
}
