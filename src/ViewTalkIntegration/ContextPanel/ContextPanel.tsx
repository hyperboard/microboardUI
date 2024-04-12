import { Board } from "Board";
import { Connector, Mbr } from "Board/Items";
import { ShapeType } from "Board/Items/Shape/Basic";
import { Icon, TextColorIndicator } from "../Icon";
import { StrokeStylePicker } from "../Pickers/BorderStylePicker";
import { ColorPicker } from "../Pickers/ColorPicker";
import { ConnectorLineStylePicker } from "../Pickers/ConnectorLineStylePicker";
import {
	ConnectorEndPointerPicker,
	ConnectorStartPointerPicker,
} from "../Pickers/ConnectorPointerPicker";
import { FontSizePicker } from "../Pickers/FontSizePicker";
import { FontStylePicker } from "../Pickers/FontStylePicker";
import { HorisontalAlignmentPicker } from "../Pickers/HorizontalAlignmentPicker";
import { ShapePicker } from "../Pickers/ShapeTypePicker";
import { SliderPicker } from "../Pickers/SliderPicker";
import { VerticalAlignmentPicker } from "../Pickers/VerticalAlignmentPicker";
import * as React from "react";
import { fitContextPanel } from "View/fit";
import { Button } from "./Button";
import { HorisontalSeparator } from "./HorisontalSeparator";
import { VerticalSeparator } from "./VerticalSeparator";

import { applyStyle } from "lib/applyStyle";
import { TextHighlightIndicator } from "../Icon/TextHighlightIndicator";
import { StrokeColorIndicator } from "../Icon/StrokeColorIndicator";
import { CircleColorIndicator } from "../Icon/CircleColorIndicator";
import { SelectionContext } from "Board/Selection/Selection";
import { Sticker } from "Board/Items/Sticker";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { HorisontalAlignment, VerticalAlignment } from "Board/Items/Alignment";

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
		this.forceUpdate();
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
					display: "flex",
					gap: "4px",
				}}
			>
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
				<PanelSeparator board={board} items={["Connector"]} />
				<ConnectorType
					board={board}
					toggleMenu={this.toggleMenu}
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
				/>
				<PanelSeparator board={board} items={["Connector"]} />

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
				<PanelSeparator board={board} items={["Shape"]} />
				<DrawStrokeWidth
					board={board}
					width={board.selection.getStrokeWidth() ?? 1}
				/>
				<PanelSeparator
					board={board}
					items={["Drawing"]}
					context="SelectUnderPointer"
				/>
				<DrawFillStyle
					board={board}
					toggleMenu={this.toggleMenu}
					color={board.selection.getStrokeColor()}
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
				<PanelSeparator board={board} items={["Sticker"]} />
				<FontSize
					board={board}
					toggleMenu={this.toggleMenu}
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
					fontSize={board.selection.getFontSize()}
				/>
				<ConnectorAddText
					board={board}
					panelMbr={panelRect}
					windowHeight={windowHeight}
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
					alignment={board.selection
						.getText()
						?.getHorisontalAlignment()}
				/>
				<TextAlignmentSticker
					board={board}
					toggleMenu={this.toggleMenu}
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
					horizontalAlignment={board.selection
						.getText()
						?.getHorisontalAlignment()}
					verticalAlignment={board.selection
						.getText()
						?.getVerticalAlignment()}
				/>
				<AddList
					board={board}
					toggleMenu={this.toggleMenu}
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
				/>

				<TextColor
					board={board}
					toggleMenu={this.toggleMenu}
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
					color={board.selection.getFontColor()}
				/>
				<PanelSeparator board={board} items={["RichText", "Shape"]} />
				<TextHighlight
					board={board}
					toggleMenu={this.toggleMenu}
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
					color={board.selection.getFontHighlight()}
				/>

				<PanelSeparator
					board={board}
					context={"SelectByRect"}
					items={[
						"Shape",
						"Drawing",
						"RichText",
						"Connector",
						"Sticker",
					]}
				/>

				<DuplicateImg board={board} />
				<RestOptionsMenu
					menu={menu}
					panelMbr={panelRect}
					windowHeight={windowHeight}
					toggleMenu={this.toggleMenu}
					board={board}
				/>

				<PanelSeparator board={board} items={["Image"]} />

				<DeleteImg board={board} />
			</div>
		);
	}
}

