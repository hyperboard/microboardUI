import React, {
	useEffect,
	useRef,
	useState,
	type MouseEventHandler,
	type SyntheticEvent,
} from "react";
import styles from "./AIInput.module.css";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { StarIcon } from "./StarIcon";
import {
	AiChatMsg,
	GenerateImageRequest,
	OpenAIModels,
	UserRequest,
} from "App/Connection";
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
import {
	getIdeaFromSelection,
	getTextFromItem,
	PossibleParentNode,
} from "View/AIInput/utils";
import { useAIContext } from "View/AIInput/AIContext";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import { SessionStorage } from "App/SessionStorage";

const sessionStorage = new SessionStorage();

export const AIInput = () => {
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

		const lastRequest = sessionStorage.getLastAIRequest();
		if (lastRequest) {
			setInputValue(lastRequest);
		}
		return () => {
			window.removeEventListener("resize", setScreen);
		};
	}, []);

	useAppSubscription({
		subjects: ["selectionItems", "selectionItem", "selection"],
		observer: forceUpdate,
	});

	const handleInputChange = (
		event: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		setInputValue(event.target.value);
		sessionStorage.setLastAIRequest(event.target.value);
		event.target.style.height = "auto";
		event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
	};

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
			(currentModel.limits.daily.remaining !== null &&
				currentModel.limits.daily.remaining <= 0) ||
			(currentModel.limits.weekly.remaining !== null &&
				currentModel.limits.weekly.remaining <= 0)
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
		board.AIGeneratingOnItem = responseNodeId;
		sessionStorage.removeLastAIRequest();
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

	const toggleModelDropdown = (): void => {
		if (!board.AIGeneratingOnItem) {
			setIsDropdownOpen(!isDropdownOpen);
		}
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
		let itemToContinueThread: PossibleParentNode | undefined =
			nodeWithParents?.node;
		let isIdeaFromSelection = false;
		if (idea.trim().length === 0) {
			if (!ideaFromSelection) {
				return;
			}
			idea = ideaFromSelection.idea;
			isIdeaFromSelection = true;
			if (!itemToContinueThread) {
				itemToContinueThread = ideaFromSelection.item;
			}
		}

		const { responseAdded, requestAdded } = createNodesWithConnectors(
			idea,
			itemToContinueThread,
			!isIdeaFromSelection,
		);

		board.AIGeneratingOnItem = responseAdded.getId();

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

		if (model !== "image-generation") {
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
		} else {
			const options = {
				model: "flux-schnell",
				aspect_ratio: "1:1",
			};

			const message: AiChatMsg<GenerateImageRequest> = {
				type: "AiChat",
				boardId: board.getBoardId(),
				event: {
					method: "GenerateImage",
					prompt: idea,
					itemId: responseAdded.getId(),
					options,
				},
			};

			connection.wsClient.send(message);
		}

		setInputValue("");

		if (inputRef.current) {
			inputRef.current.style.height = "auto";
		}

		const itemsInView = board.items.getInView();
		const isAiNodesInView = itemsInView.some(
			item => item.getId() === responseAdded.getId(),
		);

		if (!isAiNodesInView) {
			const mbrToFit = responseAdded
				.getMbr()
				.combine(requestAdded.getMbr());
			board.camera.zoomToFit(mbrToFit, (600 / mbrToFit.getWidth()) * 30);
		}
	};

	const handleStopClick = async () => {
		const boardId = app.getBoard().getBoardId();

		if (responseNodeId) {
			await stopStream(boardId, responseNodeId, account);
			board.AIGeneratingOnItem = undefined;
		}
	};

	const getModelDisplayName = (model: string): string => {
		if (model === "gpt-4o") {
			return isPhoneScreen ? "4o" : "GPT-4o";
		}
		if (model === "gpt-4o-mini") {
			return isPhoneScreen ? "4o mini" : "GPT-4o mini";
		}
		if (model == "image-generation") {
			return isPhoneScreen ? "flux" : "Flux.1 schnell";
		}
		return model;
	};

	const getInputPlaceholder = (): string => {
		if (!!board.AIGeneratingOnItem) {
			return t("AIInput.disableWhenGenerating");
		}

		if (isPhoneScreen) {
			return t("AIInput.selectMobileContext");
		}

		return t("AIInput.selectContext");
	};

	const isModelDisabled = (model: OpenAIModels) =>
		!account.billingInfo?.models.find(
			item => item.id === model && item.isEnabled,
		);

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

	const boardId = board.getBoardId();
	if (!boardId || boardId === "blank") {
		return null;
	}

	return (
		<UiPanel
			padding={0}
			className={clsx(styles.inputContainer, isShaking && styles.shake)}
			zIndex={2}
			ref={dropdownRef}
		>
			{!isEditable && (
				<Tooltip
					tooltip={t("AIInput.disable")}
					tooltipPosition="top-center-fixed"
					tooltipAlign="left"
					className={styles.tooltip}
				/>
			)}
			<div
				className={clsx(styles.contentWrapper, {
					[styles.disabled]: !!board.AIGeneratingOnItem,
				})}
			>
				<div className={styles.modelSelector}>
					<div
						className={styles.selectedModel}
						onClick={toggleModelDropdown}
					>
						<span>{getModelDisplayName(model)}</span>
						<Chevron
							className={clsx(styles.arrow, {
								[styles.activeArrow]: isDropdownOpen,
							})}
						/>
					</div>
					<StarIcon
						className={styles.starIcon}
						width={20}
						height={20}
					/>
					{isDropdownOpen && !board.AIGeneratingOnItem && (
						<div className={styles.modelDropdown}>
							<button
								className={clsx(
									styles.modelBtn,
									isModelDisabled("gpt-4o-mini") &&
										styles.disabled,
								)}
								onClick={
									isModelDisabled("gpt-4o-mini")
										? handleOpenModal
										: () => selectModel("gpt-4o-mini")
								}
							>
								<strong>GPT-4o mini</strong>
								<p>{t("ai.models.gpt-4o-mini.description")}</p>
								{isModelDisabled("gpt-4o-mini") && (
									<Tooltip
										tooltip={t("userPlan.upgradeTooltip")}
									/>
								)}
							</button>
							<button
								className={clsx(
									styles.modelBtn,
									isModelDisabled("gpt-4o") &&
										styles.disabled,
								)}
								onClick={
									isModelDisabled("gpt-4o")
										? handleOpenModal
										: () => selectModel("gpt-4o")
								}
							>
								<strong>GPT-4o</strong>
								<p>{t("ai.models.gpt-4o.description")}</p>
								{isModelDisabled("gpt-4o") && (
									<Tooltip
										tooltip={t("userPlan.upgradeTooltip")}
									/>
								)}
							</button>
							<button
								className={clsx(
									styles.modelBtn,
									isModelDisabled("image-generation") &&
										styles.disabled,
								)}
								onClick={
									isModelDisabled("image-generation")
										? handleOpenModal
										: () => selectModel("image-generation")
								}
							>
								<strong>Flux.1 schnell</strong>
								<p>{t("ai.models.flux-schnell.description")}</p>
								{isModelDisabled("image-generation") && (
									<Tooltip
										tooltip={t("userPlan.upgradeTooltip")}
									/>
								)}
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
					placeholder={getInputPlaceholder()}
					className={styles.aiInput}
					ref={inputRef}
					rows={1}
					disabled={!!board.AIGeneratingOnItem}
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
						!!board.AIGeneratingOnItem
							? handleStopClick
							: handleSendClick
					}
					className={styles.sendButton}
				>
					<Icon
						width={20}
						height={20}
						iconName={
							!!board.AIGeneratingOnItem
								? "StopAiGeneration"
								: "Vector"
						}
						className={clsx(styles.icon, {
							[styles.activeIcon]:
								inputValue.trim() ||
								ideaFromSelection ||
								!!board.AIGeneratingOnItem,
						})}
					/>
				</button>
			</div>
		</UiPanel>
	);
};
