import React, { MouseEventHandler } from "react";
import styles from "./MiroBoardsItem.module.css";

interface IMiroBoardItemProps {
	name: string;
	picture: { imageURL: string } | undefined;
	onClick: MouseEventHandler<HTMLDivElement>;
}

export function MiroBoardItem({ name, picture, onClick }: IMiroBoardItemProps) {
	const imgBoard = picture?.imageURL;
	return (
		<div className={styles.board} onClick={onClick}>
			<div className={styles.board_img}>
				{picture && picture?.imageURL ? (
					<img src={imgBoard} alt={name} />
				) : (
					<div className={styles.stubImg}></div>
				)}
			</div>
			<p className={styles.name}>{name}</p>
		</div>
	);
}
