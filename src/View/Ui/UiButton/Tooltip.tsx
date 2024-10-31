import React, { CSSProperties } from "react";
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
		| "bottom-left";
	tooltipAlign?: "center" | "left";
	inlineStyle?: CSSProperties;
}

export const Tooltip = ({
	tooltip,
	tooltipPosition = "right",
	tooltipAlign = "center",
	hotkey,
	inlineStyle,
	...props
}: TooltipProps): JSX.Element => {
	return (
		<div
			className={clsx(style.tipContainer, {
				[style.right]: tooltipPosition === "right",
				[style.top]: tooltipPosition === "top",
				[style.topRight]: tooltipPosition === "top-right",
				[style.topLeft]: tooltipPosition === "top-left",
				[style.topCenterFixed]: tooltipPosition === "top-center-fixed",
				[style.topRightFixed]: tooltipPosition === "top-right-fixed",
				[style.bottom]: tooltipPosition === "bottom",
				[style.bottomRight]: tooltipPosition === "bottom-right",
				[style.bottomLeft]: tooltipPosition === "bottom-left",
			})}
			style={inlineStyle}
			{...props}
		>
			<div className={clsx(style.tip)}>
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
};
