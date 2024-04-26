import { Mbr } from "Board/Items";
import React from "react";

type ButtonWithMenuProps = {
	panelMbr: Mbr;
	windowHeight: number;
	menuRef: React.RefObject<HTMLDivElement>;
	children: React.ReactNode;
};

export class ButtonWithMenu extends React.PureComponent<ButtonWithMenuProps> {
	componentDidMount(): void {
		this.fitMenuAroundPanel(
			this.props.menuRef,
			this.props.panelMbr,
			this.props.windowHeight,
		);
	}

	componentDidUpdate(): void {
		this.fitMenuAroundPanel(
			this.props.menuRef,
			this.props.panelMbr,
			this.props.windowHeight,
		);
	}

	fitMenuAroundPanel(
		menuRef: React.RefObject<HTMLDivElement>,
		panelMbr: Mbr,
		windowHeight: number,
	): void {
		const menu = menuRef.current;
		if (!menu) {
			return;
		}
		const menuHeight = menu.getBoundingClientRect().height;
		let top = panelMbr.bottom;
		if (top + menuHeight > windowHeight) {
			top = panelMbr.top - menuHeight;
		}
		menu.style.top = `${top - panelMbr.top}px`;
	}

	render(): React.ReactElement | null {
		return (
			<div className="ContextPanelMenuContainer">
				{this.props.children}
			</div>
		);
	}
}
