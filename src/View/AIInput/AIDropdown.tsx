import React, { MouseEventHandler, RefObject, useRef } from "react";
import { UiPanel } from "View/Ui/UiPanel";
import { StarIcon } from "./StarIcon";
import clsx from "clsx";
import styles from "./AIInput.module.css";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { OpenAIModels } from "App/Connection";
import { Board } from "Board";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import { Account } from "App/Account";
import { useAIContext } from "./AIContext";
import { USER_PLAN_MODAL_ID } from "View/UserPlan";
import { AI_UNAVAILABLE_MODAL_ID } from "View/AiUnavailableModal/AiUnavailableModal";
import { useUiModalContext } from "View/Ui/UiModal";
import { createPortal } from "react-dom";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "lib/useClickOutside";

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
	"deepseek-reasoner",
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

export const Dropdown = (
	props: Pick<
		AIDropdownProps,
		"account" | "setIsDropdownOpen" | "isPhoneScreen"
	> & {
		isRelativePosition?: boolean;
		relativeBlockRef?: RefObject<HTMLElement>;
	},
): JSX.Element => {
	const {
		account,
		setIsDropdownOpen,
		isPhoneScreen,
		isRelativePosition,
		relativeBlockRef,
	} = props;
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

	const refs: RefObject<HTMLElement>[] = [];
	if (relativeBlockRef) {
		refs.push(relativeBlockRef);
	}

	const dropdownRef = useClickOutside(
		() => setIsDropdownOpen(false),
		refs,
		true,
	);

	return (
		<div
			className={clsx(
				!isRelativePosition && [
					styles.inputContainer,
					styles.dropdownContainer,
				],
				isRelativePosition && styles.relativeDropdown,
			)}
			ref={dropdownRef}
		>
			<div className={clsx(!isRelativePosition && styles.modelDropdown)}>
				{models.map((model, index) => (
					<button
						key={index}
						className={clsx(styles.modelBtn)}
						onClick={
							isModelDisabled(model)
								? handleOpenModal
								: selectModel(model)
						}
					>
						<strong>
							{isPhoneScreen
								? t(`ai.models.${model}.mobileTitle`)
								: t(`ai.models.${model}.title`)}
						</strong>
						<p>{t(`ai.models.${model}.description`)}</p>
						{getDropDownTooltip(model)}
					</button>
				))}
			</div>
		</div>
	);
};
