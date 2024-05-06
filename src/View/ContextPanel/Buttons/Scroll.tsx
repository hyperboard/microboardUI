import { Board } from "Board";
import React from "react";

type ScrollProps = React.PropsWithChildren<{
	board: Board;
	panelRef: React.RefObject<HTMLDivElement>;
}>;

export function Scroll({ board, panelRef, children }: ScrollProps) {
	const [left, setLeft] = React.useState(0);
	const [isSubscribed, setIsSubscribed] = React.useState(false);
	const [isDown, setIsDown] = React.useState(false);
	const scrollRef = React.useRef<HTMLDivElement>(null);

	const pointerDown = () => {
		setIsDown(true);
	};
	const pointerUp = () => {
		setIsDown(false);
	};
	const pointerMove = () => {
		if (!isDown) {
			return;
		}

		const newLeft = left + board.pointer.delta.x;
		const panel = panelRef.current;
		const scroll = scrollRef.current;

		if (!panel || !scroll) {
			return;
		}

		const panelWidth = panel.getBoundingClientRect().width;
		const scrollWidth = scroll.scrollWidth + 20;

		let _left = newLeft;

		if (newLeft + scrollWidth < panelWidth) {
			_left = panelWidth - scrollWidth;
		} else if (newLeft > 0) {
			_left = 0;
		}

		setLeft(_left);
	};
	const subscribeToScroll = (): void => {
		const panel = panelRef.current;
		if (panel && !isSubscribed) {
			setIsSubscribed(true);
			panel.addEventListener("pointerdown", pointerDown);
			window.addEventListener("pointerup", pointerUp);
			window.addEventListener("pointermove", pointerMove);
		}
	};

	React.useEffect(() => {
		subscribeToScroll();

		return () => {
			const scroll = scrollRef.current;
			if (scroll) {
				setIsSubscribed(false);
				scroll.removeEventListener("pointerdown", pointerDown);
				window.removeEventListener("pointerup", pointerUp);
				window.removeEventListener("pointermove", pointerMove);
			}
		};
	}, []);

	return (
		<div
			id="ContextPanelScroll"
			// ref={scrollRef}
			style={{
				display: "flex",
				position: "relative",
				left: `${left}px`,
			}}
		>
			{children}
		</div>
	);
}
