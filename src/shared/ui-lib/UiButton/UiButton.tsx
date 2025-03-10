import clsx from "clsx";
import React, {
	CSSProperties,
	forwardRef,
	HTMLAttributes,
	PropsWithChildren,
	ReactNode,
} from "react";
import style from "./UiButton.module.css";
import { Tooltip } from "./Tooltip";

type CommonUiButtonProps = {
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
		| "bottom-left"
		| "bottom-left-noWhitespace";
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
	tooltipVariant?: "primary" | "secondary";
	radius?: "xl" | "md" | "sm";
	className?: string;
	toolTipStyle?: CSSProperties;
	children: ReactNode;
};

type UiButtonProps = PropsWithChildren<
	HTMLAttributes<HTMLButtonElement> &
		CommonUiButtonProps & {
			disabled?: boolean;
		}
>;

type UiDivButtonProps = PropsWithChildren<
	HTMLAttributes<HTMLDivElement> & CommonUiButtonProps
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
			tooltipVariant = "primary",
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
						variant={tooltipVariant}
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

export const UiDivButton = forwardRef<HTMLDivElement, UiDivButtonProps>(
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
