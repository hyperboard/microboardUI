import React, { useState } from "react";
import "./Input.css";
import { EyeOpen } from "./EyeOpen";
import { EyeClose } from "./EyeClose";
import clsx from "clsx";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	id: string;
	placeholder?: string;
	label?: string;
	helperText?: string;
	errorText?: string;
	tab?: string;
	postTab?: string;
	prefixIcon?: React.ReactNode;
	postfix?: string;
	keyhint?: string;
	password?: boolean;
	hasError?: boolean;
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
	hasError,
	...props
}) => {
	const [inputType, setInputType] = useState<string>(() => {
		if (password) {
			return "password";
		}
		return type || "text";
	});

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
					className={clsx("InputContainer", hasError && "InputError")}
				>
					{prefixIcon && (
						<span className="InputPrefix">{prefixIcon}</span>
					)}
					<input id={id} type={inputType} {...props} />
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
					{keyhint && <div className="InputKeyHint">{keyhint}</div>}
				</div>
				<span className="InputPostTab">{props.postTab}</span>
			</div>
			{errorText && <span className="InputErrorText">{errorText}</span>}
			{helperText && <span className="InputHelperText">{errorText}</span>}
		</div>
	);
};
