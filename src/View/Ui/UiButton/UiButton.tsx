import clsx from "clsx";
import React, { forwardRef, HTMLAttributes } from "react";
import style from "./UiButton.module.css";

type UiButtonProps = HTMLAttributes<HTMLButtonElement> & {
	active?: boolean;
	disabled?: boolean;
	tooltip?: string;
	hotkey?: string;
	tooltipPosition?:
		| "right"
		| "top"
		| "top-left"
		| "top-right"
		| "bottom"
		| "bottom-right"
		| "bottom-left";
	variant?: "default" | "secondary" | "tertiary";
	size?: "lg" | "md" | "sm";
	rounded?:
		| "top"
		| "bottom"
		| "left"
		| "right"
		| "full"
		| "none"
		| "bottom-left"
		| "bottom-right";
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
			variant = "default",
			size = "lg",
			rounded = "full",
			...props
		},
		ref,
	) => {
		return (
			<button
				className={clsx(
					style.button,
					active && style.active,
					style[variant],
					style[size],
					{
						[style.topRounded]: rounded === "top",
						[style.bottomRounded]: rounded === "bottom",
						[style.fullRounded]: rounded === "full",
						[style.leftRounded]: rounded === "left",
						[style.rightRounded]: rounded === "right",
						[style.fullRounded]: rounded === "full",
					},
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
							[style.bottomRight]:
								tooltipPosition === "bottom-right",
							[style.bottomLeft]:
								tooltipPosition === "bottom-left",
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
