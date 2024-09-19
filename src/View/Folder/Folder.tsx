import clsx from "clsx";
import React, {
	CSSProperties,
	useEffect,
	useState,
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import style from "./Folder.module.css";

type Props = PropsWithChildren<{
	title: string;
	icon?: ReactNode;
	isOpened: boolean;
	// isBlank: boolean;
	currBoardId?: string;
	customHeader?: CSSProperties;
	customList?: CSSProperties;
}>;

export function Folder({
	title,
	icon,
	children,
	isOpened,
	// isBlank,
	currBoardId,
	customHeader,
	customList,
}: Props): React.ReactElement<Props> {
	const [isOpen, setIsOpen] = useState(isOpened);

	useEffect(() => {
		// 	setIsOpen(isOpened || isBlank);
		// }, [isOpened, isBlank]);
		setIsOpen(isOpened);
	}, [isOpened, currBoardId]);

	const handleTitleClick: MouseEventHandler = () => {
		setIsOpen(prev => !prev);
	};

	return (
		<div className={clsx(style.folder, isOpen && style.open)}>
			<button
				className={style.header}
				onClick={handleTitleClick}
				style={customHeader}
			>
				{icon}
				<h3 className={style.title}>{title}</h3>
			</button>
			<ul className={style.list} style={customList}>
				{children}
			</ul>
		</div>
	);
}
