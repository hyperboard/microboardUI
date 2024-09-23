import { Mbr } from "Board/Items";
import clsx from "clsx";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import style from "./UiButtonWithMenu.module.css";

type RenderNode = (verticalAlign: "middle" | "top" | "bottom") => ReactNode;

type Props = {
	children: ReactNode | RenderNode;
	button: ReactNode | RenderNode;
	menuName: string;
	openedMenu: string;
	panelMbr: Mbr;
	windowHeight: number;
	align?: "center" | "left" | "right";
};

export function ButtonWithMenu({
	button,
	menuName,
	openedMenu,
	children,
	panelMbr,
	windowHeight,
	align = "center",
}: Props) {
	const menuRef = useRef<HTMLDivElement>(null);
	const [verticalAlign, setVerticalAlign] = useState<"bottom" | "middle">(
		"bottom",
	);

	useEffect(() => {
		const menu = menuRef.current;
		if (!menu) {
			return;
		}
		const menuHeight = menu.getBoundingClientRect().height;
		if (panelMbr.bottom + menuHeight < windowHeight) {
			setVerticalAlign("bottom");
			return;
		}

		setVerticalAlign("middle");
	}, [panelMbr, windowHeight]);

	return (
		<div className={style.container}>
			{typeof button === "function" ? button(verticalAlign) : button}
			<div
				ref={menuRef}
				className={clsx([
					style.menu,
					style[verticalAlign],
					style[align],
					style[openedMenu === menuName ? "opened" : "closed"],
				])}
			>
				{typeof children === "function"
					? children(verticalAlign)
					: children}
			</div>
			{/* )} */}
		</div>
	);
}
