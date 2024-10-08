import React, { CSSProperties, forwardRef, PropsWithChildren } from "react";
import style from "./FolderItem.module.css";

type Props = PropsWithChildren<{ customStyle?: CSSProperties }>;

export const FolderItem = forwardRef<HTMLLIElement, Props>(function FolderItem(
	{ children, customStyle },
	ref,
) {
	return (
		<li ref={ref} className={style.item} style={customStyle}>
			{children}
		</li>
	);
});
