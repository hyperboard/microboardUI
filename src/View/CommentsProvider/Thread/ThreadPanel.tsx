import React, { forwardRef, useEffect, useRef, useState } from "react";
import { UiPanel } from "../../Ui/UiPanel";
import styles from "./ThreadPanel.module.css";
import { UiButton } from "../../Ui/UiButton";
import { Icon } from "../../Icon";
import { UiSeparator } from "../../Ui/UiSeparator";
import { Button } from "shared/ui-lib/Button/Button";
import { Comment } from "Board/Items/Comment/Comment";
import { Message } from "./message/Message";
import clsx from "clsx";
import { CommentInput } from "../CommentInput/CommentInput";
import { useAppContext } from "View/AppContext";
import { Mbr } from "Board/Items/Mbr/Mbr";
import { ExtraOptions } from "./ExtraOptions/ExtraOptions";
import { OptionsPanel } from "./OptionsPanel/OptionsPanel";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useCommentsContext } from "../CommentsContext.tsx";
import { useTranslation } from "react-i18next";
import { useIntersectionObserver } from "View/CommentsProvider/useIntersectionObserver";
import { Avatar } from "View/UserPanel/Avatar/Avatar.tsx";

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
		const { app, board } = useAppContext();
		const [messageOptionsData, setMessageOptionsData] =
			useState<null | MessageOptionsData>(null);
		const refs = useRef<Record<string, HTMLDivElement>>({});
		const [textUnderEditorId, setTextUnderEditorId] = useState<
			undefined | string
		>(undefined);
		const { setOpenedThreadId, setTargetMessageId, targetMessageId } =
			useCommentsContext();

		useAppSubscription(app, {
			subjects: ["selection", "pointer"],
			observer: () => {
				setOpenedThreadId(undefined);
			},
		});

		const { t } = useTranslation();
		const accountInfo = app.account.info;
		const username = accountInfo?.name || accountInfo?.email;

		useIntersectionObserver({ comment, refs, username });

		const canRemove =
			comment.getThread()[0].id !== messageOptionsData?.messageId;
		const handleRemoveMessage = (id?: string) => {
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

		const handleSetEditor = () => {
			if (!messageOptionsData) {
				return;
			}
			setTextUnderEditorId(messageOptionsData?.messageId);
			setMessageOptionsData(null);
		};

		const setRef = (id: string) => (el: HTMLDivElement) => {
			refs.current[id] = el;
		};

		const handleMessageOptionsClick = (messageId: string) => {
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
			if (username && comment.getIsThreadMarkedAsUnread(username)) {
				comment.markThreadAsRead(username);
			}

			if (targetMessageId && refs.current[targetMessageId]) {
				refs.current[targetMessageId].scrollIntoView({
					behavior: "smooth",
				});
				setTargetMessageId(undefined);
			}
		}, [username, targetMessageId]);

		const handleClose = () => {
			setOpenedThreadId(undefined);
		};

		const toggleResolved = () => {
			comment.setResolved(!comment.getResolved());
		};

		const handleCreateMessage = () => {
			comment.saveMessage(value, username, accountInfo?.avatar);
			setValue("");
		};

		const handleEditMessage = (newValue: string, id: string) => {
			comment.editMessage(newValue, id);
		};

		const thread = comment.getThread();
		const canEditThread: boolean =
			app.account.permissions.checkPermissions(
				"owns",
				"boards",
				board.getBoardId(),
			) || username === comment.getCommentators()[0].username;

		return (
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
									width={16}
									height={16}
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
				<div className={clsx(styles.messages, styles.scrollContainer)}>
					{thread.map((mes, index) => {
						return (
							<Message
								ref={setRef(mes.id)}
								key={mes.id}
								text={mes.text}
								date={mes.date}
								handleEditMessage={handleEditMessage}
								id={mes.id}
								isTextUnderEditor={textUnderEditorId === mes.id}
								setTextUnderEditor={setTextUnderEditorId}
								username={mes.commentator.username}
								avatar={mes.commentator.avatar}
								handleOptionsClick={() =>
									handleMessageOptionsClick(mes.id)
								}
								handleRemoveMessage={() =>
									handleRemoveMessage(mes.id)
								}
								isShorted={
									thread[index - 1] &&
									thread[index - 1].commentator.username ===
										mes.commentator.username
								}
								isOptionsPanelActive={Boolean(
									messageOptionsData &&
										messageOptionsData.messageId === mes.id,
								)}
							/>
						);
					})}
				</div>
				{username && (
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
		);
	},
);
