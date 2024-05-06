import React, { forwardRef, type HTMLAttributes } from "react";
import style from "./UiPanel.module.css";
import clsx from "clsx";

type UiPanelProps = HTMLAttributes<HTMLDivElement> & {
	vertical?: boolean;
	grid?: boolean;
	rows?: number;
	columns?: number;
};

export const UiPanel = forwardRef<HTMLDivElement, UiPanelProps>(
	(
		{
			children,
			className,
			grid = false,
			rows,
			columns,
			vertical = false,
			style: inlineStyle,
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
				])}
				style={
					grid
						? {
								gridTemplateColumns: columns
									? `repeat(${columns}, 1fr)`
									: "auto",
								gridTemplateRows: rows
									? `repeat(${rows}, 1fr)`
									: "auto",
								...inlineStyle,
						  }
						: inlineStyle
				}
				{...props}
			>
				{children}
			</div>
		);
	},
);
