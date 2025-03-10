import React, { forwardRef, useEffect, useRef, useState } from "react";
import { UiPanel } from "../../../shared/ui-lib/UiPanel/index.ts";
import styles from "./ThreadPanel.module.css";
import { Icon } from "../../../shared/ui-lib/Icon/index.ts";
import { Button } from "shared/ui-lib/Button/Button";
import { Comment } from "Board/Items/Comment/Comment";
import { Message } from "./message/Message.tsx";
import clsx from "clsx";
import { CommentInput } from "../CommentInput/CommentInput.tsx";
import { useAppContext } from "features/AppContext.tsx";
import { Mbr } from "Board/Items/Mbr/Mbr";
import { ExtraOptions } from "./ExtraOptions/ExtraOptions.tsx";
import { OptionsPanel } from "./OptionsPanel/OptionsPanel.tsx";
import { useCommentsContext } from "../CommentsContext.tsx";
import { useTranslation } from "react-i18next";
import { useIntersectionObserver } from "entities/comments/useIntersectionObserver.ts";
import { Avatar } from "features/UserPanel/Avatar/Avatar.tsx";
import { useAccount } from "App/useAccount.ts";
import { useClickOutside } from "shared/lib/useClickOutside.ts";
import { useScrollToUnreadMessage } from "entities/comments/useScrollToUnreadMessage.ts";
import { UiButton } from "shared/ui-lib/UiButton/UiButton.tsx";
import { UiSeparator } from "shared/ui-lib/UiSeparator/UiSeparator.tsx";

interface MessageOptionsData {
	top: number;
	left: number;
	messageId: string;
}

interface Props {
	comment: Comment;
	mbr: Mbr;
}

