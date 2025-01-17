import React, { useEffect, useRef, useState, type SyntheticEvent } from "react";
import styles from "./AIInput.module.css";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";
import { AiChatMsg, OpenAIModels, UserRequest } from "App/Connection";
import { Item } from "Board/Items";
import { useForceUpdate } from "lib/useForceUpdate";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import { UiPanel } from "View/Ui/UiPanel";
import { useAccount } from "App/useAccount";
import { useUiModalContext } from "View/Ui/UiModal";
import { AI_UNAVAILABLE_MODAL_ID } from "View/AiUnavailableModal/AiUnavailableModal";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "lib/useMediaQuery";
import { USER_PLAN_MODAL_ID } from "View/UserPlan";
import { getCorrectEnding } from "utils";
import { getIdeaFromSelection, getTextFromItem } from "View/AIInput/utils";
import { useAIContext } from "View/AIInput/AIContext";

export const AIInput: React.FC = () => {
	const { t } = useTranslation();
	const { app, board } = useAppContext();
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const forceUpdate = useForceUpdate();
	const selectedItemsCount = board.selection.items.list().length;
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const [isShaking, setIsShaking] = useState(false);
	const navigate = useNavigate();
	const isMediaMatches = useMediaQuery("(max-width: 1170px)");
	const {
		stopStream,
		responseNodeId,
		model,
		setModel,
		createNodesWithConnectors,
	} = useAIContext();

	const ideaFromSelection = getIdeaFromSelection(
		board.selection.items.list(),
	);
	const isEditable = board.getInterfaceType() !== "view";

	const isPhoneScreenCheck = () =>
		matchMedia("screen and (max-width: 640px)").matches;
	const [isPhoneScreen, setIsPhoneScreen] = useState(isPhoneScreenCheck);
	useEffect(() => {
		const setScreen = () => {
			setIsPhoneScreen(isPhoneScreenCheck());
		};

		window.addEventListener("resize", setScreen);

		return () => {
			window.removeEventListener("resize", setScreen);
		};
	});

	useAppSubscription({
		subjects: ["selectionItems", "selectionItem", "selection"],
		observer: forceUpdate,
	});

	const handleInputChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		setInputValue(event.target.value);
		event.target.style.height = "auto";
		event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
	};

	useEffect(() => {
		if (!account.billingInfo?.models) {
			return;
		}
		const defaultModel = account.billingInfo?.models.find(
			model => model.isDefault && model.isEnabled,
		);

		// const dm = defaultModel?.id
		// 	.replace(/^gpt-/, "GPT-")
		// 	.replace("-mini", " mini");
		setModel((defaultModel?.id as OpenAIModels) ?? "GPT4o mini");
	}, [account.billingInfo?.models]);

	const handleSendClick = async (ev: SyntheticEvent) => {
		ev.stopPropagation();
		if (!inputValue.trim() && !ideaFromSelection) {
			return;
		}
		if (!account.isLoggedIn) {
			return openModal(AI_UNAVAILABLE_MODAL_ID);
		}
		await account.fetchBillingInfo();
		const currentModel = account.billingInfo?.models.find(
			({ id }) => id === model,
		);

		if (
			!currentModel ||
			((currentModel.limits.daily.remaining ?? 0) <= 0 &&
				(currentModel.limits.weekly.remaining ?? 0) <= 0)
		) {
			setIsShaking(true);
			setTimeout(() => {
				setIsShaking(false);

				if (isMediaMatches) {
					navigate("/user/plan");
				} else {
					openModal(USER_PLAN_MODAL_ID);
				}
			}, 1000);
			return;
		}
		board.isAIGenerating = true;
		await sendInputData();
	};

	const handleInputClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
		event.stopPropagation();
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
		}
		if (isDropdownOpen) {
			setIsDropdownOpen(false);
		}
	};

	const handleKeyDown = async (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		event.stopPropagation();
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			await handleSendClick(event);
		}
	};

	const toggleModelDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const selectModel = (model: OpenAIModels) => {
		setModel(model);
		setIsDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownRef]);

	const sendInputData = async () => {
		const connection = app.getConnection();
		if (!connection) {
			console.error("Ws no open");
			return;
		}

		if (!inputValue.trim().length && !ideaFromSelection) {
			return;
		}

		const nodeWithParents =
			board.selection.getMostNestedAINodeWithParents();

		let idea = inputValue;
		let itemToContinueThread: Item | undefined = nodeWithParents?.node;
		if (idea.trim().length === 0) {
			if (!ideaFromSelection) {
				return;
			}
			idea = ideaFromSelection.idea;
			if (!itemToContinueThread) {
				itemToContinueThread = ideaFromSelection.item;
			}
		}

		const { responseAdded, requestAdded } = createNodesWithConnectors(
			idea,
			itemToContinueThread,
		);

		const parentNodes = nodeWithParents
			? [nodeWithParents.node, ...nodeWithParents.parents]
			: [];

		const selectedItems = board.selection.items.list();

		const boardContext = selectedItems
			.filter(item => item.getId() !== ideaFromSelection?.item.getId())
			.map(item => {
				if (
					item.itemType === "AINode" &&
					parentNodes.length &&
					parentNodes.find(node => node.getId() === item.getId())
				) {
					return "";
				}
				return getTextFromItem(item);
			})
			.filter(text => text !== "");

		const contextRequest = nodeWithParents
			? {
					range: 5,
					messageId: nodeWithParents.node.getId(),
				}
			: undefined;

		const message: AiChatMsg<UserRequest> = {
			type: "AiChat",
			boardId: board.getBoardId(),
			event: {
				method: "UserRequest",
				context: [],
				boardContext,
				idea,
				model,
				itemId: responseAdded.getId(),
				requestItemId: requestAdded.getId(),
				contextRequest,
			},
		};

		connection.wsClient.send(message);

		setInputValue("");

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}

		const mbrToFit = responseAdded.getMbr().combine(requestAdded.getMbr());
		board.camera.zoomToFit(mbrToFit, (600 / mbrToFit.getWidth()) * 30);
	};

	const handleStopClick = async () => {
		const boardId = board.getBoardId();

		if (responseNodeId) {
			await stopStream(boardId, responseNodeId, account);
			board.isAIGenerating = false;
		}
	};

	const getModelDisplayName = (model: string): string => {
		if (model === "gpt-4o") {
			return isPhoneScreen ? "4o" : "GPT-4o";
		}
		if (model === "gpt-4o-mini") {
			return isPhoneScreen ? "4o mini" : "GPT-4o mini";
		}
		return model;
	};

	return (
		<UiPanel
			padding={0}
			className={clsx(styles.inputContainer, isShaking && styles.shake)}
			zIndex={2}
			ref={dropdownRef}
		>
			<div className={styles.contentWrapper}>
				<div className={styles.modelSelector}>
					<div
						className={styles.selectedModel}
						onClick={toggleModelDropdown}
					>
						<span>{getModelDisplayName(model)}</span>
						<Chevron
							className={clsx(
								isDropdownOpen ? styles.activeArrow : "",
								styles.arrow,
							)}
						/>
					</div>
					<StarIcon
						className={styles.starIcon}
						width={20}
						height={20}
					/>
					{isDropdownOpen && (
						<div className={styles.modelDropdown}>
							<button
								disabled={
									!account.billingInfo?.models.find(
										model =>
											model.id === "gpt-4o-mini" &&
											model.isEnabled,
									)
								}
								className={styles.modelBtn}
								onClick={() => selectModel("gpt-4o-mini")}
							>
								<strong>GPT-4o mini</strong>
								<p>{t("ai.models.gpt-4o-mini.description")}</p>
							</button>
							<button
								disabled={
									!account.billingInfo?.models.find(
										model =>
											model.id === "gpt-4o" &&
											model.isEnabled,
									)
								}
								className={styles.modelBtn}
								onClick={() => selectModel("gpt-4o")}
							>
								<strong>GPT-4o</strong>
								<p>{t("ai.models.gpt-4o.description")}</p>
							</button>
						</div>
					)}
				</div>
				<textarea
					value={inputValue}
					onClick={event => handleInputClick(event)}
					onPaste={event => event.stopPropagation()}
					onKeyDown={event => handleKeyDown(event)}
					onFocus={event => event.currentTarget.select()}
					onChange={event => handleInputChange(event)}
					placeholder={
						isPhoneScreen
							? t("AIInput.selectMobileContext")
							: t("AIInput.selectContext")
					}
					className={styles.aiInput}
					ref={inputRef}
					rows={1}
					disabled={!isEditable}
					title={!isEditable ? t("AIInput.disable") : ""}
				/>
				<div
					className={clsx(
						styles.selectionInfo,
						selectedItemsCount && styles.activeSelection,
					)}
				>
					{t(
						`AIInput.selectedItems.${getCorrectEnding(selectedItemsCount)}`,
						{ count: selectedItemsCount },
					)}
				</div>
				<button
					onClick={
						board.isAIGenerating ? handleStopClick : handleSendClick
					}
					className={styles.sendButton}
					disabled={!isEditable}
				>
					<Icon
						width={20}
						height={20}
						iconName={
							board.isAIGenerating ? "StopAiGeneration" : "Vector"
						}
						className={clsx(
							styles.icon,
							(inputValue.trim() || ideaFromSelection) &&
								styles.activeIcon,
						)}
					/>
				</button>
			</div>
		</UiPanel>
	);
};
