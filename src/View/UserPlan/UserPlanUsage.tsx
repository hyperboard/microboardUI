import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./UserPlanUsage.module.css";
import { Icon } from "View/Icon";
import { useUiModalContext } from "View/Ui/UiModal";
import { LIMITS_MODAL_ID } from "View/UserPlan/LimitsModal";
import { HISTORY_MODAL_ID } from "View/UserPlan/HistoryModal";

type Props = {
	cancellationDate?: string | Date;
	status: "active" | "pending_cancellation";
	planName: string;
	isFree: boolean;
	onCancel?: () => void;
	history?: boolean;
	hasHistory?: boolean;
};

const isTomorrow = (date: Date): boolean => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	return (
		date.getDate() === tomorrow.getDate() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getFullYear() === tomorrow.getFullYear()
	);
};

export function UserPlanUsage({
	cancellationDate,
	status,
	planName,
	isFree = true,
	onCancel,
	history,
	hasHistory,
}: Props) {
	const { t, i18n } = useTranslation();
	const { openModal } = useUiModalContext();

	const handleOpenLimitsModal = () => openModal(LIMITS_MODAL_ID);
	const handleOpenHistoryModal = () => openModal(HISTORY_MODAL_ID);

	const formattedCancellationDate = new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(cancellationDate ?? Date.now()));
	return (
		<div className={styles.container}>
			<p className={styles.planUsage}>
				{isFree ? (
					<>
						<Trans
							t={t}
							i18nKey={"userPlan.currentPlanFree"}
							components={[<span />]}
						/>
						{history ? (
							hasHistory ? (
								<span
									onClick={handleOpenHistoryModal}
									className={styles.limitsBtn}
								>
									История платежей
								</span>
							) : null
						) : (
							<span
								className={styles.limitsBtn}
								onClick={handleOpenLimitsModal}
							>
								{t("userPlan.limits")}{" "}
								<Icon
									width={24}
									height={24}
									iconName="ArrowRightSm"
								/>
							</span>
						)}
					</>
				) : (
					<>
						{status === "pending_cancellation" ? (
							<span>
								{t("userPlan.currentPlanPending", {
									planName,
									cancellationDate: formattedCancellationDate,
								})}
							</span>
						) : (
							<span>
								{t("userPlan.currentPlanActive", {
									planName,
									cancellationDate: formattedCancellationDate,
								})}
							</span>
						)}
						{history ? (
							hasHistory ? (
								<span
									onClick={handleOpenHistoryModal}
									className={styles.limitsBtn}
								>
									История платежей.
								</span>
							) : null
						) : (
							<span
								className={styles.limitsBtn}
								onClick={handleOpenLimitsModal}
							>
								{status === "active"
									? t("userPlan.nextPayment", {
											cancellationDate:
												formattedCancellationDate,
										})
									: t("userPlan.limits")}
								<Icon
									width={24}
									height={24}
									iconName="ArrowRightSm"
								/>
							</span>
						)}
					</>
				)}
				{status === "active" && onCancel && (
					<span onClick={onCancel} className={styles.cancel}>
						Отменить
					</span>
				)}
			</p>
		</div>
	);
}
