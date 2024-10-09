import React from "react";
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
		| "bottom"
		| "bottom-right"
		| "bottom-left";
	tooltipAlign?: "center" | "left";
}

export const Tooltip = ({
	tooltip,
	tooltipPosition = "right",
	tooltipAlign = "center",
	hotkey,
	...props
}: TooltipProps): JSX.Element => {
	return (
		<div
			className={clsx(style.tipContainer, {
				[style.right]: tooltipPosition === "right",
				[style.top]: tooltipPosition === "top",
				[style.topRight]: tooltipPosition === "top-right",
				[style.topCenterFixed]: tooltipPosition === "top-center-fixed",
				[style.bottom]: tooltipPosition === "bottom",
				[style.bottomRight]: tooltipPosition === "bottom-right",
				[style.bottomLeft]: tooltipPosition === "bottom-left",
			})}
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
