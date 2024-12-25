import clsx from "clsx";
import React, { forwardRef, type HTMLAttributes } from "react";
import style from "./UiPanel.module.css";

type UiPanelProps = HTMLAttributes<HTMLDivElement> & {
	vertical?: boolean;
	grid?: boolean;
	rows?: number;
	columns?: number;
	zIndex?: number;
	padding?: number;
	gap?: number;
	rounded?:
		| "top"
		| "bottom"
		| "full"
		| "topRightBottom"
		| "bottomRightTop";
};

export const UiPanel = forwardRef<HTMLDivElement, UiPanelProps>(
	(
		{
			zIndex = 1,
			children,
			className,
			grid = false,
			rows,
			columns,
			padding = 12,
			vertical = false,
			style: inlineStyle,
			gap,
			rounded = "full",
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={clsx([
					style.panel,
					grid && style.grid,
					vertical && style.vertical,
					className,
					style[rounded],
				])}
				style={
					grid
						? {
								gridTemplateColumns: columns
									? `repeat(${columns}, 1fr)`
									: undefined,
								gridTemplateRows: rows
									? `repeat(${rows}, 1fr)`
									: undefined,
								zIndex,
								padding,
								gap,
								...inlineStyle,
							}
						: { zIndex, padding, gap, ...inlineStyle }
				}
				{...props}
			>
				{children}
			</div>
		);
	},
);
UiPanel.displayName = "UiPanel";
