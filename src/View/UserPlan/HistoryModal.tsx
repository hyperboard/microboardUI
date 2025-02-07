import { useAccount } from "App/useAccount";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import { LIMITS_MODAL_ID } from "View/UserPlan/LimitsModal";
import styles from "./UserPlanModal.module.css";
import { HistoryTable } from "View/UserPlan/HistoryTable";

export const HISTORY_MODAL_ID = Symbol("historyModal");

export function HistoryModal() {
	const { t } = useTranslation();
	const { openModal } = useUiModalContext();
	const handleBackButton = () => openModal(LIMITS_MODAL_ID);

	return (
		<UiModal modalId={HISTORY_MODAL_ID} closeByBgClick={false}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>Payment History</h1>
				<HistoryTable />
				<button className={styles.plansBtn} onClick={handleBackButton}>
					<Icon iconName="ArrowLeft1" />
					Back to Curren Plan
				</button>
			</div>
		</UiModal>
	);
}
