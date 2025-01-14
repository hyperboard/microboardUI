import React, { type MouseEventHandler } from "react";
import styles from "./PlanCard.module.css";
import clsx from "clsx";
import { UiSeparator } from "View/Ui/UiSeparator";
import { Icon } from "View/Icon";
import { Button } from "shared/ui-lib/Button";
import { useTranslation } from "react-i18next";

export type PlanState = "current" | "downgrade" | "available";

const rubToUsd = (price: number) => price / 10000;

type Props = {
	variant?: "basic" | "pro" | "plus";
	state?: PlanState;
	contact?: boolean;
	unlimited?: boolean;
	name: string;
	price?: string | number;
	description?: string;
	features: string[];
	onDowngrade?: MouseEventHandler;
	onSubscribe?: MouseEventHandler;
};

export function PlanCard({
	variant = "basic",
	state = "available",
	contact,
	unlimited,
	name,
	price = 0,
	description,
	features,
	onDowngrade,
	onSubscribe,
}: Props) {
	const { t } = useTranslation();

	const getButtonLabel = () => {
		switch (state) {
			case "available":
				return contact
					? t("userPlan.subscribe.contact")
					: t("userPlan.subscribe.getPlan", { plan: name });
			case "current":
				return t("userPlan.subscribe.current");
			case "downgrade":
				return t("userPlan.subscribe.downgrade");
		}
	};

	const handleMailTo = () => {
		const elem = document.createElement("a");
		elem.href = "mailto:ceo@microboard.io";
		elem.target = "_blank";
		elem.click();
	};

	const getHandler = () => {
		if (state === "available" && contact) {
			return handleMailTo;
		}

		if (state === "available" && !contact) {
			return onSubscribe;
		}

		if (state === "downgrade") {
			return onDowngrade;
		}
	};

	return (
		<div
			className={clsx(
				styles.card,
				styles[variant],
				state === "current" && styles.current,
			)}
		>
			<div className={styles.heading}>
				<div className={styles.top}>
					<h3 className={styles.name}>{name}</h3>
					{unlimited && (
						<div className={styles.unlimited}>
							<span>{t("userPlan.unlimited")}</span>
							<Icon iconName="ai" width={16} height={16} />
						</div>
					)}
				</div>
				<div className={styles.price}>
					{typeof price === "string" ? (
						price
					) : (
						<p className={styles.priceWrapper}>
							<span>$</span>
							<span className={styles.priceValue}>
								{rubToUsd(price)}
							</span>
							<span
								className={clsx(styles.slash, styles.perMonth)}
							>
								/
							</span>
							<span className={styles.perMonth}>
								{t("userPlan.perMonth")}
							</span>
						</p>
					)}
				</div>
				{description && (
					<div className={styles.models}>{description}</div>
				)}
			</div>
			<UiSeparator />
			<ul className={styles.features}>
				{features.map(feature => (
					<li className={styles.feature} key={feature}>
						<Icon
							className={styles.markIcon}
							width={24}
							height={24}
							iconName="checkMark"
						/>
						<span>{feature}</span>
					</li>
				))}
			</ul>
			<UiSeparator />
			<Button
				onClick={getHandler()}
				className={styles.button}
				disabled={state === "current"}
				pattern={state === "downgrade" ? "tertiary" : "primary"}
			>
				{getButtonLabel()}
			</Button>
		</div>
	);
}