const ContextPanelStyle = document.createElement("style");

ContextPanelStyle.innerHTML = `
.ContextPanelContainer {
	position: absolute;
	cursor: pointer;
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05);
	padding: 4px;
}

.ContextPanelMenuContainer {
	position: relative;
	display: inline-block;
  height: max-content;
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
	display: flex;
	flex-wrap: wrap;
	border-radius: 8px;
	padding: 4px;
	box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05), 0 1px 1px 0 rgba(0, 0, 0, 0.05);
	background: #fff;
}
`;

document.head.appendChild(ContextPanelStyle);

function PanelSeparator({
	board,
	items,
	context = "SelectUnderPointer",
}: {
	board: Board;
	items: string[];
	context?: SelectionContext;
}) {
	const canChangePointer = board.selection.items.isItemTypes(items);
	if (board.selection.getContext() === context || !canChangePointer) {
		return null;
	}

	return <VerticalSeparator />;
}

function DeleteImg({ board }: { board: Board }) {
	const canChangePointer = board.selection.items.isItemTypes(["Image"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}

	const handleClick = () => {
		board.selection.removeFromBoard();
	};

	return (
		<Button margin={0} onClick={handleClick}>
			<Icon style={{ color: "#DF4E49" }} iconName="Trash" />
		</Button>
	);
}

function DuplicateImg({ board }: { board: Board }) {
	const canChangePointer = board.selection.items.isItemTypes(["Image"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const handleClick = () => {
		board.selection.duplicate();
	};
	return (
		<Button margin={0} onClick={handleClick}>
			<Icon iconName="Copy" />
		</Button>
	);
}

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

	const handleClick = () => toggleMenu("RestMenu");
	const isNotImage = !board.selection.items.isItemTypes(["Image"]);

	return (
		<>
			<ButtonWithMenu
				panelMbr={panelMbr}
				windowHeight={windowHeight}
				menuRef={menuRef}
			>
				<Button
					onClick={handleClick}
					className="RestOptionsIcon"
					width={32}
					height={32}
					margin={0}
				>
					<Icon iconName="Dots" />
				</Button>
				<div
					ref={menuRef}
					className="ContextPanelMenu"
					style={{
						display: "flex",
						flexDirection: "column",
						width: "290px",
						left: 0,
						visibility: menu === "RestMenu" ? "visible" : "hidden",
					}}
				>
					{isNotImage && <Duplicate board={board} />}
					<BringToFront board={board} />
					<BringToBack board={board} />
					{isNotImage && (
						<>
							<Delete board={board} />
						</>
					)}
				</div>
			</ButtonWithMenu>
		</>
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
	const handleClick = () => {
		board.selection.editSelected();
	};
	return (
		<Button
			id="ContextPanelEdit"
			onClick={handleClick}
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
	const pointerStartStyle = board.selection.getStartPointerStyle();

	const handleClick = () => {
		toggleMenu("StartPointer");
	};
	const handlePick = (type: string) => {
		board.selection.setStartPointerStyle(type);
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeStartPointer"
				onClick={handleClick}
				title="Начало линии"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<Icon
					iconName={
						pointerStartStyle === "ArrowBroad"
							? "PointerEnd"
							: pointerStartStyle === "TriangleFilled"
							? "PointerEndCompact"
							: "PointerStart"
					}
				/>
			</Button>
			<div
				id="StartPointerMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "flex",
					flexWrap: "nowrap",
					gap: "4px",
					left: 0,
					visibility: menu === "StartPointer" ? "visible" : "hidden",
				}}
			>
				<ConnectorStartPointerPicker
					selected={pointerStartStyle}
					onPick={handlePick}
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
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}

	const handleClick = () => {
		const start = board.selection.getStartPointerStyle();
		const end = board.selection.getEndPointerStyle();
		board.selection.setStartPointerStyle(end);
		board.selection.setEndPointerStyle(start);
	};

	return (
		<Button
			id="SwitchPointers"
			onClick={handleClick}
			title="Поменять местами"
			width={32}
			height={32}
			margin={0}
			tipOnTop
		>
			<Icon iconName="PointerRoll" />
		</Button>
	);
}

function EndPointer({
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
	const endPointerStyle = board.selection.getEndPointerStyle();

	const handleClick = () => {
		toggleMenu("EndPointer");
	};

	const handlePick = (type: string) => {
		board.selection.setEndPointerStyle(type);
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeEndPointer"
				onClick={handleClick}
				title="Конец линии"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<Icon
					iconName={
						endPointerStyle === "ArrowBroad"
							? "PointerEnd"
							: endPointerStyle === "TriangleFilled"
							? "PointerEndCompact"
							: "PointerStart"
					}
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
					selected={endPointerStyle}
					onPick={handlePick}
				/>
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
	const context = board.selection.getContext();
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		context === "SelectUnderPointer" ||
		context === "EditTextUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);
	const handleClick = () => {
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
			board.items.subject.publish(board.items);
			return;
		}
		const connector = board.selection.items.getItemsByItemTypes([
			"Connector",
		])[0] as Connector;
		if (!connector) {
			return;
		}
		board.selection.setTextToEdit(connector);
		board.selection.setContext("EditTextUnderPointer");
		board.items.subject.publish(board.items);
	};
	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeConnectorType"
				onClick={handleClick}
				title="Добавить текст"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<TextColorIndicator color="none" />
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
	const connectorType = board.selection.getConnectorLineStyle();

	const handleClick = () => {
		toggleMenu("ConnectorType");
	};

	const handlePick = (type: ConnectorLineStyle) => {
		board.selection.setConnectorLineStyle(type);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeConnectorType"
				onClick={handleClick}
				title="Стиль линии"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<Icon
					iconName={
						connectorType === "curved"
							? "CurvedLine"
							: "DiagonalLine"
					}
				/>
			</Button>
			<div
				id="ConnectorTypeMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "flex",
					flexWrap: "nowrap",
					gap: 4,
					left: 0,
					visibility: menu === "ConnectorType" ? "visible" : "hidden",
				}}
			>
				<ConnectorLineStylePicker
					selected={connectorType}
					onPick={handlePick}
				/>
			</div>
		</ButtonWithMenu>
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

	const handleClick = () => {
		toggleMenu("ItemType");
	};
	const handlePick = (type: ShapeType) => {
		board.selection.setShapeType(type);
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeItemType"
				onClick={handleClick}
				title="Изменить тип"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<Icon iconName="AddShape" />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					width: "104px",
					gap: "4px",
					left: 0,
					visibility: menu === "ItemType" ? "visible" : "hidden",
				}}
			>
				<ShapePicker onPick={handlePick} />
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

		const handleClick = () => {
			toggleMenu("FontSize");
		};

		const handlePick = (size: number) => {
			board.selection.setFontSize(size);
			toggleMenu("None");
		};
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
					<Button
						margin={0}
						onClick={handleClick}
						title={"Размер шрифта"}
						tipOnTop
						style={{
							display: "flex",
							fontSize: "16px",
							fontWeight: 500,
							justifyContent: "center",
							alignItems: "center",
							width: "52px",
							gap: "8px",
						}}
					>
						<span style={{ flex: "1 0" }}>{fontSize}</span>
						<Icon width={10} height={16} iconName="UpDownArrow" />
					</Button>
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
					<FontSizePicker onPick={handlePick} />
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

	if (board.selection.items.isItemTypes(["Connector"])) {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("FontStyle");
	};

	const handlePick = (style: string) => {
		board.selection.setFontStyle([style]);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeFontStyle"
				onClick={handleClick}
				title="Стиль шрифта"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<Icon iconName="TextFormat" />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					padding: "4px",
					display: "flex",
					gap: "4px",
					width: "max-content",
					left: 0,
					visibility: menu === "FontStyle" ? "visible" : "hidden",
				}}
			>
				<FontStylePicker onPick={handlePick} />
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
	alignment = "center",
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	alignment?: "left" | "right" | "center";
}): React.ReactElement | null {
	const connector = board.selection.items.getSingle();
	const isConnector = connector instanceof Connector;
	const isSticker = connector instanceof Sticker;

	if (isConnector || isSticker) {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("TextAlignment");
	};

	const handlePick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextAlignment"
				onClick={handleClick}
				title="Выравнивание"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<Icon
					iconName={`TextAlign${
						alignment === "center"
							? "Center"
							: alignment === "left"
							? "Left"
							: "Right"
					}`}
					width={16}
					height={16}
				/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "4px",
					flexWrap: "nowrap",
					marginLeft: "-56px",
					visibility: menu === "TextAlignment" ? "visible" : "hidden",
				}}
			>
				<HorisontalAlignmentPicker
					alignment={alignment}
					onPick={handlePick}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function TextAlignmentSticker({
	board,
	toggleMenu,
	menu,
	panelMbr,
	windowHeight,
	horizontalAlignment = "center",
	verticalAlignment = "center",
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
	windowHeight: number;
	horizontalAlignment?: "left" | "right" | "center";
	verticalAlignment?: "top" | "bottom" | "center";
}): React.ReactElement | null {
	const connector = board.selection.items.getSingle();
	const isSticker = connector instanceof Sticker;

	if (!isSticker) {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("TextAlignment");
	};

	const handleHorisontalAlignmentPick = (alignment: HorisontalAlignment) => {
		board.selection.setHorisontalAlignment(alignment);
		toggleMenu("None");
	};

	const handleVerticalAlignmentPick = (alignment: VerticalAlignment) => {
		board.selection.setVerticalAlignment(alignment);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextAlignment"
				onClick={handleClick}
				title="Выравнивание"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<Icon
					width={16}
					height={16}
					iconName={`TextAlign${
						horizontalAlignment === "center"
							? "Center"
							: horizontalAlignment === "left"
							? "Left"
							: "Right"
					}`}
				/>
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "grid",
					gridTemplateRows: "repeat(2, 1fr)",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "4px",
					visibility: menu === "TextAlignment" ? "visible" : "hidden",
				}}
			>
				<HorisontalAlignmentPicker
					alignment={horizontalAlignment}
					onPick={handleHorisontalAlignmentPick}
				/>
				<VerticalAlignmentPicker
					alignment={verticalAlignment}
					onPick={handleVerticalAlignmentPick}
				/>
			</div>
		</ButtonWithMenu>
	);
}

