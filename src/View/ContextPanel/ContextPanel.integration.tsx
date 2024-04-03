import { Board } from "Board";
import { Connector, Mbr } from "Board/Items";
import { toggleEdit } from "Board/Items/RichText/RichText";
import { ShapeType } from "Board/Items/Shape/Basic";
import { stickerColors } from "Board/Items/Sticker";
import { Icon } from "View/Icon";
import { CircleIcon } from "View/Icon/CircleIcon";
import { IconIntegration, TextColorIndicator } from "View/Icon/Integration";
import { LockIcon } from "View/Icon/LockIcon";
import { PointerIcon } from "View/Icon/PointerIcon";
import { SwitchPointersIcon } from "View/Icon/SwitchPointersIcon";
import { TextHighlightIcon } from "View/Icon/TextStyle/TextHighlightIcon";
import { UnlockIcon } from "View/Icon/UnlockIcon";
import { StrokeStylePicker } from "View/Pickers/BorderStylePicker";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { ConnectorLineStylePicker } from "View/Pickers/ConnectorLineStylePicker";
import {
	ConnectorEndPointerPicker,
	ConnectorStartPointerPicker,
} from "View/Pickers/ConnectorPointerPicker";
import { FontSizePicker } from "View/Pickers/FontSizePicker.integration";
import { FontStylePicker } from "View/Pickers/FontStylePicker.integration";
import { HorisontalAlignmentPicker } from "View/Pickers/HorizontalAlignmentPicker.integration";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { SliderPicker } from "View/Pickers/SliderPicker";
import { VerticalAlignmentPicker } from "View/Pickers/VerticalAlignmentPicker";
import * as React from "react";
import { toFiniteNumber } from "utils";
import { fitContextPanel } from "../fit";
import { Button } from "./Button.integration";
import { HorisontalSeparator } from "./HorisontalSeparator";
import { VerticalSeparator } from "./VerticalSeparator.integration";

import { applyStyle } from "lib/applyStyle";
import { TextHighlightIndicator } from "View/Icon/Integration/TextHighlightIndicator";

export const IconSize = 24;

export class ContextPanel extends React.Component<
	{
		board: Board;
	},
	{
		menu: string;
		panelRect: Mbr;
	}
