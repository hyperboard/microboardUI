import clsx from "clsx";
import React, {
	ChangeEventHandler,
	FocusEventHandler,
	FormEventHandler,
	KeyboardEventHandler,
	useEffect,
	useRef,
} from "react";

import style from "./BoardRename.module.css";

type Props = {
	onChange: ChangeEventHandler;
	onConfirm: () => void;
	value: string;
	onCancel: () => void;
	className?: string;
	width?: number;
};

const MIN_WIDTH = 10;

export function BoardRename({
	onChange,
	onCancel,
	onConfirm,
	value,
	className,
	width,
}: Props) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (!inputRef.current) {
			return;
		}

		inputRef.current.focus();
		inputRef.current.select();
	}, []);

	const handleSubmit: FormEventHandler = event => {
		event.preventDefault();

		onConfirm();
		onCancel();
	};

	const preventPropagation: KeyboardEventHandler = event =>
		event.stopPropagation();

	const handleCancel: KeyboardEventHandler = event => {
		event.stopPropagation();
		if (event.code === "Escape") {
			onCancel();
		}
	};

	const handleBlur: FocusEventHandler = event => {
		onConfirm();

		setTimeout(() => {
			onCancel();
		}, 100);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={clsx(style.form)}
			style={{
				width:
					typeof width === "number"
						? width > MIN_WIDTH
							? `${width}ch`
							: `${MIN_WIDTH}ch`
						: "100%",
			}}
		>
			<input
				ref={inputRef}
				className={clsx(style.input, className)}
				onChange={onChange}
				onKeyDown={handleCancel}
				onKeyUp={preventPropagation}
				onBlur={handleBlur}
				value={value}
				type="text"
			/>
		</form>
	);
}
