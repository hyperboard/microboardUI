import clsx from "clsx";
import React, {
	CSSProperties,
	MouseEventHandler,
	PropsWithChildren,
	useRef,
} from "react";
import { Icon } from "View/Icon";
import style from "./BoardName.module.css";

type Props = PropsWithChildren<{
	active?: boolean;
	onClick?: MouseEventHandler;
	onClickContext?: MouseEventHandler;
	onDoubleClick?: MouseEventHandler;
	customStyle?: CSSProperties;
}>;

const DOUBLE_CLICK_DELAY = 300;

export function BoardName({
	children,
	active,
	onClick,
	onClickContext,
	onDoubleClick,
	customStyle,
}: Props): JSX.Element {
	const clickTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleClick: MouseEventHandler = event => {
		if (clickTimeout.current) {
			clearTimeout(clickTimeout.current);
			clickTimeout.current = null;
		}

		clickTimeout.current = setTimeout(() => {
			onClick?.(event);
		}, DOUBLE_CLICK_DELAY);
	};

	const handleDoubleClick: MouseEventHandler = event => {
		if (clickTimeout.current) {
			clearTimeout(clickTimeout.current);
			clickTimeout.current = null;
		}
		onDoubleClick?.(event);
	};
	return (
		<div
			role="button"
			className={clsx(style.button, active && style.active)}
			onClick={handleClick}
			onContextMenu={onClickContext}
			onDoubleClick={handleDoubleClick}
			style={customStyle}
		>
			<span className={style.text}>{children}</span>
			{onClickContext && (
				<button className={style.context} onClick={onClickContext}>
					<Icon iconName="ContextMenu" width={16} height={16} />
				</button>
			)}
		</div>
	);
}
