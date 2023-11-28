import * as React from "react";
import { App } from "App";
import { SidePanelState } from "./SidePanelState";
import { Login } from "./Login";
import { PublicBoards } from "./PublicBoards";
import { useStyle } from "View/useStyle";

export const SidePanelMenuOffset = 10;

export class SidePanel extends React.Component<{
	app: App;
	sidePanelState: SidePanelState;
}> {
	panelRef = React.createRef<HTMLDivElement>();

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
		this.props.sidePanelState.subject.subscribe(this.update);
	}

	componentDidUpdate(): void {}

	componentWillUnmount(): void {
		this.props.sidePanelState.subject.unsubscribe(this.update);
	}

	setWidth = newWidth => {
		this.props.sidePanelState.setWidth(newWidth);
	};

	render(): React.ReactElement | null {
		const app = this.props.app;
		const { isOn, width } = this.props.sidePanelState;
		if (!isOn) {
			return null;
		}
		return (
			<div
				id="SidePanel"
				className="SidePanel"
				style={{
					top: "60px",
					left: "8px",
					width: `${width}px`,
					height: "calc(100% - 90px)",
				}}
			>
				<div className="SidePanelOverflow">
					<ResizableEdge
						panelWidth={this.props.sidePanelState.width}
						setWidth={this.setWidth}
					/>
					<ul className="SidePanelList">
						<Login app={app} />
						<PublicBoards app={app} />
					</ul>
				</div>
			</div>
		);
	}
}

class ResizableEdge extends React.Component {
	resizableRef = React.createRef<HTMLDivElement>();

	isDown = false;

	pointerDown = (event: PointerEvent) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		this.isDown = true;
	};

	pointerMove = (event: PointerEvent) => {
		if (!this.isDown) {
			return;
		}
		const currentX = event.clientX;
		const panelWidth = this.props.panelWidth;
		const newWidth = panelWidth + (currentX - panelWidth);

		this.props.setWidth(newWidth);
	};

	pointerUp = (event: PointerEvent) => {
		event.currentTarget.releasePointerCapture(event.pointerId);
		this.isDown = false;
	};

	pointerCancel = (event: PointerEvent) => {
		event.currentTarget.releasePointerCapture(event.pointerId);
		this.isDown = false;
	};

	componentDidMount() {
		const resizable = this.resizableRef.current;

		if (resizable) {
			resizable.addEventListener("pointerdown", this.pointerDown);
			resizable.addEventListener("pointermove", this.pointerMove);
			resizable.addEventListener("pointerup", this.pointerUp);
			resizable.addEventListener("pointercancel", this.pointerCancel);
		}
	}

	componentWillUnmount() {
		const resizable = this.resizableRef.current;

		if (resizable) {
			resizable.removeEventListener("pointerdown", this.pointerDown);
			resizable.removeEventListener("pointermove", this.pointerMove);
			resizable.removeEventListener("pointerup", this.pointerUp);
			resizable.removeEventListener("pointercancel", this.pointerCancel);
		}
	}

	render() {
		return (
			<div className="SidePanelResizableEdge" ref={this.resizableRef} />
		);
	}
}

export class Menu extends React.Component {
	render(): React.ReactElement | null {
		const { isOpen, onToggle, heading, offset, children } = this.props;

		return (
			<li className="SidePanelListElement">
				<Toggle isOpen={isOpen} offset={offset} onToggle={onToggle}>
					{heading}
				</Toggle>
				<ul
					className="SidePanelMenuList"
					style={{
						display: isOpen ? "block" : "none",
					}}
				>
					{children}
				</ul>
			</li>
		);
	}
}

class Toggle extends React.PureComponent<{
	isOpen: boolean;
	offset: number;
	onToggle: () => void;
	children: React.ReactChildren | string;
}> {
	render(): React.ReactElement | null {
		const { isOpen, offset, onToggle, children } = this.props;

		return (
			<div className="SidePanelMenuToggle" onClick={onToggle}>
				<div
					className="SidePanelMenuToggleContent"
					style={{
						marginLeft: offset * 1,
					}}
				>
					<span id="emailToggle">{isOpen ? "▼" : "►"}</span>
					{children}
				</div>
			</div>
		);
	}
}

useStyle(`
.SidePanel {
	padding-left: 4px;
	padding-right: 8px;
	padding-top: 10px;
	padding-bottom: 10px;
	background-color: white;
	border-radius: 4px;
	box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.12);
	position: absolute;
	z-index: 90;
}

.SidePanelOverflow {
	white-space: nowrap;
	overflow: hidden;
}

.SidePanelList {
	list-style-type: none;
	padding-left: 0;
	pointer: finger;
}

.SidePanelInput {
	display: inline-block;
	font-size: 16px;
	line-height: 16px;
	border: none;
	margin: 0px;
	padding: 0px;
	background-color: rgba(100,150,255,0.3);
}

.SidePanelContextMenu {
	display: inline-block;
}

.SidePanelContextMenu:hover {
	border: 1px solid rgba(100,150,255,0);
}

.SidePanelInput:focus {
	outline: none;
}

.SidePanelResizableEdge {
	position: absolute;
	top: 0;
	right: 0px;
	width: 8px;
	height: 100%;
	cursor: ew-resize;
	touch-action: none;
	border-right: black;
}

.SidePanelListElement {
	cursor: pointer;
	-webkit-user-select: none; /* Safari */
	-ms-user-select: none; /* IE 10 and IE 11 */
	user-select: none; /* Standard syntax */
}

.SidePanelMenuLine {
	padding-top: 4px;
	padding-bottom: 4px;
	cursor: pointer;
	border: 1px solid rgba(100,150,255,0);
	-webkit-user-select: none; /* Safari */
	-ms-user-select: none; /* IE 10 and IE 11 */
	user-select: none; /* Standard syntax */
}

.SidePanelMenuLine:hover {
	color: blue;
	border: 1px solid rgba(100,150,255,1);
}

.SidePanelMenuToggle {
	padding-top: 4px;
	padding-bottom: 4px;
	cursor: pointer;
	border: 1px solid rgba(100,150,255,0);
	-webkit-user-select: none; /* Safari */
	-ms-user-select: none; /* IE 10 and IE 11 */
	user-select: none; /* Standard syntax */
}

.SidePanelMenuToggle:hover {
	color: blue;
	border: 1px solid rgba(100,150,255,1);
}

.SidePanelMenuToggleContent {
	display: flex;
	align-items: center;
}

.SidePanelMenuList {
	list-style-type: none;
	padding-left: 0;
}

`);
