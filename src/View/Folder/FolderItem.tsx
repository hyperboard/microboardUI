import React, { CSSProperties, PropsWithChildren } from "react";
import style from "./FolderItem.module.css";

type Props = PropsWithChildren<{ customStyle?: CSSProperties }>;

export function FolderItem({ children, customStyle }: Props) {
	return (
		<li className={style.item} style={customStyle}>
			{children}
		</li>
	);
}
