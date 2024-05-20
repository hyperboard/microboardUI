import React, { MouseEventHandler, PropsWithChildren } from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import style from "./RestOptionsMenu.module.css";

type Props = PropsWithChildren<{
	onClick: MouseEventHandler<HTMLButtonElement>;
	hotkey: string;
	id?: string;
}>;

export function Item({ children, onClick, hotkey, id }: Props) {
	return (
		<UiButton id={id} className={style.item} onClick={onClick}>
			<span className={style.text}>{children}</span>
			<span className={style.hotkey}>{hotkey}</span>
		</UiButton>
	);
}
