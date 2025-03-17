import { OpenAIModels } from "App/Connection";
import { Board } from "Board";
import clsx from "clsx";
import type { Account } from "entities/account";
import { AI_UNAVAILABLE_MODAL_ID } from "features/AiUnavailableModal/AiUnavailableModal";
import { USER_PLAN_MODAL_ID } from "features/UserPlan";
import React, { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "shared/lib/useClickOutside";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { Tooltip } from "shared/ui-lib/Tooltip";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useAIContext } from "./AIContext";
import styles from "./AIInput.module.css";
import { StarIcon } from "./StarIcon";

type AIDropdownProps = {
	board: Board;
	isPhoneScreen: boolean;
	account: Account;
	isDropdownOpen: boolean;
	setIsDropdownOpen: (isDropdownOpen: boolean) => void;
};

type ModelInfo = {
	id: OpenAIModels;
	tokens: number;
};

// TODO: Fetch from api?
const modelTokens: ModelInfo[] = [
	{ id: "tts-1-hd", tokens: 6 }, // per 1000 characters
	{ id: "gpt-4o", tokens: 4 },
	{ id: "gpt-4o-mini", tokens: 0.3 },
	{ id: "deepseek-reasoner", tokens: 2 },
	{ id: "flux-schnell", tokens: 2 },
	{ id: "flux-pro", tokens: 12 },
];

// const getModelDisplayName = (
// 	model: OpenAIModels,
// 	isPhoneScreen: boolean,
// ): string => {
// 	switch (model) {
// 		case "gpt-4o":
// 			return "GPT-4o";
// 		case "gpt-4o-mini":
// 			return "GPT-4o mini";
// 		case "image-generation":
// 			return "Flux.1 schnell";
// 		case "deepseek-reasoner":
// 			return "DeepSeek-R1";
// 		case "tts-1-hd":
// 			return isPhoneScreen ? "TTS" : "Text to speech HD";
// 		default:
// 			return model;
// 	}
// };

export const AIDropdown = (props: AIDropdownProps): JSX.Element => {
	const { board, isPhoneScreen, account, isDropdownOpen, setIsDropdownOpen } =
		props;
	const { model } = useAIContext();
	const { t } = useTranslation();
	const dropdownRef = useClickOutside(
		() => setIsDropdownOpen(false),
		[],
		true,
	);
	const toggleModelDropdown = (): void => {
		if (!board.aiGeneratingOnItem) {
			setIsDropdownOpen(!isDropdownOpen);
		}
	};

	return (
		<UiPanel
			zIndex={2}
			className={clsx(styles.modelSelector, styles.panel)}
			ref={dropdownRef}
		>
			<StarIcon className={styles.starIcon} width={20} height={20} />
			<div className={styles.selectedModel} onClick={toggleModelDropdown}>
				<span>
					{" "}
					{isPhoneScreen
						? t(`ai.models.${model}.mobileTitle`)
						: t(`ai.models.${model}.title`)}
				</span>
				<Chevron
					className={clsx(styles.arrow, {
						[styles.activeArrow]: isDropdownOpen,
					})}
				/>
			</div>
			{isDropdownOpen && !board.aiGeneratingOnItem && (
				<div className={clsx([styles.dropdownContainer])}>
					<div className={clsx(styles.modelDropdown)}>
						<Dropdown
							isPhoneScreen={isPhoneScreen}
							account={account}
							setIsDropdownOpen={setIsDropdownOpen}
						/>
					</div>
				</div>
			)}
		</UiPanel>
	);
};

export const Dropdown = (
	props: Pick<
		AIDropdownProps,
		"account" | "setIsDropdownOpen" | "isPhoneScreen"
	>,
) => {
	const { account, setIsDropdownOpen, isPhoneScreen } = props;
	const { setModel } = useAIContext();
	const { openModal } = useUiModalContext();
	const { t } = useTranslation();

	const getDropDownTooltip = (model: OpenAIModels): boolean | JSX.Element => {
		const dropdownTooltip = account.isLoggedIn
			? t("userPlan.upgradeTooltip")
			: t("AIInput.authTooltip");
		return isModelDisabled(model) && <Tooltip tooltip={dropdownTooltip} />;
	};

	const isModelDisabled = (model: OpenAIModels): boolean =>
		!account.billingInfo?.models.find(
			item => item.id === model && item.isEnabled,
		);
	const selectModel = (model: OpenAIModels) => (): void => {
		setModel(model);
		setIsDropdownOpen(false);
	};

	const handleOpenModal: MouseEventHandler = evt => {
		evt.preventDefault();
		evt.stopPropagation();
		setIsDropdownOpen(false);
		if (account.isLoggedIn) {
			openModal(USER_PLAN_MODAL_ID);
		} else {
			openModal(AI_UNAVAILABLE_MODAL_ID);
		}
	};

	return (
		<>
			{modelTokens.map((modelInfo, index) => (
				<button
					key={index}
					className={clsx(styles.modelBtn)}
					onClick={
						isModelDisabled(modelInfo.id)
							? handleOpenModal
							: selectModel(modelInfo.id)
					}
				>
					<div className={styles.modelBtnHeader}>
						<strong>
							{isPhoneScreen
								? t(`ai.models.${modelInfo.id}.mobileTitle`)
								: t(`ai.models.${modelInfo.id}.title`)}
						</strong>
						<span className={styles.tokenBadge}>
							{modelInfo.tokens} {t("userPlan.tokens")}
						</span>
					</div>
					<p>{t(`ai.models.${modelInfo.id}.description`)}</p>
					{getDropDownTooltip(modelInfo.id)}
				</button>
			))}
		</>
	);
};
