import React, { useState } from "react";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { Icon, IconId } from "shared/ui-lib/Icon/Icon";
import { Button } from "shared/ui-lib/Button/Button";
import styles from "./MouseOrTracpadModal.module.css";
import clsx from "clsx";
import { useAppContext } from "features/AppContext";
import { useUiModalContext } from "shared/ui-lib/UiModal/UiModalContext";
import { useTranslation } from "react-i18next";

export const MOUSE_OR_TRACKPAD_MODAL = Symbol("mouseOrTrackpadModal");

const modes = ["mouse", "trackpad", "auto"] as const;

export const MouseOrTrackpadModal = () => {
	const { app } = useAppContext();
	const [selectedMode, setSelectedMode] = useState<
		"auto" | "mouse" | "trackpad"
	>(app.getSettings().controlMode);
	const { closeModal } = useUiModalContext();
	const { t } = useTranslation();

	const mouseCards: CardProps[] = [
		{
			iconName: "MouseRightClick",
			text: t("boardMenu.controlMode.modal.MouseRightClick"),
		},
		{
			iconName: "MouseRollClick",
			text: t("boardMenu.controlMode.modal.MouseRollClick"),
		},
	];

	const trackpadCards: CardProps[] = [
		{
			iconName: "TrackpadMove",
			text: t("boardMenu.controlMode.modal.TrackpadMove"),
		},
		{
			iconName: "TrackpadPinch",
			text: t("boardMenu.controlMode.modal.TrackpadPinch"),
			style: { transform: "translateY(-10px)" },
		},
	];

	const getCardsArray = () => {
		if (selectedMode === "mouse") {
			return mouseCards;
		} else if (selectedMode === "trackpad") {
			return trackpadCards;
		} else {
			return [...mouseCards, ...trackpadCards];
		}
	};

	const setControlMode = () => {
		app.setControlMode(selectedMode);
		closeModal();
	};

	return (
		<UiModal
			modalId={MOUSE_OR_TRACKPAD_MODAL}
			closeByBgClick={true}
			closeOnClickOutside={true}
		>
			<div className={styles.wrapper}>
				<h2 className={styles.title}>
					{t("boardMenu.controlMode.modal.title")}
				</h2>
				<p className={styles.subtitle}>
					{t("boardMenu.controlMode.modal.subtitle")}
				</p>
				<div className={styles.selectorPanel}>
					<div
						className={clsx(
							styles.selector,
							selectedMode === "mouse" && styles.selected,
						)}
						onClick={() => setSelectedMode("mouse")}
					>
						{t("boardMenu.controlMode.mouse")}
					</div>
					<div
						className={clsx(
							styles.selector,
							selectedMode === "trackpad" && styles.selected,
						)}
						onClick={() => setSelectedMode("trackpad")}
					>
						{t("boardMenu.controlMode.trackpad")}
					</div>
					<div
						className={clsx(
							styles.selector,
							selectedMode === "auto" && styles.selected,
						)}
						onClick={() => setSelectedMode("auto")}
					>
						{t("boardMenu.controlMode.auto")}
					</div>
					<div
						className={styles.movingBar}
						style={{
							left: `${modes.indexOf(selectedMode) * 138}px`,
						}}
					></div>
				</div>
				<div className={styles.cardsGrid}>
					{getCardsArray().map(card => (
						<Card
							key={card.iconName}
							iconName={card.iconName}
							text={card.text}
							style={card.style}
						/>
					))}
				</div>
				<Button onClick={setControlMode}>{t("common.save")}</Button>
			</div>
		</UiModal>
	);
};

interface CardProps {
	iconName: IconId;
	text: string;
	style?: React.CSSProperties;
}

const Card = ({ iconName, style, text }: CardProps) => {
	return (
		<div className={styles.card} style={style}>
			<Icon iconName={iconName} width={99} height={61} />
			<p>{text}</p>
		</div>
	);
};