const textColors = [
	"#000000",
	"#F03B36",
	"#FFBE00",
	"#3DBC5D",
	"#B750D1",
	"#00CCAE",
	"#2291FF",
	"#FFFFFF",
];

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

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		board.selection.items.isItemTypes(["Connector"])
	) {
		return null;
	}

	if (board.selection.items.isItemTypes(["Sticker"])) {
		return null;
	}

	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("TextColor");
	};

	const handlePick = (color: string) => {
		board.selection.setFontColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeTextColor"
				onClick={handleClick}
				title="Цвет текста"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<TextColorIndicator color={color} />
			</Button>
			<div
				id="TextColorMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					justifyContent: "center",
					width: "132px",
					gap: "4px",
					left: 0,
					visibility: menu === "TextColor" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					colors={textColors}
					selectedColor={color}
					onPick={handlePick}
				/>
			</div>
		</ButtonWithMenu>
	);
}

const highlightColors = [
	"#AED4FA",
	"#FCF5AE",
	"#AFD6A7",
	"#E9BFE9",
	"#ABDDDD",
	"#F6A8A8",
	"#E6E6E6",
	"#FFFFFF",
];

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

	if (board.selection.items.isItemTypes(["Connector"])) {
		return null;
	}

	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
	) {
		return null;
	}

	if (board.selection.items.isItemTypes(["Sticker"])) {
		return null;
	}

	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("TextHighlight");
	};

	const handlePick = (color: string) => {
		board.selection.setFontHighlight(color);
		toggleMenu("None");
	};

	return (
		<>
			<ButtonWithMenu
				panelMbr={panelMbr}
				windowHeight={windowHeight}
				menuRef={menuRef}
			>
				<Button
					id="ChangeTextHighlight"
					onClick={handleClick}
					title="Маркер"
					tipOnTop
					width={32}
					height={32}
					margin={0}
				>
					<TextHighlightIndicator color={color} />
				</Button>
				<div
					id="TextColorMenu"
					ref={menuRef}
					className="ContextPanelMenu"
					style={{
						display: "flex",
						width: "168px",
						gap: "4px",
						left: 0,
						visibility:
							menu === "TextHighlight" ? "visible" : "hidden",
					}}
				>
					<ColorPicker
						colors={highlightColors}
						selectedColor={color}
						allowNone={true}
						onPick={handlePick}
					/>
				</div>
			</ButtonWithMenu>
		</>
	);
}

