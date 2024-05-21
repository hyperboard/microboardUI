import React from "react";
import styles from "./MiroBoardsItem.module.css";

interface IMiroBoardItemProps {
	name: string;
	picture: { imageURL: string } | undefined;
}

export function MiroBoardItem({ name, picture }: IMiroBoardItemProps) {
	const imgBoard = picture?.imageURL;
	return (
		<div className={styles.board}>
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
