import React, { MouseEventHandler } from "react";
import styles from "../../ImportMiroBoards.module.css";

interface IMiroBoardItemProps {
	name: string;
	picture: { imageURL: string } | undefined;
	onClick: MouseEventHandler<HTMLDivElement>;
}

export function MiroBoardItem({
	name,
	picture,
	onClick,
}: IMiroBoardItemProps): React.ReactElement {
	const imgBoard = picture?.imageURL;

	return (
		<div className={styles.board} onClick={onClick}>
			<div>
				{imgBoard ? (
					<img src={imgBoard} alt={name} className={styles.img} />
				) : (
					<div className={styles.stubImg}></div>
				)}
			</div>
			<p className={styles.name}>{name}</p>
		</div>
	);
}
