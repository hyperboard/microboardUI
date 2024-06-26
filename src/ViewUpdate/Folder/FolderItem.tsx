import clsx from "clsx";
import React, { type MouseEventHandler } from "react";
import { Icon } from "ViewUpdate/Icon";
import style from "./FolderItem.module.css";

type Props = {
	text: string;
	active?: boolean;
	onClick?: MouseEventHandler;
	onClickContext?: MouseEventHandler;
};

export function FolderItem({ text, onClick, onClickContext, active }: Props) {
	return (
		<li className={style.item}>
			<div
				role="button"
				className={clsx(style.button, active && style.active)}
				onClick={onClick}
				onContextMenu={onClickContext}
			>
				<span className={style.text}>{text}</span>
				<button className={style.context} onClick={onClickContext}>
					<Icon iconName="ContextMenu" width={16} height={16} />
				</button>
			</div>
		</li>
	);
}
