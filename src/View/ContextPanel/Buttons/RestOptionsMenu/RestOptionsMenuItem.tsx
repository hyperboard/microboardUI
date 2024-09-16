import React, {
	MouseEventHandler,
	PropsWithChildren,
	type ReactNode,
} from "react";
import style from "./RestOptionsMenu.module.css";

type Props = PropsWithChildren<{
	onClick: MouseEventHandler<HTMLButtonElement>;
	icon: ReactNode;
	id?: string;
	hotkey?: string;
}>;

export function RestOptionsMenuItem({
	children,
	onClick,
	icon,
	id,
	hotkey,
}: Props) {
	return (
		<button id={id} className={style.item} onClick={onClick}>
			{icon}
			<span className={style.text}>{children}</span>
			{hotkey && <span className={style.hotkey}>{hotkey}</span>}
		</button>
	);
}
