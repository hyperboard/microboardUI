import { Board } from "Board";
import * as React from "react";
import { Connector, Mbr } from "Board/Items";
import { fitContextPanel } from "../fit";
import { ShapeType } from "Board/Items/Shape/Basic";
import { Icon } from "View/Icon";
import { CircleIcon } from "View/Icon/CircleIcon";
import { DeleteIcon } from "View/Icon/DeleteIcon";
import { BoldUnderlineIcon } from "View/Icon/TextStyle/BoldUnderlineIcon";
import { TextColorIcon } from "View/Icon/TextStyle/TextColorIcon";
import { TextHighlightIcon } from "View/Icon/TextStyle/TextHighlightIcon";
import { StrokeStylePicker } from "View/Pickers/BorderStylePicker";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { FontSizePicker } from "View/Pickers/FontSizePicker";
import { FontStylePicker } from "View/Pickers/FontStylePicker";
import { HorisontalAlignmentPicker } from "View/Pickers/HorisontalAlignmentPicker";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { VerticalAlignmentPicker } from "View/Pickers/VerticalAlignmentPicker";
import { Button } from "./Button";
import { HorisontalSeparator } from "./HorisontalSeparator";
import { LockIcon } from "View/Icon/LockIcon";
import { UnlockIcon } from "View/Icon/UnlockIcon";
import { DuplicateIcon } from "View/Icon/DuplicateIcon";
import { SwitchPointersIcon } from "View/Icon/SwitchPointersIcon";
import {
	ConnectorEndPointerPicker,
	ConnectorStartPointerPicker,
} from "View/Pickers/ConnectorPointerPicker";
import { PointerIcon } from "View/Icon/PointerIcon";
import { ConnectorLineStylePicker } from "View/Pickers/ConnectorLineStylePicker";
import { SliderPicker } from "View/Pickers/SliderPicker";
import { toggleEdit } from "Board/Items/RichText/RichText";
import { toFiniteNumber } from "utils";
import { Sticker, stickerColors } from "Board/Items/Sticker";

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
					// overflow: "hidden",
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
					<TextHighlight
						board={board}
						toggleMenu={this.toggleMenu}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
						color={board.selection.getFontHighlight()}
					/>
					<TextColorSeparator board={board} />

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
					<StickerFillStyle
						board={board}
						toggleMenu={this.toggleMenu}
						color={board.selection.getFillColor()}
						menu={menu}
						panelMbr={panelRect}
						windowHeight={windowHeight}
					/>
					<PathStyleSeparator board={board} />

					<Duplicate board={board} />
					<Delete board={board} />
					<Lock board={board} />

					<BringBackForward board={board} />
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
	height: 44px;
	cursor: pointer;
	background-color: white;
	border-radius: 4px;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
	padding: 2px 10px;
	max-width: 80%;
}

.ContextPanelMenuContainer {
	position: relative;
	display: inline-block;
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
	padding-left: 5px;
	padding-right: 5px;
	padding-top: 2px;
	padding-bottom: 2px;
	display: flex;
	flex-wrap: wrap;
	border-radius: 4px;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
}
`;

document.head.appendChild(ContextPanelStyle);

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
					board.selection.editText();
				}}
				title="Text"
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
	fontSize: number | string;
	max?: number;
}> {
	menuRef = React.createRef<HTMLDivElement>();
	state = {
		fontSize: this.props.fontSize,
		max: this.props.max,
		itemType: "",
		inputType: "number",
	};
	updateFontSize = (): void => {
		this.setState({ fontSize: this.props.board.selection.getFontSize() });
	};
	updateAutosizeSettings = (): void => {
		const singleItem = this.props.board.selection.items.getSingle();
		if (singleItem && singleItem.itemType === "Sticker") {
			const isAutosize = (singleItem as Sticker).text.getAutosize();
			const innerTextFontSize = (
				singleItem as Sticker
			).text.getFontSize();
			const maxFontSize = (singleItem as Sticker).text.getMaxFontSize();
			this.setState({
				max: maxFontSize,
				fontSize: isAutosize ? "Auto" : innerTextFontSize,
				itemType: "Sticker",
				inputType: isAutosize ? "string" : "number",
			});
		}
		if (singleItem && ["Shape"].indexOf(singleItem?.itemType) !== -1) {
			const maxFontSize = (singleItem as Sticker).text.getMaxFontSize();
			this.setState({
				itemType: singleItem?.itemType,
				fontSize: singleItem?.text?.getFontSize(),
				inputType: "number",
				max: maxFontSize,
			});
		}
	};
	componentDidMount(): void {
		// this.props.board.selection.itemSubject.subscribe(this.updateFontSize);
		this.updateAutosizeSettings();
	}
	componentWillUnmount(): void {
		// this.props.board.selection.itemSubject.unsubscribe(this.updateFontSize);
	}
	componentDidUpdate(): void {
		this.updateAutosizeSettings();
	}
	render(): React.ReactElement | null {
		const {
			board,
			toggleMenu,
			menu,
			panelMbr,
			windowHeight,
			fontSize,
			max = 288,
		} = this.props;

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
				<div style={{ display: "flex" }}>
					<input
						onClick={() => {
							toggleMenu("FontSize");
						}}
						type={this.state.inputType}
						min="10"
						max={this.state.max}
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
							height: "45px",
							display: "flex",
							textAlign: "center",
							maxWidth: "50px",
							fontSize: "14px",
							justifyContent: "center",
							alignItems: "center",
							padding: "0px",
							backgroundColor: "white",
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
						maxSize={this.state.max}
						itemType={this.state.itemType || ""}
						onPick={(size: number | "Auto") => {
							const single = board.selection.items.getSingle();
							if (
								single &&
								single.itemType === "Sticker" &&
								size !== "Auto"
							) {
								single.text?.autosizeDisable();
							}
							if (
								size === "Auto" &&
								single &&
								single.itemType === "Sticker"
							) {
								single?.text?.autosizeEnable();
								const maxFontSize = (
									single as Sticker
								).text.getMaxFontSize();
								board.selection.setFontSize(maxFontSize);
							} else if (size !== "Auto") {
								board.selection.setFontSize(size);
							}
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
			>
				<BoldUnderlineIcon width={IconSize} height={IconSize} />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "160px",
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
			>
				<TextColorIcon
					color={color}
					width={IconSize}
					height={IconSize}
				/>
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
			>
				<TextHighlightIcon
					color={color}
					width={IconSize}
					height={IconSize}
				/>
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
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}
	return (
		<Button
			id="DuplicateSelection"
			onClick={() => {
				board.selection.duplicate();
			}}
			title="Duplicate"
		>
			<DuplicateIcon width={IconSize} height={IconSize} />
		</Button>
	);
}

function Delete({ board }: { board: Board }): React.ReactElement | null {
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}
	return (
		<Button
			id="DeleteSelection"
			onClick={() => {
				board.selection.removeFromBoard();
			}}
			title="Delete"
		>
			<DeleteIcon width={IconSize} height={IconSize} />
		</Button>
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