> {
	state = {
		menu: "None",
		panelRect: new Mbr(),
	};

	panelRef = React.createRef<HTMLDivElement>();
	menuRef = React.createRef<HTMLDivElement>();

	animationFrameId: number | null = null;

	update = (): void => {
		// this.updateRects();
		this.forceUpdate();
		return;
		if (this.animationFrameId) {
			return; // Function already scheduled to run
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.updateRects();
			this.forceUpdate();
			this.animationFrameId = null;
		});
	};

	disableMenu = (): void => {
		if (this.state.menu !== "None") {
			this.setState({ menu: "None" });
		}
	};

	updateSubscription = {
		observer: this.update,
		subjects: ["selection", "camera"],
	};

	menuSubscription = {
		observer: this.disableMenu,
		subjects: ["selectionItems"],
	};

	componentDidMount(): void {
		this.props.app.subscriptions.add(this.updateSubscription);
		this.props.app.subscriptions.add(this.menuSubscription);
		this.updateRects();
	}

	componentDidUpdate(): void {
		this.updateRects();
	}

	componentWillUnmount(): void {
		this.props.app.subscriptions.remove(this.updateSubscription);
		this.props.app.subscriptions.remove(this.menuSubscription);
	}

	updateRects(): void {
		const { selection, camera } = this.props.board;
		const panel = this.panelRef.current;
		if (panel) {
			const selectionMbr = selection.getMbr();
			if (selectionMbr) {
				const panelRect = fitContextPanel(
					selectionMbr.getTransformed(camera.getMatrix()),
					camera.window.getMbr(),
					Mbr.fromDomRect(panel.getBoundingClientRect()),
				);
				const isDifferent = !this.state.panelRect.isEqual(panelRect);
				if (isDifferent) {
					this.setState({ panelRect });
				}
			}
		}
	}

	toggleMenu = (menu: string): void => {
		this.setState({ menu: this.state.menu === menu ? "None" : menu });
	};

	render(): React.ReactElement | null {
		const { board } = this.props;
		if (!board.selection.isOn) {
			return null;
		}
		const { menu, panelRect } = this.state;
		const context = board.selection.getContext();
		if (context === "None") {
			return null;
		}
		const windowHeight = board.camera.window.height;
		return (
			<div
				id="ContextPanel"
				className="ContextPanelContainer"
				ref={this.panelRef}
				style={{
					left: `${this.state.panelRect.left}px`,
					top: `${this.state.panelRect.top}px`,
					userSelect: "none",
				}}
			>
				<Scroll board={board} panelRef={this.panelRef}>
					<Edit board={board} />

					<StartPointer
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						pointer={board.selection.getStartPointerStyle()}
					/>
					<SwitchPointers
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
					/>
					<EndPointer
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						pointer={board.selection.getEndPointerStyle()}
					/>
					<ConnectorType
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<ConnectorAddText
						board={board}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<ConnectorStyleSeparator board={board} />

					<ItemType
						board={board}
						toggleMenu={this.toggleMenu}
						color={board.selection.getFillColor()}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<StrokeStyle
						board={board}
						toggleMenu={this.toggleMenu}
						color={board.selection.getStrokeColor()}
						width={board.selection.getStrokeWidth()}
						menu={this.state.menu}
						windowHeight={windowHeight}
						panelMbr={this.state.panelRect}
					/>
					<FillStyle
						board={board}
						toggleMenu={this.toggleMenu}
						color={board.selection.getFillColor()}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<ItemTypeSeparator board={board} />

					<InsertShape
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<AddText
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<ConnectorFeaturesSeparator board={board} />

					<FontFamily
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<FontSize
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						fontSize={board.selection.getFontSize()}
					/>
					<FontStyle
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<TextAlignment
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<AddList
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<TextFeaturesSeparator board={board} />

					<TextColor
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						color={board.selection.getFontColor()}
					/>
					<VerticalSeparator />

					<TextHighlight
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						color={board.selection.getFontHighlight()}
					/>

					<StickerFillStyle
						board={board}
						toggleMenu={this.toggleMenu}
						color={board.selection.getFillColor()}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>

					<Lock board={board} />

					<BringBackForward board={board} />
					<VerticalSeparator />
					<RestOptionsMenu
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						toggleMenu={this.toggleMenu}
						board={board}
					/>
				</Scroll>
			</div>
		);
	}
}

class Scroll extends React.PureComponent<
	{
		board: Board;
		panelRef: React.RefObject<HTMLDivElement>;
	},
	{
		left: number;
	}
> {
	state = {
		left: 0,
	};

	scrollRef = React.createRef<HTMLDivElement>();

	isDown = false;
	isSubscribed = false;

	componentDidMount(): void {
		this.subscribeToScroll();
	}

	componentDidUpdate(): void {
		this.subscribeToScroll();
	}

	subscribeToScroll(): void {
		const panel = this.props.panelRef.current;
		if (panel && !this.isSubscribed) {
			this.isSubscribed = true;
			panel.addEventListener("pointerdown", this.pointerDown);
			window.addEventListener("pointerup", this.pointerUp);
			window.addEventListener("pointermove", this.pointerMove);
		}
	}

	componentWillUnmount(): void {
		const scroll = this.scrollRef.current;
		if (scroll) {
			this.isSubscribed = false;
			scroll.removeEventListener("pointerdown", this.pointerDown);
			window.removeEventListener("pointerup", this.pointerUp);
			window.removeEventListener("pointermove", this.pointerMove);
		}
	}

	pointerDown = (): void => {
		this.isDown = true;
	};

	pointerUp = (): void => {
		this.isDown = false;
	};

	pointerMove = (): void => {
		if (!this.isDown) {
			return;
		}

		const newLeft = this.state.left + this.props.board.pointer.delta.x;
		const panel = this.props.panelRef.current;
		const scroll = this.scrollRef.current;

		if (!panel || !scroll) {
			return;
		}


		const panelWidth = panel.getBoundingClientRect().width;
		const scrollWidth = scroll.scrollWidth + 20;

		let left = newLeft;

		if (newLeft + scrollWidth < panelWidth) {
			left = panelWidth - scrollWidth;
		} else if (newLeft > 0) {
			left = 0;
		}

		this.setState({
			left,
		});
	};

	render(): React.ReactNode {
		const { left } = this.state;
		const { children } = this.props;

		return (
			<div
				id="ContextPanelScroll"
				ref={this.scrollRef}
				style={{
					display: "flex",
					position: "relative",
					left: `${left}px`,
					height: "100%",
					gap: '4px',
				}}
			>
				{children}
			</div>
		);
	}
}