const strokeColors = [
	"#000000",
	"#2291FF",
	"#FFBE00",
	"#3DBC5D",
	"#B750D1",
	"#00CCAE",
	"#F03B36",
	"#FFFFFF",
];

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

	const canChangeBorderStyle = board.selection.items.isItemTypes(["Shape"]);
	if (context === "SelectUnderPointer" || !canChangeBorderStyle) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("StrokeStyle");
	};

	const handleStrokeWidthPick = (width: number) => {
		board.selection.setStrokeWidth(width);
	};

	const handleStrokeStylePick = (style: BorderStyle) => {
		board.selection.setStrokeStyle(style);
		toggleMenu("None");
	};

	const handleStrokeColorPick = (color: string) => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};
	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeStrokeStyle"
				onClick={handleClick}
				title="Обводка"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<StrokeColorIndicator color={color} />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					gap: "16px",
					display: "flex",
					flexDirection: "column",
					justifyItems: "center",
					alignItems: "stretch",
					left: 0,
					visibility: menu === "StrokeStyle" ? "visible" : "hidden",
				}}
			>
				<StrokeStylePicker
					stroke={board.selection.getBorderStyle()}
					onPick={handleStrokeStylePick}
				/>
				<SliderPicker onPick={handleStrokeWidthPick} width={width} />
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(5, 1fr)",
						gap: "8",
					}}
				>
					<ColorPicker
						selectedColor={color}
						colors={strokeColors}
						allowNone={false}
						onPick={handleStrokeColorPick}
					/>
				</div>
			</div>
		</ButtonWithMenu>
	);
}

