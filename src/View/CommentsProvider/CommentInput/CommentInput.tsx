import React, { useEffect, useState } from "react";
import styles from "./CommentInput.module.css";
import { UiSeparator } from "../../Ui/UiSeparator";
import { UiButton } from "../../Ui/UiButton";
import { Icon } from "../../Icon";
import { Input } from "../../../shared/ui-lib/Input";
import { useTranslation } from "react-i18next";

interface Props {
	value: string;
	setValue: (value: string) => void;
	handleSubmit: () => void;
	handleRemove?: () => void;
	handleReject?: () => void;
	handleKeyDown?: (e: KeyboardEvent) => void;
	mode: "create" | "edit" | "reply";
	onInput?: () => void;
}

export const CommentInput = ({
	value,
	handleSubmit,
	handleRemove,
	setValue,
	mode,
	handleReject,
	onInput,
}: Props): JSX.Element => {
	const [showSeparator, setShowSeparator] = useState(true);

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		event.stopPropagation();
		if (event.key === "Enter" && !value.trim()) {
			return event.preventDefault();
		}
		if (event.key === "Enter" && !!value.trim() && !event.shiftKey) {
			event.preventDefault();
			return handleSubmit();
		}
		if (event.key === "Escape") {
			if (handleReject) {
				return handleReject();
			}
			return setValue("");
		}
	};
	const { t } = useTranslation();

	useEffect(() => {
		const input: HTMLTextAreaElement | null = document.querySelector(
			`#comment-message-input-${mode}`,
		);
		input?.focus();
	}, []);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const target = event.target;
		setValue(target.value);
		if (target.scrollHeight > 20) {
			setShowSeparator(false);
		} else {
			setShowSeparator(true);
		}
	};

	return (
		<div className={styles.wrapper}>
			<Input
				maxLength={560}
				id={`comment-message-input-${mode}`}
				placeholder={t(`comment.${mode}`)}
				value={value}
				onInput={onInput}
				inputContainerClassName={
					mode === "edit" ? styles.inputContainer : undefined
				}
				multiline={true}
				onKeyDown={onKeyDown}
				onPaste={event => event.stopPropagation()}
				onCopy={event => event.stopPropagation()}
				onChange={handleChange}
				postfixButton={
					(mode === "create" || mode === "reply") && (
						<div className={styles.submitBtnWrapper}>
							{showSeparator && (
								<UiSeparator
									vertical={true}
									className={styles.submitBtnSeparator}
								/>
							)}
							<UiButton
								variant="secondary"
								className={styles.submitBtn}
								active={!!value}
								disabled={!value}
								onClick={handleSubmit}
							>
								<Icon
									iconName="SendArrow"
									width={20}
									height={20}
								/>
							</UiButton>
						</div>
					)
				}
			/>
			{mode === "edit" && (
				<div className={styles.editModeButtons}>
					<div>
						<button onClick={handleReject}>Отменить</button>
						<button
							onClick={handleSubmit}
							className={styles.saveBtn}
						>
							Сохранить
						</button>
					</div>
					<button onClick={handleRemove} className={styles.deleteBtn}>
						Удалить
					</button>
				</div>
			)}
		</div>
	);
};
