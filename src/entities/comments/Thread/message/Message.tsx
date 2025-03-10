import React, { forwardRef, useState } from "react";
import clsx from "clsx";
import styles from "./Message.module.css";
import { Avatar } from "features/UserPanel/Avatar/Avatar";
import { useAccount } from "App/useAccount";
import { Commentator } from "Board/Items/Comment/Comment";
import { UiButton } from "shared/ui-lib/UiButton";
import { formatDate } from "entities/comments/lib";
import { Icon } from "shared/ui-lib/Icon";
import { CommentInput } from "entities/comments/CommentInput/CommentInput";

interface Props {
	text: string;
	date: Date;
	commentator: Commentator;
	handleOptionsClick: () => void;
	handleEditMessage: (value: string, id: string) => void;
	handleRemoveMessage: () => void;
	id: string;
	isTextUnderEditor: boolean;
	setTextUnderEditor: (value: string | undefined) => void;
	isShorted: boolean;
	isOptionsPanelActive: boolean;
}

export const Message = forwardRef<HTMLElement, Props>(
	(
		{
			text,
			date,
			commentator,
			handleOptionsClick,
			handleEditMessage,
			id,
			setTextUnderEditor,
			isTextUnderEditor,
			isShorted,
			isOptionsPanelActive,
			handleRemoveMessage,
		}: Props,
		ref,
	) => {
		const [value, setValue] = useState(text);
		const [isOptionsBtnVisible, setIsOptionsBtnVisible] = useState(false);
		const account = useAccount();

		const canEdit = account.info?.id === commentator.id;
		const handleEditClick = (): void => {
			setTextUnderEditor(undefined);
			handleEditMessage(value, id);
		};

		const handleReject = (): void => {
			setTextUnderEditor(undefined);
			setValue(text);
		};

		const setEditor = (): void => {
			if (canEdit) {
				setTextUnderEditor(id);
			}
		};

		return (
			<div
				className={clsx(
					styles.message,
					isShorted && styles.shortedMessage,
				)}
				ref={!canEdit ? ref : undefined}
				onMouseEnter={() => setIsOptionsBtnVisible(true)}
				onMouseLeave={() => setIsOptionsBtnVisible(false)}
			>
				<div className={styles.header}>
					<div className={styles.headerInfo}>
						{!isShorted && (
							<>
								<Avatar
									avatar={commentator.avatar}
									width={32}
									height={32}
								/>
								<p className={styles.username}>
									{commentator.username}
								</p>
							</>
						)}
						<p
							className={clsx(
								styles.date,
								isShorted &&
									(isOptionsBtnVisible || isOptionsPanelActive
										? styles.visible
										: styles.invisible),
							)}
						>
							{formatDate(new Date(date))}
						</p>
					</div>
					<div className={styles.panelContainer}>
						{canEdit && (
							<UiButton
								ref={ref}
								className={clsx(
									styles.dotsBtn,
									isOptionsBtnVisible || isOptionsPanelActive
										? styles.visible
										: styles.invisible,
								)}
								variant="secondary"
								onClick={handleOptionsClick}
							>
								<Icon iconName="Dots" width={16} height={16} />
							</UiButton>
						)}
					</div>
				</div>
				{isTextUnderEditor && canEdit ? (
					<CommentInput
						mode="edit"
						value={value}
						setValue={setValue}
						handleSubmit={handleEditClick}
						handleRemove={handleRemoveMessage}
						handleReject={handleReject}
					/>
				) : (
					<p onDoubleClick={setEditor} className={styles.text}>
						{value}
					</p>
				)}
			</div>
		);
	},
);

Message.displayName = "Message";
