import React, { PropsWithChildren } from "react";
import style from "./FolderItem.module.css";

type Props = PropsWithChildren<{}>;

export function FolderItem({ children }: Props) {
	return <li className={style.item}>{children}</li>;
}
