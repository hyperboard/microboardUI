import React, { MouseEventHandler } from "react";
import { UiPanel } from "View/Ui/UiPanel";
import { StarIcon } from "./StarIcon";
import clsx from "clsx";
import styles from "./AIInput.module.css";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { OpenAIModels } from "App/Connection";
import { Board } from "Board";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import { t } from "i18next";
import { Account } from "App/Account";
import { useAIContext } from "./AIContext";
import { USER_PLAN_MODAL_ID } from "View/UserPlan";
import { AI_UNAVAILABLE_MODAL_ID } from "View/AiUnavailableModal/AiUnavailableModal";
import { useUiModalContext } from "View/Ui/UiModal";
import { createPortal } from "react-dom";

type AIDropdownProps = {
	board: Board;
	isPhoneScreen: boolean;
	account: Account;
	isDropdownOpen: boolean;
	setIsDropdownOpen: (isDropdownOpen: boolean) => void;
};

const models: OpenAIModels[] = [
	"tts-1-hd",
	"image-generation",
	"gpt-4o",
	"gpt-4o-mini",
	"deepseek-chat",
];

const getModelDisplayName = (
	model: OpenAIModels,
	isPhoneScreen: boolean,
): string => {
	if (model === "gpt-4o") {
		return isPhoneScreen ? "4o" : "GPT-4o";
	}
	if (model === "gpt-4o-mini") {
		return isPhoneScreen ? "4o mini" : "GPT-4o mini";
	}
	if (model === "image-generation") {
		return isPhoneScreen ? "flux" : "Flux.1 schnell";
	}
	if (model === "deepseek-chat") {
		return isPhoneScreen ? "deepseek" : "DeepSeek-R1";
	}
	if (model === "tts-1-hd") {
		return isPhoneScreen ? "Text to speech" : "Text to speech HD";
	}
	return model;
};

export const AIDropdown = (props: AIDropdownProps): JSX.Element => {
	const { board, isPhoneScreen, account, isDropdownOpen, setIsDropdownOpen } =
		props;

	const toggleModelDropdown = (): void => {
		if (!board.aiGeneratingOnItem) {
			setIsDropdownOpen(!isDropdownOpen);
		}
	};

	return (
		<UiPanel
			zIndex={2}
			className={clsx(styles.modelSelector, styles.panel)}
		>
			<StarIcon className={styles.starIcon} width={20} height={20} />
			<div className={styles.selectedModel} onClick={toggleModelDropdown}>
				<span>{getModelDisplayName(models[3], isPhoneScreen)}</span>
				<Chevron
					className={clsx(styles.arrow, {
						[styles.activeArrow]: isDropdownOpen,
					})}
				/>
			</div>
			{isDropdownOpen &&
				!board.aiGeneratingOnItem &&
				createPortal(
					<Dropdown
						isPhoneScreen={isPhoneScreen}
						account={account}
						setIsDropdownOpen={setIsDropdownOpen}
					/>,
					window.document.body,
				)}
		</UiPanel>
	);
};

const Dropdown = (
	props: Pick<
		AIDropdownProps,
		"account" | "setIsDropdownOpen" | "isPhoneScreen"
	>,
): JSX.Element => {
	const { account, setIsDropdownOpen, isPhoneScreen } = props;
	const { setModel } = useAIContext();
	const { openModal } = useUiModalContext();

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
		<div className={clsx(styles.inputContainer, styles.dropdownContainer)}>
			<div className={styles.modelDropdown}>
				{models.map((model, index) => (
					<button
						key={index}
						className={clsx(
							styles.modelBtn,
							isModelDisabled(model) && styles.disabled,
						)}
						onClick={
							isModelDisabled(model)
								? handleOpenModal
								: selectModel(model)
						}
					>
						<strong>
							{getModelDisplayName(model, isPhoneScreen)}
						</strong>
						<p>{t(`ai.models.${model}.description`)}</p>
						{getDropDownTooltip(model)}
					</button>
				))}
			</div>
		</div>
	);
};
