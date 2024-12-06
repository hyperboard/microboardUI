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
	windowWidth?: number;
	align?: "center" | "left" | "right";
	offset?: "Left" | "Right" | "Center";
};

export function ButtonWithMenu({
	button,
	menuName,
	openedMenu,
	children,
	panelMbr,
	windowHeight,
	windowWidth,
	align = "center",
	offset,
}: Props): React.ReactElement | null {
	const menuRef = useRef<HTMLDivElement>(null);
	const [verticalAlign, setVerticalAlign] = useState<
		"bottom" | "middle" | "top"
	>("bottom");
	const [horizontalAlign, setHorizontalAlign] = useState<
		"Left" | "Right" | "Center" | "None"
	>(offset || "Left");

	const setMenuVerticalAlign = (): void => {
		const menu = menuRef.current;
		if (!menu) {
			return;
		}
		const menuHeight = menu.getBoundingClientRect().height;

		if (panelMbr.bottom + menuHeight < windowHeight) {
			setVerticalAlign("bottom");
			return;
		}

		if (panelMbr.top < windowHeight) {
			setVerticalAlign("top");
			return;
		}

		setVerticalAlign("middle");
	};

	const setMenuHorizontalAlign = (): void => {
		const menu = menuRef.current;
		if (!menu) {
			return;
		}

		const menuWidth = menu.getBoundingClientRect().width;
		if (windowWidth && panelMbr.right + menuWidth > windowWidth) {
			setHorizontalAlign("Center");
			return;
		}

		setHorizontalAlign("None");
	};

	useEffect(() => {
		setMenuHorizontalAlign();
		setMenuVerticalAlign();
	}, [panelMbr, windowHeight, windowWidth]);

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
					// offset &&
					// 	verticalAlign === "middle" &&
					// 	style[`offset${offset}`],
					style[`offset${horizontalAlign}`],
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
