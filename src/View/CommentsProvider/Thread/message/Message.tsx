import React, { forwardRef, useState } from "react";
import clsx from "clsx";
import styles from "./Message.module.css";
import { UiButton } from "../../../Ui/UiButton";
import { Icon } from "../../../Icon";
import { useAppContext } from "View/AppContext";
import { CommentInput } from "../../CommentInput/CommentInput";
import { formatDate } from "utils";
import { Avatar } from "View/UserPanel/Avatar/Avatar.tsx";
import { useAccount } from "App/useAccount";

interface Props {
	text: string;
	date: Date;
	username: string;
	handleOptionsClick: () => void;
	avatar?: string;
	handleEditMessage: (value: string, id: string) => void;
	handleRemoveMessage: () => void;
	id: string;
	isTextUnderEditor: boolean;
	setTextUnderEditor: (value: string | undefined) => void;
	isShorted: boolean;
	isOptionsPanelActive: boolean;
}

export const Message = forwardRef<HTMLDivElement, Props>(
	(
		{
			text,
			date,
			username,
			avatar,
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

		const canEdit =
			account.info?.name === username || account.info?.email === username;
		const handleEditClick = () => {
			setTextUnderEditor(undefined);
			handleEditMessage(value, id);
		};

		const handleReject = () => {
			setTextUnderEditor(undefined);
			setValue(text);
		};

		const setEditor = () => {
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
									avatar={avatar}
									width={32}
									height={32}
								/>
								<p className={styles.username}>{username}</p>
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
								<Icon iconName="Dots" width={12} height={12} />
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
