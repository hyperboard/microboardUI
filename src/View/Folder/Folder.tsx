import clsx from "clsx";
import React, {
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
	isBlank: boolean;
}>;

export function Folder({
	title,
	icon,
	children,
	isOpened,
	isBlank,
}: Props): React.ReactElement<Props> {
	const [isOpen, setIsOpen] = useState(isOpened);

	useEffect(() => {
		setIsOpen(isOpened || isBlank);
	}, [isOpened, isBlank]);

	const handleTitleClick: MouseEventHandler = () => {
		setIsOpen(prev => !prev);
	};

	return (
		<div className={clsx(style.folder, isOpen && style.open)}>
			<button className={style.header} onClick={handleTitleClick}>
				{icon}
				<h3 className={style.title}>{title}</h3>
			</button>
			<ul className={style.list}>{children}</ul>
		</div>
	);
}