const fillColors = [
	"#2291FF",
	"#FFBE00",
	"#3DBC5D",
	"#B750D1",
	"#00CCAE",
	"#F03B36",
	"#FFFFFF",
	"#000000",
	"#F7DF63",
	"#80BF73",
	"#BF7CBF",
	"#3DCCCC",
	"#F26161",
];

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

	const handleClick = () => {
		toggleMenu("FillStyle");
	};

	const handlePick = (color: string) => {
		board.selection.setFillColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeFillStyle"
				onClick={handleClick}
				title="Заливка"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<CircleColorIndicator width={24} height={24} color={color} />
			</Button>
			<div
				id="FillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(7, 1fr)",
					gap: "4px",
					left: 0,
					visibility: menu === "FillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					selectedColor={color}
					colors={fillColors}
					allowNone={true}
					onPick={handlePick}
				/>
			</div>
		</ButtonWithMenu>
	);
}

const drawingColors = [
	"#2291FF",
	"#FFBE00",
	"#00CCAE",
	"#3DBC5D",
	"#B750D1",
	"#F03B36",
	"#000000",
	"#FFFFFF",
];

function DrawFillStyle({
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
	const canChangeFillStyle = board.selection.items.isItemTypes(["Drawing"]);
	if (context === "SelectUnderPointer" || !canChangeFillStyle) {
		return null;
	}
	const menuRef = React.useRef<HTMLDivElement>(null);

	const handleClick = () => {
		toggleMenu("DrawFillStyle");
	};

	const handlePick = (color: string) => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeDrawFillStyle"
				onClick={handleClick}
				title="Заливка"
				tipOnTop
				width={32}
				height={32}
				margin={0}
			>
				<CircleColorIndicator width={24} height={24} color={color} />
			</Button>
			<div
				id="DrawFillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "4px",
					left: 0,
					visibility: menu === "DrawFillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					selectedColor={color}
					colors={drawingColors}
					onPick={handlePick}
				/>
			</div>
		</ButtonWithMenu>
	);
}

