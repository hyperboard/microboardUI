import * as React from "react";
import { App } from "App";
import { Subject } from "Subject";
import { useStyle } from "View/useStyle";
import { SidePanelState } from "View/SidePanel/SidePanelState";

export class ContextMenuState {
	subject = new Subject<SidePanelState>();
	isOn = false;
	position = { x: 0, y: 0 };
	options = [];
	targetId: string;

	toggle({
		targetId,
		position,
		options,
	}: {
		targetId: string;
		position: { x: number; y: number };
		options: { label: string; action: () => {} }[];
	}): void {
		if (this.targetId === targetId) {
			this.isOn = !this.isOn;
		} else {
			this.isOn = true;
		}
		this.targetId = targetId;
		this.position = position;
		this.options = options;
		this.subject.publish(this);
	}

	toggleOff(): void {
		this.isOn = false;
		this.subject.publish(this);
	}

	setPosition(x, y): void {
		this.position = { x, y };
		this.subject.publish(this);
	}
}

export class ContextMenu extends React.Component<{
	app: App;
	contextMenuState: ContextMenuState;
}> {
	menuRef = React.createRef();

	animationFrameId: number | null = null;

	update = (): void => {
		if (this.animationFrameId) {
			return; // Function already scheduled to run
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.forceUpdate();
			this.animationFrameId = null;
		});
	};

	componentDidMount(): void {
		this.props.contextMenuState.subject.subscribe(this.update);
		this.ensureMenuFitsInScreen();
	}

	componentDidUpdate(): void {
		this.ensureMenuFitsInScreen();
	}

	componentWillUnmount(): void {
		this.props.contextMenuState.subject.unsubscribe(this.update);
	}

	ensureMenuFitsInScreen = () => {
		if (!this.menuRef.current) {
			return;
		}

		const { innerWidth, innerHeight } = window;
		const { offsetWidth, offsetHeight } = this.menuRef.current;
		const { x, y } = this.props.contextMenuState.position;
		let newX, newY;
		if (x + offsetWidth > innerWidth) {
			newX = x - offsetWidth;
		}
		if (y + offsetHeight > innerHeight) {
			newY = y - offsetHeight;
		}
		if (newX !== x || newY !== y) {
			this.props.contextMenuState.setPosition(x, y);
		}
	};

	onSelect = (action: () => {}): void => {
		action();
		this.props.contextMenuState.toggleOff();
	};

	render(): React.ReactElement | null {
		const app = this.props.app;
		const { isOn, options, position } = this.props.contextMenuState;
		if (!isOn) {
			return null;
		}

		return (
			<ul
				ref={this.menuRef}
				style={{
					top: `${position.y}px`,
					left: `${position.x}px`,
					position: "absolute",
				}}
				className="ContextMenu"
			>
				{options.map(option => (
					<li
						key={option.label}
						onClick={() => {
							this.onSelect(option.action);
						}}
						className="ContextMenuItem"
					>
						{option.label}
					</li>
				))}
			</ul>
		);
	}
}

useStyle(`
.ContextMenu {
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    padding: 4px 0;
    list-style: none;
	margin: 0;
}

.ContextMenuItem {
    padding: 4px 16px;
	color: black;
    border: 1px solid transparent;
    cursor: pointer;
}

.ContextMenuItem:not(:last-child) {
    border-bottom: 1px solid #dddddd;
}

.ContextMenuItem:hover {
	color: blue;
    border: 1px solid blue;
}
`);