const ContextPanelStyle = document.createElement("style");

ContextPanelStyle.innerHTML = `
.ContextPanelContainer {
	position: absolute;
	height: 32px;
	cursor: pointer;
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05);
	padding: 4px;
}

.ContextPanelMenuContainer {
	position: relative;
	display: inline-block;
  height: 100%;
}
  
.ContextPanelMenu {
	visibility: hidden;
	background-color: white;
	color: black;
	text-align: center;
	top: 100%;
	left: 50%;
	z-index: 1;
	position: absolute;
  padding: 4px;
	display: flex;
	flex-wrap: wrap;
	border-radius: 8px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05);
	background: #fff;
}
`;

document.head.appendChild(ContextPanelStyle);

export function RestOptionsMenu({
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	board,
}: {
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	board: Board;
}): React.ReactElement {
	const menuRef = React.useRef<HTMLDivElement>(null);
	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				onClick={() => toggleMenu("RestMenu")}
				className="RestOptionsIcon"
				width={32}
				height={32}
				margin={0}
			>
				{/* <Icon name="Rectangle" width={IconSize} height={IconSize} /> */}
				<IconIntegration iconName="Dots"/>
			</Button>
			<div
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "flex",
					flexDirection: "column",
					width: "290px",
					// height: "170px",
					visibility: menu === "RestMenu" ? "visible" : "hidden",
				}}
			>
				<Duplicate board={board} />
				<Delete board={board} />
			</div>
		</ButtonWithMenu>
	);
}

export function RestOptionsMenuItem({
	children,
	hotkey,
	onClick,
	id,
}: React.PropsWithChildren<{
	hotkey: string;
	onClick: React.MouseEventHandler;
	id: string;
}>): React.ReactElement {
	return (
		<Button
			style={{
				fontSize: "16px",
				display: "flex",
				justifyContent: "space-between",
				padding: "6px 12px",
				color: "rgba(0, 0, 0, .8)",
			}}
			margin={0}
			height={36}
			width={"100%"}
			id={id}
			onClick={onClick}
		>
			<span>{children}</span>
			<span style={{ color: "rgba(0, 0, 0, .25)" }}>{hotkey}</span>
		</Button>
	);
}

applyStyle(`
  .RestOptions .RestOptionsList {
    position: absolute;
    left: -10%;
    top: 120%;
    box-shadow: 0 0px 2px 0 rgba(34, 34, 34, 0.02), 0 1px 4px 0 rgba(34, 34, 34, 0.03), 0 1px 8px 0 rgba(34, 34, 34, 0.03), 0 2px 15px 0 rgba(34, 34, 34, 0.04), 0 4px 28px 0 rgba(34, 34, 34, 0.04), 0 9px 67px 0 rgba(34, 34, 34, 0.07);
    background: #fff;
    border-radius: 8px;
    padding: 4px;
    margin: 0;
    width: 270px;
    list-style-type: none;
  }

  .RestOptionsList .RestOptionsItem {
    width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
  }
`);

class ButtonWithMenu extends React.PureComponent<{
	panelMbr: Mbr;
	windowHeight: number;
	menuRef: React.RefObject<HTMLDivElement>;
	children: React.ReactNode;
}> {
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

function Edit({ board }: { board: Board }): React.ReactElement | null {
	if (board.selection.getContext() !== "SelectUnderPointer") {
		return null;
	}
	return (
		<Button
			id="ContextPanelEdit"
			onClick={() => {
				board.selection.editSelected();
			}}
			title="Edit"
			width={32}
				height={32}
				margin={0}
				tipOnTop
		>
			{"Edit"}
		</Button>
	);
}

function StartPointer({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	pointer,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	pointer: string;
}): React.ReactElement | null {
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeStartPointer"
				onClick={() => {
					toggleMenu("StartPointer");
				}}
				title="Change Start Pointer"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<PointerIcon
					type={pointer}
					width={IconSize}
					height={IconSize}
				/>
			</Button>
			<div
				id="StartPointerMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "100px",
					marginLeft: "-50px",
					visibility: menu === "StartPointer" ? "visible" : "hidden",
				}}
			>
				<ConnectorStartPointerPicker
					onPick={type => {
						board.selection.setStartPointerStyle(type);
						toggleMenu("None");
					}}
				></ConnectorStartPointerPicker>
			</div>
		</ButtonWithMenu>
	);
}

