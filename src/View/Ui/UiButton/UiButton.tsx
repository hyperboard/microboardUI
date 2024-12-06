import clsx from "clsx";
import React, {
	CSSProperties,
	forwardRef,
	HTMLAttributes,
	type PropsWithChildren,
} from "react";
import style from "./UiButton.module.css";
import { Tooltip } from "./Tooltip";

type UiButtonProps = PropsWithChildren<
	HTMLAttributes<HTMLButtonElement> & {
		active?: boolean;
		disabled?: boolean;
		tooltip?: string;
		hotkey?: string;
		tooltipPosition?:
			| "right"
			| "top"
			| "top-left"
			| "top-right"
			| "top-center-fixed"
			| "top-right-fixed"
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
		radius?: "xl" | "md" | "sm";
		className?: string;
		toolTipStyle?: CSSProperties;
	}
>;

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
			radius = "xl",
			rounded = "full",
			toolTipStyle,
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
					{
						[style.radiusXl]: radius === "xl",
						[style.radiusMd]: radius === "md",
						[style.radiusSm]: radius === "sm",
					},
					className,
				)}
				ref={ref}
				disabled={disabled}
				{...props}
			>
				{children}
				{tooltip && (
					<Tooltip
						inlineStyle={toolTipStyle}
						tooltip={tooltip}
						tooltipPosition={tooltipPosition}
						hotkey={hotkey}
					/>
				)}
			</button>
		);
	},
);

export const UiDivButton = forwardRef<
	HTMLDivElement,
	Omit<UiButtonProps, "disabled">
>(
	(
		{
			children,
			className,
			active = false,
			tooltip,
			tooltipPosition = "right",
			hotkey,
			variant = "default",
			size = "lg",
			radius = "xl",
			rounded = "full",
			...props
		},
		ref,
	) => {
		return (
			<div
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
					{
						[style.radiusXl]: radius === "xl",
						[style.radiusMd]: radius === "md",
						[style.radiusSm]: radius === "sm",
					},
					className,
				)}
				ref={ref}
				{...props}
			>
				{children}
				{tooltip && (
					<Tooltip
						tooltip={tooltip}
						tooltipPosition={tooltipPosition}
						hotkey={hotkey}
					/>
				)}
			</div>
		);
	},
);

UiButton.displayName = "UiButton";
UiDivButton.displayName = "UiDivButton";
