import { Mbr } from "Board/Items";
import clsx from "clsx";
import React, {
	PropsWithChildren,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import style from "./UiButtonWithMenu.module.css";

type Props = PropsWithChildren<{
	button: ReactNode;
	menuName: string;
	openedMenu: string;
	panelMbr: Mbr;
	windowHeight: number;
	offset?: number;
	align?: "center" | "left" | "right";
}>;

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
	const [verticalAlign, setVerticalAlign] = useState<
		"bottom" | "top" | "center"
	>("center");

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
		if (panelMbr.top - menuHeight >= 0) {
			setVerticalAlign("top");
			return;
		}
		setVerticalAlign("center");
	}, [panelMbr.top, windowHeight]);

	return (
		<div className={style.container}>
			{button}
			{openedMenu === menuName && (
				<div
					ref={menuRef}
					className={clsx([
						style.menu,
						style[verticalAlign],
						style[align],
					])}
				>
					{children}
				</div>
			)}
		</div>
	);
}