function SwitchPointers({
	board,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
}): React.ReactElement | null {
	// return null;
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}

	return (
		<Button
			id="SwitchPointers"
			onClick={() => {
				const start = board.selection.getStartPointerStyle();
				const end = board.selection.getEndPointerStyle();
				board.selection.setStartPointerStyle(end);
				board.selection.setEndPointerStyle(start);
			}}
			title="Switch Pointers"
			width={32}
				height={32}
				margin={0}
				tipOnTop
		>
			<SwitchPointersIcon width={IconSize} height={IconSize} />
		</Button>
	);
}

function EndPointer({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	pointer,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	pointer: string;
}): React.ReactElement | null {
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeEndPointer"
				onClick={() => {
					toggleMenu("EndPointer");
				}}
				title="Change End Pointer"
				width={32}
				height={32}
				margin={0}
			>
				<PointerIcon
					type={pointer}
					width={IconSize}
					height={IconSize}
				/>
			</Button>
			<div
				id="EndPointerMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "100px",
					marginLeft: "-50px",
					visibility: menu === "EndPointer" ? "visible" : "hidden",
				}}
			>
				<ConnectorEndPointerPicker
					onPick={type => {
						board.selection.setEndPointerStyle(type);
						toggleMenu("None");
					}}
				></ConnectorEndPointerPicker>{" "}
			</div>
		</ButtonWithMenu>
	);
}

function ConnectorAddText({
	board,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeConnectorType"
				onClick={() => {
					if (
						board.selection.getContext() === "EditTextUnderPointer"
					) {
						board.selection.setContext("EditUnderPointer");
						board.items.subject.publish(board.items);
						return;
					}
					const connector = board.selection.items.getItemsByItemTypes(
						["Connector"],
					)[0] as Connector;
					if (!connector) {
						return;
					}
					board.selection.setTextToEdit(connector);
					board.selection.setContext("EditTextUnderPointer");
					board.items.subject.publish(board.items);
				}}
				title="Text"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<Icon name="AddText" width={IconSize} height={IconSize} />
			</Button>
		</ButtonWithMenu>
	);
}

function ConnectorType({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeConnectorType"
				onClick={() => {
					toggleMenu("ConnectorType");
				}}
				title="Connector type"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<Icon name="curved" width={IconSize} height={IconSize} />
			</Button>
			<div
				id="ConnectorTypeMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "100px",
					marginLeft: "-50px",
					visibility: menu === "ConnectorType" ? "visible" : "hidden",
				}}
			>
				<ConnectorLineStylePicker
					onPick={type => {
						board.selection.setConnectorLineStyle(type);
						toggleMenu("None");
					}}
				></ConnectorLineStylePicker>
			</div>
		</ButtonWithMenu>
	);
}

function ConnectorStyleSeparator({
	board,
}: {
	board: Board;
}): React.ReactElement | null {
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}

