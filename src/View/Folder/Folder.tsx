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
	customHeader?: CSSProperties;
	customList?: CSSProperties;
	onToggle?: (isOpen: boolean) => void;
	currBoardId?: string;
}>;

export function Folder({
	title,
	icon,
	children,
	isOpened,
	// isBlank,
	customHeader,
	customList,
	onToggle,
	currBoardId,
}: Props): React.ReactElement<Props> {
	const [isOpen, setIsOpen] = useState(isOpened);

	const handleTitleClick: MouseEventHandler = () => {
		onToggle?.(isOpen);
		setIsOpen(prev => !prev);
	};

	useEffect(() => {
		if (!isOpen) {
			setIsOpen(isOpened);
		}
	}, [isOpened, currBoardId]);

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
