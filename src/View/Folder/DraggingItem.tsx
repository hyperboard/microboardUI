import React, { type CSSProperties, type ReactNode } from "react";
import styles from "./DraggingItem.module.css";

export type Props = {
	name: string;
	icon: ReactNode;
	style: CSSProperties;
};

export function DraggingItem({ name, icon, style }: Props) {
	return (
		<div className={styles.item} style={style}>
			{icon}
			<span>{name}</span>
		</div>
	);
}