function ItemType({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
}): React.ReactElement | null {
	const canChangeItemType = board.selection.items.isItemTypes(["Shape"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangeItemType
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeItemType"
				onClick={() => {
					toggleMenu("ItemType");
				}}
				title="Change type"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "120px",
					marginLeft: "-60px",
					visibility: menu === "ItemType" ? "visible" : "hidden",
				}}
			>
				<ShapePicker
					onPick={(type: ShapeType) => {
						board.selection.setShapeType(type);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function ItemTypeSeparator({
	board,
}: {
	board: Board;
}): React.ReactElement | null {
	const canChangeItemType = board.selection.items.isItemTypes(["Shape"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangeItemType
	) {
		return null;
	}
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}

function InsertShape({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	return null;
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeItemType"
				onClick={() => {
					toggleMenu("ItemType");
				}}
				title="Change type"
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "40px",
					marginLeft: "-80px",
					visibility: menu === "FontStyle" ? "visible" : "hidden",
				}}
			>
				<ShapePicker
					onPick={(type: ShapeType) => {
						board.selection.setShapeType(type);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function AddText({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	return null;
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeItemType"
				onClick={() => {
					toggleMenu("ItemType");
				}}
				title="Change type"
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "40px",
					marginLeft: "-80px",
					visibility: menu === "FontStyle" ? "visible" : "hidden",
				}}
			>
				<ShapePicker
					onPick={(type: ShapeType) => {
						board.selection.setShapeType(type);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function ConnectorFeaturesSeparator({
	board,
}: {
	board: Board;
}): React.ReactElement | null {
	return null;
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}

function FontFamily({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	return null;
	if (
		board.selection.getContext() !== "EditTextUnderPointer" ||
		!board.selection.canChangeText()
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<div style={{ display: "flex" }}>
				<input
					onClick={() => {
						toggleMenu("FontSize");
					}}
					type="number"
					min="10"
					max="288"
					value={`${fontSize}`}
					onChange={(
						event: React.ChangeEvent<HTMLInputElement>,
					): void => {
						board.selection.setFontSize(
							parseInt(event.target.value),
						);
					}}
					style={{
						textAlign: "center",
						maxWidth: "50px",
						fontSize: "14px",
					}}
				/>
			</div>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "40px",
					marginLeft: "-80px",
					visibility: menu === "FontStyle" ? "visible" : "hidden",
				}}
			>
				<FontSizePicker
					onPick={(size: number) => {
						board.selection.setFontSize(size);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

class FontSize extends React.PureComponent<{
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	fontSize: number;
}> {
	menuRef = React.createRef<HTMLDivElement>();
	state = { fontSize: this.props.fontSize };
	updateFontSize = (): void => {
		this.setState({ fontSize: this.props.board.selection.getFontSize() });
	};
	componentDidMount(): void {
		// this.props.board.selection.itemSubject.subscribe(this.updateFontSize);
	}
	componentWillUnmount(): void {
		// this.props.board.selection.itemSubject.unsubscribe(this.updateFontSize);
	}
	render(): React.ReactElement | null {
		const { board, toggleMenu, menu, panelMbr, windowHeight, fontSize } =
			this.props;

		if (board.selection.getContext() === "SelectUnderPointer") {
			return null;
		}

		if (
			board.selection.getContext() !== "EditTextUnderPointer" &&
			!board.selection.canChangeText()
		) {
			return null;
		}

		return (
			<ButtonWithMenu
				panelMbr={panelMbr}
				windowHeight={windowHeight}
				menuRef={this.menuRef}
			>
				<div
					className="FontSizeInputWrapper"
					style={{ height: "100%" }}
				>
					<input
						onClick={() => {
							toggleMenu("FontSize");
						}}
						type="number"
						min="10"
						max="288"
						value={`${this.state.fontSize}`}
						onInput={event => {
							event.preventDefault();
							return;
						}}
						onChange={(
							event: React.ChangeEvent<HTMLInputElement>,
						): void => {
							const size = toFiniteNumber(
								parseInt(event.target.value),
							);
							this.setState({ fontSize: size });
							if (size < 10 || size > 288) {
								return;
							}
							board.selection.setFontSize(size);
						}}
						onFocus={() => {
							toggleEdit(true);
						}}
						onBlur={() => {
							toggleEdit(false);
						}}
						style={{
							height: "100%",
							display: "flex",
							textAlign: "center",
							maxWidth: "45px",
							fontSize: "16px",
							fontWeight: 500,
							justifyContent: "center",
							alignItems: "center",
							padding: "0px",
							outline: "none",
							border: "none",
						}}
					/>
				</div>
				<div
					id="FillStyleMenu"
					ref={this.menuRef}
					className="ContextPanelMenu"
					style={{
						width: "40px",
						marginLeft: "-25px",
						visibility: menu === "FontSize" ? "visible" : "hidden",
					}}
				>
					<FontSizePicker
						onPick={(size: number) => {
							board.selection.setFontSize(size);
							toggleMenu("None");
						}}
					/>
				</div>
			</ButtonWithMenu>
		);
	}
}

function FontStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeFontStyle"
				onClick={() => {
					toggleMenu("FontStyle");
				}}
				title="Font Style"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				{/* <BoldUnderlineIcon width={IconSize} height={IconSize} /> */}
				<IconIntegration iconName="TextFormat"/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					padding: '4px',
					display: 'flex',
					gap: '4px',
					width: "max-content",
					marginLeft: "-80px",
					visibility: menu === "FontStyle" ? "visible" : "hidden",
				}}
			>
				<FontStylePicker
					onPick={style => {
						board.selection.setFontStyle([style]);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function TextAlignment({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	const connector = board.selection.items.getSingle();
	const isConnector = connector instanceof Connector;
	
	
	if (isConnector) {
		return null;
	}
	
	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
		) {
			return null;
		}
		
		const menuRef = React.useRef<HTMLDivElement>(null);
		
		
		return (
			<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextAlignment"
				onClick={() => {
					toggleMenu("TextAlignment");
				}}
				title="Text Alignment"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				{/* <Icon
					name={`HorisontalAlignCenter`}
					width={IconSize}
					height={IconSize}
				/> */}
				<IconIntegration iconName="TextAlignCenter"/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: '4px',
					flexWrap: "nowrap",
					marginLeft: "-60px",
					visibility: menu === "TextAlignment" ? "visible" : "hidden",
				}}
			>
				<HorisontalAlignmentPicker
					onPick={alignment => {
						board.selection.setHorisontalAlignment(alignment);
						toggleMenu("None");
					}}
				/>
				{/* <HorisontalSeparator /> */}
				{/* <VerticalAlignmentPicker
					onPick={alignment => {
						board.selection.setVerticalAlignment(alignment);
						toggleMenu("None");
					}}
				/> */}
			</div>
		</ButtonWithMenu>
	);
}

function AddList({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
}): React.ReactElement | null {
	return null;
	if (
		board.selection.getContext() !== "EditTextUnderPointer" ||
		!board.selection.canChangeText()
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextAlignment"
				onClick={() => {
					toggleMenu("TextAlignment");
				}}
				title="Text Alignment"
			>
				<Icon
					name="HorisontalAlignCenter"
					width={IconSize}
					height={IconSize}
				/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "120px",
					marginLeft: "-60px",
					visibility: menu === "TextAlignment" ? "visible" : "hidden",
				}}
			>
				<HorisontalAlignmentPicker
					onPick={alignment => {
						board.selection.setHorisontalAlignment(alignment);
						toggleMenu("None");
					}}
				/>
				<HorisontalSeparator />
				<VerticalAlignmentPicker
					onPick={alignment => {
						board.selection.setVerticalAlignment(alignment);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function TextFeaturesSeparator({
	board,
}: {
	board: Board;
}): React.ReactElement | null {
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	return null;
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}

function TextColor({
	board,
	toggleMenu,
	menu,
	panelMbr,
	color,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
}): React.ReactElement | null {
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextColor"
				onClick={() => {
					toggleMenu("TextColor");
				}}
				title="Text color"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				{/* <TextColorIcon
					color={color}
					width={IconSize}
					height={IconSize}
				/> */}
				{/* <IconIntegration iconName="TextColorIndicator"/> */}
				<TextColorIndicator color={color}/>
			</Button>
			<div
				id="TextColorMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "TextColor" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					allowNone={false}
					onPick={(color: string) => {
						board.selection.setFontColor(color);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function TextHighlight({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	color: string;
}): React.ReactElement | null {
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextHighlight"
				onClick={() => {
					toggleMenu("TextHighlight");
				}}
				title="Text highlight"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				{/* <TextHighlightIcon
					color={color}
					width={IconSize}
					height={IconSize}
				/> */}
				<TextHighlightIndicator color={color} />
			</Button>
			<div
				id="TextColorMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "TextHighlight" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					allowNone={true}
					onPick={(color: string) => {
						board.selection.setFontHighlight(color);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function TextColorSeparator({
	board,
}: {
	board: Board;
}): React.ReactElement | null {
	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}
	return null;
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}

function StrokeStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
	width,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	color: string;
	width: number;
}): React.ReactElement | null {
	const context = board.selection.getContext();

	const canChangeBorderStyle = board.selection.items.isItemTypes([
		"Shape",
		"Drawing",
	]);
	if (context === "SelectUnderPointer" || !canChangeBorderStyle) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeStrokeStyle"
				onClick={() => {
					toggleMenu("StrokeStyle");
				}}
				title="Stroke Style"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<CircleIcon
					fill="white"
					stroke={color}
					strokeWidth={12}
					width={20}
					height={20}
				/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "StrokeStyle" ? "visible" : "hidden",
				}}
			>
				<SliderPicker
					onPick={width => {
						board.selection.setStrokeWidth(width);
					}}
					width={width}
				/>
				<StrokeStylePicker
					onPick={style => {
						board.selection.setStrokeStyle(style);
						toggleMenu("None");
					}}
				/>
				<ColorPicker
					allowNone={false}
					onPick={(color: string) => {
						board.selection.setStrokeColor(color);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function FillStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	color,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
}): React.ReactElement | null {
	const context = board.selection.getContext();
	const canChangeFillStyle = board.selection.items.isItemTypes(["Shape"]);
	if (context === "SelectUnderPointer" || !canChangeFillStyle) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeFillStyle"
				onClick={() => {
					toggleMenu("FillStyle");
				}}
				title="Fill Style"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<CircleIcon
					strokeWidth={1}
					fill={color}
					stroke="rgba(0,0,0,1)"
					width={IconSize}
					height={IconSize}
				/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility: menu === "FillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					allowNone={true}
					onPick={(color: string) => {
						board.selection.setFillColor(color);
						toggleMenu("None");
					}}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function StickerFillStyle({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,

	color,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
}): React.ReactElement | null {
	const context = board.selection.getContext();
	const canChangeFillStyle = board.selection.items.isItemTypes(["Sticker"]);
	if (context === "SelectUnderPointer" || !canChangeFillStyle) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeStickerFillStyle"
				onClick={() => {
					toggleMenu("StickerFillStyle");
				}}
				title="Sticker Fill Style"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<CircleIcon
					strokeWidth={1}
					fill={color}
					stroke="rgba(0,0,0,1)"
					width={IconSize}
					height={IconSize}
				/>
			</Button>
			<div
				id="StickerFillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
					marginLeft: "-80px",
					visibility:
						menu === "StickerFillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					onPick={(color: string) => {
						board.selection.setFillColor(color);
						toggleMenu("None");
					}}
					list={stickerColors}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function PathStyleSeparator({
	board,
}: {
	board: Board;
}): React.ReactElement | null {
	const canChangeBorderStyle = board.selection.items.isItemTypes([
		"Shape",
		"Drawing",
	]);
	const context = board.selection.getContext();
	const canChangeFillStyle = board.selection.items.isItemTypes([
		"Shape",
		"Sticker",
	]);
	if (
		context === "SelectUnderPointer" ||
		(!canChangeFillStyle && !canChangeBorderStyle)
	) {
		return null;
	}
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}

function Duplicate({ board }: { board: Board }): React.ReactElement | null {
	return (
		<RestOptionsMenuItem
			id="DuplicateSelection"
			onClick={() => {
				board.selection.duplicate();
			}}
			hotkey="D"
		>
			Дублировать
		</RestOptionsMenuItem>
	);
}

function Delete({ board }: { board: Board }): React.ReactElement | null {
	return (
		<RestOptionsMenuItem
			id="DeleteSelection"
			onClick={() => {
				board.selection.removeFromBoard();
			}}
			hotkey="Delete"
		>
			Удалить
		</RestOptionsMenuItem>
	);
}

function Lock({ board }: { board: Board }): React.ReactElement | null {
	return null;
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	if (board.selection.isLocked()) {
		return (
			<Button
				id="UnlockSelection"
				onClick={() => {
					board.selection.unlock();
				}}
				title="Unlock"
			>
				<UnlockIcon width={IconSize} height={IconSize} />
			</Button>
		);
	} else {
		return (
			<Button
				id="LockSelection"
				onClick={() => {
					board.selection.lock();
				}}
				title="Lock"
			>
				<LockIcon width={IconSize} height={IconSize} />
			</Button>
		);
	}
}

function BringBackForward({
	board,
	panelMbr,
	windowHeight,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;

	menu: string;
	panelMbr: Mbr;
	color: string;
	windowHeight: number;
}): React.ReactElement | null {
	return null;
	const menuRef = React.useRef<HTMLDivElement>(null);
	const context = board.selection.getContext();
	if (context !== "SelectUnderPointer" && context !== "SelectByRect") {
		return null;
	}
	const items = board.selection.items;

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="BringBack"
				onClick={() => {
					for (const item of items.list()) {
						board.items.index.sendToBack(item);
					}
				}}
				title="Send to back"
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</Button>
			<Button
				id="BringToFront"
				onClick={() => {
					for (const item of items.list()) {
						board.items.index.bringToFront(item);
					}
				}}
				title="Bring to front"
			>
				<Icon name={"Rectangle"} width={IconSize} height={IconSize} />
			</Button>
		</ButtonWithMenu>
	);
}