export const ThreadPanel = forwardRef<HTMLDivElement, Props>(
	({ comment, mbr }: Props, ref) => {
		const [value, setValue] = useState("");
		const { board } = useAppContext();
		const [messageOptionsData, setMessageOptionsData] =
			useState<null | MessageOptionsData>(null);
		const refs = useRef<Record<string, HTMLDivElement>>({});
		const messageOptionsRef = useRef<HTMLDivElement>(null);
		const [textUnderEditorId, setTextUnderEditorId] = useState<
			undefined | string
		>(undefined);
		const {
			setOpenedThreadId,
			setTargetMessageId,
			targetMessageId,
			openedThreadId,
		} = useCommentsContext();
		const account = useAccount();
		const openedThreadIdRef = useRef<string | undefined>(openedThreadId);
		openedThreadIdRef.current = openedThreadId;

		const threadRef = useClickOutside(
			() => setOpenedThreadId(undefined),
			[messageOptionsRef],
			true,
		);

		const { t } = useTranslation();
		const accountInfo = account.info;
		const userId = accountInfo?.id;
		const unreadMessages = comment.getUnreadMessages(userId);

		useIntersectionObserver({
			comment,
			refs,
			userId,
			deps: [unreadMessages && unreadMessages.length],
		});
		useScrollToUnreadMessage({ unreadMessages, refs });

		const canRemove =
			comment.getThread()[0].id !== messageOptionsData?.messageId;
		const handleRemoveMessage = (id?: string): void => {
			if (!messageOptionsData && !id) {
				return;
			}
			if (messageOptionsData) {
				comment.removeMessage(messageOptionsData.messageId);
			} else if (id) {
				comment.removeMessage(id);
			}
			setMessageOptionsData(null);
		};

		const handleSetEditor = (): void => {
			if (!messageOptionsData) {
				return;
			}
			setTextUnderEditorId(messageOptionsData?.messageId);
			setMessageOptionsData(null);
		};

		const setRef = (id: string) => (el: HTMLDivElement) => {
			refs.current[id] = el;
		};

		const handleMessageOptionsClick = (messageId: string): void => {
			if (
				messageOptionsData &&
				messageId === messageOptionsData.messageId
			) {
				return setMessageOptionsData(null);
			}
			const { left, top } =
				refs.current[messageId].getBoundingClientRect();
			setMessageOptionsData({
				messageId,
				left: left - mbr.left,
				top: top - mbr.top + 26,
			});
		};

		useEffect(() => {
			if (userId && comment.getIsThreadMarkedAsUnread(userId)) {
				comment.markThreadAsRead(userId);
			}

			if (targetMessageId && refs.current[targetMessageId]) {
				refs.current[targetMessageId].scrollIntoView({
					behavior: "smooth",
				});
				setTargetMessageId(undefined);
			}
		}, [userId, targetMessageId]);

		const handleClose = (): void => {
			setOpenedThreadId(undefined);
		};

		const toggleResolved = (): void => {
			comment.setResolved(!comment.getResolved());
		};

		const handleCreateMessage = (): void => {
			if (!userId) {
				return;
			}
			comment.saveMessage(
				value,
				accountInfo?.name || "Unknown",
				userId,
				accountInfo?.avatar,
			);
			setValue("");
		};

		const handleEditMessage = (newValue: string, id: string): void => {
			comment.editMessage(newValue, id);
		};

		const thread = comment.getThread();
		const canEditThread: boolean =
			account.permissions.checkPermissions(
				"owns",
				"boards",
				board.getBoardId(),
			) || userId === comment.getCommentators()[0].id;

		return (
			<div ref={threadRef}>
				<UiPanel className={styles.panel} ref={ref} zIndex={2}>
					<div
						className={clsx(
							styles.header,
							!canEditThread && styles.noPermission,
						)}
					>
						{canEditThread && (
							<Button
								className={styles.threadBtn}
								pattern="secondary"
								onClick={toggleResolved}
							>
								{!comment.getResolved() && (
									<Icon
										iconName="checkMark"
										width={20}
										height={20}
									/>
								)}
								{comment.getResolved()
									? t("comment.openThread")
									: t("comment.closeThread")}
							</Button>
						)}
						<div className={styles.headerOptions}>
							<ExtraOptions
								comment={comment}
								canEdit={canEditThread}
							/>
							<UiButton
								size="sm"
								variant="secondary"
								onClick={handleClose}
								style={{
									padding: 0,
									color: "#696B76",
								}}
							>
								<Icon
									iconName="modalCross"
									width={16}
									height={16}
								/>
							</UiButton>
						</div>
					</div>
					<UiSeparator />
					<div
						className={clsx(
							styles.messages,
							styles.scrollContainer,
						)}
					>
						{thread.map((mes, index) => {
							if (!mes || !mes.id) {
								return null;
							}
							return (
								<Message
									ref={setRef(mes.id)}
									key={mes.id}
									text={mes.text}
									date={mes.date}
									handleEditMessage={handleEditMessage}
									id={mes.id}
									isTextUnderEditor={
										textUnderEditorId === mes.id
									}
									setTextUnderEditor={setTextUnderEditorId}
									commentator={mes.commentator}
									handleOptionsClick={() =>
										handleMessageOptionsClick(mes.id)
									}
									handleRemoveMessage={() =>
										handleRemoveMessage(mes.id)
									}
									isShorted={
										thread[index - 1] &&
										thread[index - 1].commentator
											.username ===
											mes.commentator.username
									}
									isOptionsPanelActive={Boolean(
										messageOptionsData &&
											messageOptionsData.messageId ===
												mes.id,
									)}
								/>
							);
						})}
					</div>
					{(userId || userId === 0) && accountInfo?.name && (
						<>
							<UiSeparator />
							<div className={styles.scrollContainer}>
								<div className={styles.createMessage}>
									<Avatar
										avatar={accountInfo?.avatar}
										width={20}
										height={20}
									/>
									<CommentInput
										mode="reply"
										value={value}
										setValue={setValue}
										handleSubmit={handleCreateMessage}
										onInput={() =>
											comment.subject.publish(comment)
										}
									/>
								</div>
							</div>
						</>
					)}
					{messageOptionsData && (
						<OptionsPanel
							ref={messageOptionsRef}
							setTextUnderEditor={handleSetEditor}
							canRemove={canRemove}
							handleRemove={handleRemoveMessage}
							style={{
								position: "absolute",
								top: messageOptionsData.top,
								left: messageOptionsData.left,
							}}
						/>
					)}
				</UiPanel>
			</div>
		);
	},
);

ThreadPanel.displayName = "ThreadPanel";
