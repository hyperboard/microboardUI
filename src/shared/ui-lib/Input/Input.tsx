import React, { useEffect, useRef, useState } from "react";
import "./Input.css";
import { EyeOpen } from "./EyeOpen";
import { EyeClose } from "./EyeClose";
import clsx from "clsx";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	id: string;
	placeholder?: string;
	label?: string;
	helperText?: string;
	successText?: string;
	errorText?: string;
	isSuccess?: boolean;
	tab?: string;
	postTab?: string;
	prefixIcon?: React.ReactNode;
	iconColor?: string;
	postfixButton?: React.ReactNode;
	postfix?: string;
	keyhint?: string;
	password?: boolean;
	hasError?: boolean;
	multiline?: boolean;
	inputContainerClassName?: string;
	shouldFocus?: boolean;
}

export const Input: React.FC<Props> = ({
	id,
	prefixIcon,
	label,
	tab,
	keyhint,
	errorText,
	helperText,
	password,
	type,
	isSuccess,
	hasError,
	iconColor,
	postfixButton,
	multiline = false,
	inputContainerClassName,
	shouldFocus,
	successText,
	...props
}) => {
	const [inputType, setInputType] = useState<string>(() => {
		if (password) {
			return "password";
		}
		return type || "text";
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const handleInput = () => {
		if (
			textareaRef.current &&
			textareaRef.current.textLength >=
				Number(textareaRef.current.style.width)
		) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	};

	useEffect(() => {
		if (multiline) {
			handleInput();
		}
	}, [textareaRef.current?.textLength === 0]);

	useEffect(() => {
		if (shouldFocus && inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const togglePassword = (): void => {
		setInputType(inputType === "text" ? "password" : "text");
	};

	return (
		<div className="InputWrapper">
			{label && (
				<label htmlFor={id} className="InputLabel">
					{label}
				</label>
			)}
			<div className="InputTabWrapper">
				{tab && <span className="InputTab">{tab}</span>}
				<div
					className={clsx(
						"InputContainer",
						hasError && "InputError",
						isSuccess && "InputSuccess",
						inputContainerClassName,
					)}
				>
					{prefixIcon && (
						<span
							style={{ color: iconColor }}
							className="InputPrefix"
						>
							{prefixIcon}
						</span>
					)}
					{multiline ? (
						<textarea
							ref={textareaRef}
							className="textarea"
							id={id}
							rows={1}
							{...props}
							onInput={() => {
								handleInput();
								if (props.onInput) {
									props.onInput();
								}
							}}
						/>
					) : (
						<input
							ref={inputRef}
							onPaste={e => e.stopPropagation()}
							onCopy={e => e.stopPropagation()}
							id={id}
							type={inputType}
							{...props}
						/>
					)}
					{password && inputType === "text" && (
						<div className="Eye">
							<EyeClose onClick={togglePassword} />
						</div>
					)}
					{password && inputType === "password" && (
						<div className="Eye">
							<EyeOpen onClick={togglePassword} />
						</div>
					)}
					{postfixButton && (
						<span className="InputPostfix">{postfixButton}</span>
					)}
					{keyhint && <div className="InputKeyHint">{keyhint}</div>}
				</div>
				<span className="InputPostTab">{props.postTab}</span>
			</div>
			{(errorText || helperText || successText) && (
				<div className="Text">
					{errorText && (
						<span className="InputErrorText">{errorText}</span>
					)}
					{helperText && (
						<span className="InputHelperText">{helperText}</span>
					)}
					{successText && (
						<span className="InputSuccessText">{successText}</span>
					)}
				</div>
			)}
		</div>
	);
};
