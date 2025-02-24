import React, { CSSProperties, forwardRef } from "react";
import style from "./UiButton.module.css";
import clsx from "clsx";

interface TooltipProps {
	tooltip: string;
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
	variant?: "primary" | "secondary";
	tooltipAlign?: "center" | "left";
	inlineStyle?: CSSProperties;
	borderRadius?: "radiusMd";
	padding?: "paddingMd";
	className?: string;
	[key: string]: unknown;
}

// eslint-disable-next-line react/display-name
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
	(
		{
			tooltip,
			tooltipPosition = "right",
			tooltipAlign = "center",
			variant = "primary",
			hotkey,
			borderRadius,
			padding,
			inlineStyle,
			className,
			...props
		},
		ref,
	): JSX.Element => {
		return (
			<div
				ref={ref}
				className={clsx(
					style.tipContainer,
					{
						[style.right]: tooltipPosition === "right",
						[style.top]: tooltipPosition === "top",
						[style.topRight]: tooltipPosition === "top-right",
						[style.topCenterFixed]:
							tooltipPosition === "top-center-fixed",
						[style.topRightFixed]:
							tooltipPosition === "top-right-fixed",
						[style.bottom]: tooltipPosition === "bottom",
						[style.bottomRight]: tooltipPosition === "bottom-right",
						[style.bottomLeft]: tooltipPosition === "bottom-left",
						[style.bottomLeftNoWhitespace]:
							tooltipPosition === "bottom-left-noWhitespace",
					},
					className,
				)}
				style={inlineStyle}
				{...props}
			>
				<div
					className={clsx(
						style.tip,
						{
							[style.primaryTip]: variant === "primary",
							[style.secondaryTip]: variant === "secondary",
						},
						borderRadius && style[borderRadius],
						padding && style[padding],
					)}
				>
					<span
						className={clsx(style.tipText, {
							[style.center]: tooltipAlign === "center",
							[style.left]: tooltipAlign === "left",
						})}
						dangerouslySetInnerHTML={{ __html: tooltip }}
					/>
					{hotkey && <span className={style.hotkey}>{hotkey}</span>}
				</div>
			</div>
		);
	},
);
