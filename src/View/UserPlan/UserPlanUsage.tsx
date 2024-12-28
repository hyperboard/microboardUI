import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./UserPlanUsage.module.css";

type Props = {
	availableRequests: number;
	aiModel: string;
	tokensUsageResetDate: string | Date;
};

export function UserPlanUsage({
	aiModel,
	availableRequests,
	tokensUsageResetDate,
}: Props) {
	const { t, i18n } = useTranslation();
	const formattedDate = new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(tokensUsageResetDate));

	return (
		<p className={styles.planUsage}>
			<Trans
				t={t}
				i18nKey={"userPlan.currentPlanInfo"}
				values={{
					availableRequests,
					aiModel,
					tokensUsageResetDate: formattedDate,
				}}
				components={[<span />]}
			/>
		</p>
	);
}
