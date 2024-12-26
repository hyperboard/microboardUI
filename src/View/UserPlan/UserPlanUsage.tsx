import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./UserPlanUsage.module.css";

type Props = {
	availableRequests: number;
	aiModel: string;
	subscriptionEndDate: string | Date;
};

export function UserPlanUsage({
	aiModel,
	availableRequests,
	subscriptionEndDate,
}: Props) {
	const { t, i18n } = useTranslation();
	const formattedDate = new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(subscriptionEndDate));

	return (
		<p className={styles.planUsage}>
			<Trans
				t={t}
				i18nKey={"userPlan.currentPlanInfo"}
				values={{
					availableRequests,
					aiModel,
					subscriptionEndDate: formattedDate,
				}}
				components={[<span />]}
			/>
		</p>
	);
}
