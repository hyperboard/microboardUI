import { Board } from "Board";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";

type ScrollProps = PropsWithChildren<{
	board: Board;
	panelRef: React.RefObject<HTMLDivElement>;
}>;

export function Scroll({ board, panelRef, children }: ScrollProps) {
	const [left, setLeft] = useState(0);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isDown, setIsDown] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
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
			ref={scrollRef}
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

// class Scroll extends React.PureComponent<ScrollProps, ScrollState> {
// 	state = {
// 		left: 0,
// 	};

// 	scrollRef = React.createRef<HTMLDivElement>();

// 	isDown = false;
// 	isSubscribed = false;

// 	componentDidMount(): void {
// 		this.subscribeToScroll();
// 	}

// 	componentDidUpdate(): void {
// 		this.subscribeToScroll();
// 	}

// 	subscribeToScroll(): void {
// 		const panel = this.props.panelRef.current;
// 		if (panel && !this.isSubscribed) {
// 			this.isSubscribed = true;
// 			panel.addEventListener("pointerdown", this.pointerDown);
// 			window.addEventListener("pointerup", this.pointerUp);
// 			window.addEventListener("pointermove", this.pointerMove);
// 		}
// 	}

// 	componentWillUnmount(): void {
// 		const scroll = this.scrollRef.current;
// 		if (scroll) {
// 			this.isSubscribed = false;
// 			scroll.removeEventListener("pointerdown", this.pointerDown);
// 			window.removeEventListener("pointerup", this.pointerUp);
// 			window.removeEventListener("pointermove", this.pointerMove);
// 		}
// 	}

// 	pointerDown = (): void => {
// 		this.isDown = true;
// 	};

// 	pointerUp = (): void => {
// 		this.isDown = false;
// 	};

// 	pointerMove = (): void => {
// 		if (!this.isDown) {
// 			return;
// 		}

// 		const newLeft = this.state.left + this.props.board.pointer.delta.x;
// 		const panel = this.props.panelRef.current;
// 		const scroll = this.scrollRef.current;

// 		if (!panel || !scroll) {
// 			return;
// 		}

// 		const panelWidth = panel.getBoundingClientRect().width;
// 		const scrollWidth = scroll.scrollWidth + 20;

// 		let left = newLeft;

// 		if (newLeft + scrollWidth < panelWidth) {
// 			left = panelWidth - scrollWidth;
// 		} else if (newLeft > 0) {
// 			left = 0;
// 		}

// 		this.setState({
// 			left,
// 		});
// 	};

// 	render(): React.ReactNode {
// 		const { left } = this.state;
// 		const { children } = this.props;

// 		return (
// 			<div
// 				id="ContextPanelScroll"
// 				ref={this.scrollRef}
// 				style={{
// 					display: "flex",
// 					position: "relative",
// 					left: `${left}px`,
// 				}}
// 			>
// 				{children}
// 			</div>
// 		);
// 	}
// }
