import { OpenAIModels } from "App/Connection";
import { Board } from "Board";
import clsx from "clsx";
import type { Account } from "entities/account";
import { AI_UNAVAILABLE_MODAL_ID } from "features/AiUnavailableModal/AiUnavailableModal";
import { USER_PLAN_MODAL_ID } from "features/UserPlan";
import React, { MouseEventHandler, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useBoundingClientRect } from "shared/lib/useClientRect";
import { useIsPhoneScreen } from "shared/lib/useIsPhoneScreen";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { Icon } from "shared/ui-lib/Icon";
import { Tooltip } from "shared/ui-lib/Tooltip";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { useAIContext } from "./AIContext";
import styles from "./AIInput.module.css";
import { StarIcon } from "./StarIcon";
import { useClickOutside } from "shared/lib/useClickOutside";

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

type ModelCategory = "speech" | "img" | "texts";

const modelTokens: Record<ModelCategory, ModelInfo[]> = {
	speech: [{ id: "tts-1-hd", tokens: 6 }],
	img: [
		{ id: "flux-schnell", tokens: 2 },
		{ id: "flux-pro", tokens: 12 },
	],
	texts: [
		{ id: "gpt-4o", tokens: 4 },
		{ id: "gpt-4o-mini", tokens: 0.3 },
		{ id: "deepseek-reasoner", tokens: 2 },
		{ id: "sonar-deep-research", tokens: 4 },
	],
};

// TODO: Fetch from api?
// const modelTokens: ModelInfo[] = [
// 	{ id: "tts-1-hd", tokens: 6 }, // per 1000 characters
// 	{ id: "gpt-4o", tokens: 4 },
// 	{ id: "gpt-4o-mini", tokens: 0.3 },
// 	{ id: "deepseek-reasoner", tokens: 2 },
// 	{ id: "flux-schnell", tokens: 2 },
// 	{ id: "flux-pro", tokens: 12 },
// ];

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

const getTokenForm = (count: number, t: (key: string) => string): string => {
	const wholePart = Math.floor(count);

	const hasDecimal = count !== wholePart;

	if (wholePart % 100 >= 11 && wholePart % 100 <= 14) {
		return t("userPlan.tokensMany");
	}

	if (hasDecimal) {
		return t("userPlan.tokensFew");
	}

	const lastDigit = wholePart % 10;

	if (lastDigit === 1) {
		return t("userPlan.tokensOne");
	} else if (lastDigit >= 2 && lastDigit <= 4) {
		return t("userPlan.tokensFew");
	} else {
		return t("userPlan.tokensMany");
	}
};

export const AIDropdown = (props: AIDropdownProps): JSX.Element => {
	const { board, isPhoneScreen, account, isDropdownOpen, setIsDropdownOpen } =
		props;
	const { elementRef, rect } = useBoundingClientRect<HTMLDivElement>();
	const { model } = useAIContext();
	const { t } = useTranslation();
	const dropdownContentRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useClickOutside(
		() => setIsDropdownOpen(false),
		[dropdownContentRef],
		true,
	);
	const toggleModelDropdown = (): void => {
		if (!board.aiGeneratingOnItem) {
			setIsDropdownOpen(!isDropdownOpen);
		}
	};

	return (
		<UiPanel zIndex={2} className={clsx(styles.panel)} ref={elementRef}>
			<div
				className={styles.modelSelector}
				onClick={toggleModelDropdown}
				ref={dropdownRef}
			>
				<StarIcon className={styles.starIcon} width={20} height={20} />
				<div className={styles.selectedModel}>
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
			</div>
			{isDropdownOpen &&
				!board.aiGeneratingOnItem &&
				createPortal(
					<div
						className={clsx(styles.dropdownContainer)}
						ref={dropdownContentRef}
					>
						<div
							className={clsx(styles.modelDropdown)}
							style={{
								right: !isPhoneScreen ? rect?.right : "unset",
								left: !isPhoneScreen
									? rect?.right - 300
									: "69px",
							}}
						>
							<Dropdown
								account={account}
								setIsDropdownOpen={setIsDropdownOpen}
							/>
						</div>
					</div>,
					window.document.body,
				)}
		</UiPanel>
	);
};

export const Dropdown = (
	props: Pick<AIDropdownProps, "account" | "setIsDropdownOpen">,
): JSX.Element => {
	const { account, setIsDropdownOpen } = props;
	const { model, setModel } = useAIContext();
	const { openModal } = useUiModalContext();
	const { t } = useTranslation();

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
			{Object.entries(modelTokens).map(([category, models]) => {
				return (
					<div className={styles.categoryWr} key={category}>
						<div className={styles.category}>
							<Icon
								iconName={"Dropdown_" + category}
								width={20}
								height={20}
							/>
							{t(`ai.categories.${category}`)}
						</div>

						{models.map((modelInfo, i) => {
							const id = `${category}_${i}`;
							return (
								<AiRadioBtn
									key={id}
									id={id}
									name={modelInfo.id}
									checked={model === modelInfo.id}
									onChange={
										isModelDisabled(modelInfo.id)
											? handleOpenModal
											: selectModel(modelInfo.id)
									}
									modelInfo={modelInfo}
								/>
							);
						})}
					</div>
				);
			})}
		</>
	);
};

interface AiRadioBtnButtonProps {
	id: string;
	name: string;
	checked: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	modelInfo: ModelInfo;
}

const AiRadioBtn: React.FC<AiRadioBtnButtonProps> = ({
	id,
	name,
	checked,
	onChange,
	modelInfo,
}) => {
	const { t } = useTranslation();
	const isPhoneScreen = useIsPhoneScreen();

	return (
		<label className={styles.customRadio} htmlFor={id}>
			<input
				type="radio"
				id={id}
				name={name}
				checked={checked}
				onChange={onChange}
			/>
			<div className={styles.radioMark}></div>
			<div className={styles.modelText}>
				<h5 className={styles.modelTitle}>
					{isPhoneScreen
						? t(`ai.models.${modelInfo.id}.mobileTitle`)
						: t(`ai.models.${modelInfo.id}.title`)}
				</h5>
				<p className={styles.modelDescription}>
					{t(`ai.models.${modelInfo.id}.description`)}
				</p>
			</div>
			<span className={styles.tokenBadge}>
				<StarIcon
					className={styles.starDropdown}
					width={14}
					height={14}
				/>
				{modelInfo.tokens}
				<Tooltip
					tooltip={
						modelInfo.tokens +
						" " +
						getTokenForm(modelInfo.tokens, t) +
						" " +
						t("models.tokenTooltip")
					}
				/>
			</span>
		</label>
	);
};
