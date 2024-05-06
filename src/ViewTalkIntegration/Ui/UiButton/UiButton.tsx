import React, { forwardRef, HTMLAttributes } from "react";
import style from "./UiButton.module.css";
import clsx from "clsx";

type UiButtonProps = HTMLAttributes<HTMLButtonElement> & {
	active?: boolean;
	disabled?: boolean;
	tooltip?: string;
	hotkey?: string;
	tooltipPosition?: "right" | "top" | "top-left" | "top-right" | "bottom";
};

export const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(
	(
		{
			children,
			className,
			active = false,
			disabled = false,
			tooltip,
			tooltipPosition = "right",
			hotkey,
			...props
		},
		ref,
	) => {
		return (
			<button
				className={clsx(
					style.button,
					active && style.active,
					className,
				)}
				ref={ref}
				disabled={disabled}
				{...props}
			>
				{children}
				{tooltip && (
					<div
						className={clsx(style.tipContainer, {
							[style.right]: tooltipPosition === "right",
							[style.top]: tooltipPosition === "top",
							[style.topRight]: tooltipPosition === "top-right",
							[style.bottom]: tooltipPosition === "bottom",
						})}
					>
						<div className={clsx(style.tip)}>
							<span className={style.tipText}>{tooltip}</span>
							{hotkey && (
								<span className={style.hotkey}>{hotkey}</span>
							)}
						</div>
					</div>
				)}
			</button>
		);
	},
);
