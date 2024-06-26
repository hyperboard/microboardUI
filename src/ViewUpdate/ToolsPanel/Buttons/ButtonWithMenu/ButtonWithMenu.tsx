import React, { PropsWithChildren, ReactNode } from "react";
import style from "./ButtonWithMenu.module.css";

type Props = PropsWithChildren<{
	isOpen: boolean;
	button: ReactNode;
}>;

export function ButtonWithMenu({ button, children, isOpen }: Props) {
	return (
		<div className={style.container}>
			{button}
			{isOpen && <div className={style.menu}>{children}</div>}
		</div>
	);
}
