import React, { useRef, useState } from "react";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { Icon } from "View/Icon/Icon";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import styles from "./CommentsPanel.module.css";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "View/UserPanel/Buttons/ButtonWithMenu/ButtonWithMenu";
import clsx from "clsx";
import { ToggleMark } from "View/UserPanel/CommentsPanel/ToggleMark";
import { useCommentsContext } from "View/CommentsProvider";
import { useAppContext } from "View/AppContext";
import { CommentCard } from "View/UserPanel/CommentsPanel/CommentCard/CommentCard";
import { useForceUpdate } from "lib/useForceUpdate";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useClickOutside } from "lib/useClickOutside";
import { useCommentsPanelContext } from "View/UserPanel/CommentsPanel/CommentsPanelContext";
import { useAccount } from "App/useAccount";

export const CommentsPanel: React.FC = () => {
	const [isOptionsPanelOpen, setIsOptionsPanelOpen] = useState(false);
	const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
	const [showCommentsFilter, setShowCommentsFilter] = useState<
		"all" | "replies"
	>("all");
	const { t } = useTranslation();
	const {
		showResolved,
		setShowResolved,
		showComments,
		setShowComments,
		enableClusters,
		setEnableClusters,
	} = useCommentsContext();
	const { setIsPanelOpen, isPanelOpen } = useCommentsPanelContext();
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();
	const optionsPanelRef = useRef<HTMLDivElement>(null);
	const filtersPanelRef = useRef<HTMLDivElement>(null);
	const account = useAccount();
	useAppSubscription({
		subjects: ["items"],
		observer: () => {
			forceUpdate();
		},
	});

	const username = account.info?.name || account.info?.email;

	const closePanels = () => {
		setIsOptionsPanelOpen(false);
		setIsFiltersPanelOpen(false);
	};

	const clickOutsideRef = useClickOutside(closePanels, [
		optionsPanelRef,
		filtersPanelRef,
	]);

	const comments = board.items.getComments().filter(comment => {
		if (!comment.getThread().length) {
			return false;
		}
		if (showCommentsFilter === "replies") {
			return !!comment.getUnreadMessages(username);
		}
		return true;
	});

	const markAllCommentsAsRead = () => {
		if (!username) {
			return;
		}
		comments.forEach(comment => {
			const unreadMessages = comment.getUnreadMessages(username);
			if (unreadMessages) {
				comment.markMessagesAsRead(
					unreadMessages.map(mes => mes.id),
					username,
				);
			}
		});
		setIsOptionsPanelOpen(false);
	};

	const handleFiltersBtnClick = () => {
		setIsFiltersPanelOpen(!isFiltersPanelOpen);
		setIsOptionsPanelOpen(false);
	};

	const handleOptionsBtnClick = () => {
		setIsFiltersPanelOpen(false);
		setIsOptionsPanelOpen(!isOptionsPanelOpen);
	};

	const handleShowCommentsFilterClick = (filter: "all" | "replies") => {
		setShowCommentsFilter(filter);
		setIsFiltersPanelOpen(false);
	};

	const toggleShowResolved = () => {
		setShowResolved(!showResolved);
		setIsFiltersPanelOpen(false);
	};

	const toggleShowComments = () => {
		setShowComments(!showComments);
		setIsOptionsPanelOpen(false);
	};

	const toggleEnableClusters = () => {
		setEnableClusters(!enableClusters);
		setIsOptionsPanelOpen(false);
	};

	const canViewResolvedComments: boolean =
		account.permissions.checkPermissions(
			"owns",
			"boards",
			board.getBoardId(),
		);

	if (board.getBoardId() === "blank") {
		return null;
	}
	return (
		<UiPanel
			style={isPanelOpen ? { padding: "0 4px" } : { padding: "0" }}
			className={clsx(styles.panel, isPanelOpen && styles.open)}
			vertical={true}
			zIndex={5}
		>
			<div className={styles.header}>
				<h3 className={styles.title}>{t("comment.panel.title")}</h3>
				<UiButton
					onClick={() => setIsPanelOpen(false)}
					variant="secondary"
					className={styles.close}
				>
					<Icon iconName="modalCross" width={12} height={12} />
				</UiButton>
			</div>
			<div className={styles.controls}>
				<ButtonWithMenu
					ref={filtersPanelRef}
					button={
						<button
							id={"comments-filters"}
							onClick={handleFiltersBtnClick}
							className={clsx(styles.btn, styles.filtersBtn)}
						>
							{t(
								`comment.panel.showComments.${showCommentsFilter}`,
							)}
							<Icon
								iconName={
									isFiltersPanelOpen
										? "StrokeChevronUp"
										: "StrokeChevronDown"
								}
								width={14}
								height={14}
							/>
						</button>
					}
					isOpen={isFiltersPanelOpen}
				>
					<div className={styles.optionsContainer}>
						<button
							onClick={() => handleShowCommentsFilterClick("all")}
							className={clsx(
								styles.btn,
								showCommentsFilter === "all" && styles.active,
							)}
						>
							{t("comment.panel.showComments.all")}
						</button>
						<button
							onClick={() =>
								handleShowCommentsFilterClick("replies")
							}
							className={clsx(
								styles.btn,
								showCommentsFilter === "replies" &&
									styles.active,
							)}
						>
							{t("comment.panel.showComments.replies")}
						</button>
						{canViewResolvedComments && (
							<>
								<div className={styles.separator}></div>
								<button
									onClick={toggleShowResolved}
									className={styles.btn}
								>
									{t("comment.panel.showResolved")}
									<ToggleMark isActive={showResolved} />
								</button>
							</>
						)}
					</div>
				</ButtonWithMenu>
				<ButtonWithMenu
					ref={optionsPanelRef}
					button={
						<UiButton
							id={"comments-options"}
							onClick={handleOptionsBtnClick}
							active={isOptionsPanelOpen}
							variant="secondary"
							size="sm"
							style={{ padding: 0 }}
						>
							<Icon
								iconName="GearStroke"
								width={16}
								height={16}
							/>
						</UiButton>
					}
					isOpen={isOptionsPanelOpen}
				>
					<div
						className={clsx(
							styles.optionsContainer,
							styles.optionsPanel,
						)}
					>
						<button
							onClick={toggleShowComments}
							className={styles.btn}
						>
							{t("comment.panel.showCommentsOnBoard")}
							<ToggleMark isActive={showComments} />
						</button>
						<button
							onClick={toggleEnableClusters}
							className={styles.btn}
						>
							{t("comment.panel.groupComments")}
							<ToggleMark isActive={enableClusters} />
						</button>
						<button
							onClick={markAllCommentsAsRead}
							className={styles.btn}
						>
							<div className={styles.flex}>
								<Icon
									iconName="MarkAsReadComment"
									width={20}
									height={20}
								/>
								{t("comment.panel.markAllAsRead")}
							</div>
						</button>
					</div>
				</ButtonWithMenu>
			</div>
			<div className={styles.scrollContainer}>
				{comments.length ? (
					<div className={styles.cards}>
						{comments.map(comment => (
							<CommentCard
								key={comment.getId()}
								comment={comment}
							/>
						))}
					</div>
				) : (
					<p className={styles.noComments}>
						You have no unread messages
					</p>
				)}
			</div>
			<div ref={clickOutsideRef}></div>
		</UiPanel>
	);
};