const stickerColors = [
	"#AED4FA",
	"#FCF5AE",
	"#AFD6A7",
	"#E9BFE9",
	"#ABDDDD",
	"#F6A8A8",
	"#E6E6E6",
];

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

	const handleClick = () => {
		toggleMenu("StickerFillStyle");
	};

	const handlePick = (color: string) => {
		board.selection.setFillColor(color);
		toggleMenu("None");
	};

	return (
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<Button
				id="ChangeStickerFillStyle"
				onClick={handleClick}
				title="Цвет стикера"
				width={32}
				height={32}
				margin={0}
				tipOnTop
			>
				<CircleColorIndicator color={color} />
			</Button>
			<div
				id="StickerFillStyleMenu"
				ref={menuRef}
				className="ContextPanelMenu"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "4px",
					left: 0,
					visibility:
						menu === "StickerFillStyle" ? "visible" : "hidden",
				}}
			>
				<ColorPicker
					selectedColor={color}
					colors={stickerColors}
					onPick={handlePick}
				/>
			</div>
		</ButtonWithMenu>
	);
}

function Duplicate({ board }: { board: Board }): React.ReactElement | null {
	const handleClick = () => {
		board.selection.duplicate();
	};

	return (
		<RestOptionsMenuItem
			id="DuplicateSelection"
			onClick={handleClick}
			hotkey="D"
		>
			Дублировать
		</RestOptionsMenuItem>
	);
}

function Delete({ board }: { board: Board }): React.ReactElement | null {
	const handleClick = () => {
		board.selection.removeFromBoard();
	};

	return (
		<RestOptionsMenuItem
			id="DeleteSelection"
			onClick={handleClick}
			hotkey="Delete"
		>
			Удалить
		</RestOptionsMenuItem>
	);
}

function BringToFront({ board }: { board: Board }): React.ReactElement | null {
	const items = board.selection.items;
	const handleClick = () => {
		for (const item of items.list()) {
			board.items.index.bringToFront(item);
		}
	};
	return (
		<RestOptionsMenuItem id="BringToFront" onClick={handleClick} hotkey="]">
			Вынести на передний план
		</RestOptionsMenuItem>
	);
}

function BringToBack({ board }: { board: Board }): React.ReactElement | null {
	const items = board.selection.items;
	const handleClick = () => {
		for (const item of items.list()) {
			board.items.index.sendToBack(item);
		}
	};

	return (
		<RestOptionsMenuItem id="BringToBack" onClick={handleClick} hotkey="[">
			Вынести на задний план
		</RestOptionsMenuItem>
	);
}

function DrawStrokeWidth({ board, width }: { board: Board; width: number }) {
	if (
		board.selection.getContext() !== "EditUnderPointer" ||
		!board.selection.items.isItemTypes(["Drawing"])
	) {
		return null;
	}

	const handleSliderPick = (width: number): void => {
		board.selection.setStrokeWidth(width);
	};

	return (
		<SliderPicker
			showLabel={false}
			onPick={handleSliderPick}
			width={width}
		/>
	);
}
