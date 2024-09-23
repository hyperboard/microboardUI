import { Connection } from "App/Connection";
import { Operation } from "Board/Events";
import { Item, ItemData, Matrix, Mbr, RichText } from "Board/Items";
import { HorisontalAlignment, VerticalAlignment } from "Board/Items/Alignment";
import { ConnectorLineStyle } from "Board/Items/Connector";
import { DrawingContext } from "Board/Items/DrawingContext";
import { BorderStyle } from "Board/Items/Path";
import { TextStyle } from "Board/Items/RichText";
import { ShapeType } from "Board/Items/Shape/Basic";
import { Cursor } from "Board/Pointer";
import { SelectionContext } from "Board/Selection/Selection";
import { SelectionItems } from "Board/Selection/SelectionItems";
import { SelectionTransformer } from "Board/Selection/SelectionTransformer";
import { Items } from "Board/SpatialIndex";
import { Tools } from "Board/Tools";
import { AddConnector } from "Board/Tools/AddConnector";
import { AddDrawing } from "Board/Tools/AddDrawing";
import { AddShape } from "Board/Tools/AddShape";
import { AddText } from "Board/Tools/AddText";
import { BoardTool } from "Board/Tools/BoardTool";
import { Navigate } from "Board/Tools/Navigate";
import { Select } from "Board/Tools/Select";
import { Point } from "slate";
import { Subject } from "Subject";

interface WhiteboardPlugin {
	install: (whiteboard: WhiteboardApp) => void;
}

export interface Selection {
	readonly subject: Subject<Selection>;
	readonly itemSubject: Subject<Item>;
	readonly itemsSubject: Subject<Item[]>;
	readonly items: SelectionItems;
	readonly tool: SelectionTransformer;
	textToEdit?: RichText;

	// Method signatures
	add(value: Item | Item[]): void;
	remove(value: Item | Item[]): void;
	removeAll(): void;
	getContext(): SelectionContext;
	setContext(context: SelectionContext): void;
	getMbr(): Mbr | undefined;
	selectUnderPointer(): void;
	editSelected(): void;
	editText(): void;
	editUnderPointer(): void;
	setTextToEdit(item?: Item): void;
	editTextUnderPointer(): void;
	selectEnclosedBy(rect: Mbr): void;
	selectEnclosedOrCrossedBy(rect: Mbr): void;
	list(): Item[];
	canChangeText(): boolean;
	copy(): { [key: string]: ItemData };
	cut(): { [key: string]: ItemData };

	getText(): RichText | undefined;
	getFontSize(): number;
	getFontHighlight(): string;
	getFontColor(): string;
	getFillColor(): string;
	getStrokeColor(): string;
	getStrokeWidth(): number;
	getStartPointerStyle(): string;
	getEndPointerStyle(): string;
	setStartPointerStyle(style: string): void;
	setEndPointerStyle(style: string): void;
	setConnectorLineStyle(style: ConnectorLineStyle): void;
	getTextToEdit(): RichText[];

	translateBy(x: number, y: number): void;
	scaleBy(x: number, y: number): void;
	setStrokeStyle(borderStyle: BorderStyle): void;
	setStrokeColor(borderColor: string): void;
	setStrokeWidth(width: number): void;
	setFillColor(backgroundColor: string): void;
	setShapeType(shapeType: ShapeType): void;
	setFontSize(size: number): void;
	setFontStyle(fontStyleList: TextStyle[]): void;
	setFontColor(fontColor: string): void;
	setFontHighlight(fontHighlight: string): void;
	setHorisontalAlignment(horisontalAlignment: HorisontalAlignment): void;
	setVerticalAlignment(verticalAlignment: VerticalAlignment): void;

	removeFromBoard(): void;
	isLocked(): boolean;
	lock(): void;
	unlock(): void;
	duplicate(): void;
	render(context: DrawingContext): void;
}

export interface ITools {
	readonly subject: Subject<Tools>;
	setTool(tool: BoardTool): void;
	navigate(): void;
	getNavigate(): Navigate | undefined;
	select(): void;
	getSelect(): Select | undefined;
	addShape(): void;
	getAddShape(): AddShape | undefined;
	addText(): void;
	getAddText(): AddText | undefined;
	addConnector(): void;
	getAddConnector(): AddConnector | undefined;
	addDrawing(): void;
	getAddDrawing(): AddDrawing | undefined;
	cancel(): void;
	publish(): void;
	render(context: DrawingContext): void;
}

export interface Tool {
	leftButtonDown(): boolean;
	leftButtonUp(): boolean;
	leftButtonDouble(): boolean;
	rightButtonDown(): boolean;
	rightButtonUp(): boolean;
	rightButtonDouble(): boolean;
	middleButtonDown(): boolean;
	middleButtonUp(): boolean;
	middleButtonDouble(): boolean;
	keyDown(_key: string): boolean;
	keyUp(_key: string): boolean;
	pointerMoveBy(_x: number, _y: number): boolean;
	render(_context: DrawingContext): void;
}

interface Camera {
	subject: Subject<Camera>;
	getMbr(): Mbr;
	view(_left: number, _top: number, _scale: number): void;
	zoomRelativeToPointerBy(scale: number): void;
	zoomRelativeToPointBy(scale: number, x: number, y: number): void;
	saveDownEvent(event: PointerEvent): void;
	removeDownEvent(event: PointerEvent): void;
	updateDownEvent(event: PointerEvent): void;
	isTwoPointers(): boolean;
	getPinchCenter(): { x: number; y: number };
	isPinch(): boolean;
	getPinchScale(): number;
	getPanDelta(): { x: number; y: number };
	zoomToViewCenter(scale: number): void;
	zoomInToViewCenter(): void;
	zoomOutFromViewCenter(): void;
	viewRectangle(mbr: Mbr): void;
	zoomToFit(rect: Mbr): void;
	getViewPointer(): { x: number; y: number };
	translateTo(x: number, y: number): void;
	translateBy(x: number, y: number): void;
	getTranslation(): { x: number; y: number };
	getScale(): number;
	getMatrix(): Matrix;
	pointTo(x: number, y: number): void;
	onWindowResize(): void;
}

export interface Keyboard {
	up: string;
	down: string;
	isShift: boolean;
	isCtrl: boolean;
	isAlt: boolean;

	keyDown(event: KeyboardEvent): void;
	keyUp(event: KeyboardEvent): void;
}

export interface Pointer {
	// Properties
	readonly point: Point; // Assumed to be an instance of a Point class
	readonly subject: Subject<Pointer>; // Assumed to be an instance of a Subject class
	previous: Point; // Assumed to be an instance of a Point class
	delta: Point; // Assumed to be an instance of a Point class

	// Methods
	setCursor(cursor: Cursor): void;
	getCursor(): Cursor;
	pointTo(x: number, y: number): void;
	moveBy(x: number, y: number): void;
}

export interface Command {
	apply(): void;

	revert(): void;
}

export interface Board {
	selection: Selection;
	tools: Tools;
	pointer: Pointer;
	camera: Camera;
	items: Items;
	keyboard: Keyboard;
	// do not expose
	connect(connection: Connection): void; // Connects to an events server
	disconnect(): void; // Disconnects from an events server
	getNewItemId(): string; // Generates a new item ID
	emit(operation: Operation): void; // Emits an operation event
	apply(op: Operation): void | false; // Applies an operation
	applyPasteOperation(itemsMap: { [key: string]: ItemData }): void; // Internal method to apply paste operations

	getBoardId(): string; // Gets the board ID
	setBoardId(boardId: string): void; // Sets the board ID
	createItem(id: string, data: ItemData): Item; // Creates a new item
	add<T extends Item>(item: T): T; // Adds an item to the board
	remove(item: Item): void; // Removes an item from the board
	getByZIndex(index: number): Item; // Retrieves an item by its z-index
	getZIndex(item: Item): number; // Gets the z-index of an item
	getLastZIndex(): number; // Gets the last z-index used
	moveToZIndex(item: Item, zIndex: number): void; // Moves an item to a specified z-index
	moveSecondBeforeFirst(first: Item, second: Item): void; // Moves one item before another in z-order
	moveSecondAfterFirst(first: Item, second: Item): void; // Moves one item after another in z-order
	bringToFront(item: Item): void; // Brings an item to the front in z-order
	sendToBack(item: Item): void; // Sends an item to the back in z-order
	paste(itemsMap: { [key: string]: ItemData }): void; // Pastes items to the board
	duplicate(itemsMap: { [key: string]: ItemData }): void; // Duplicates items on the board

	isOnBoard(item: Item): boolean; // Checks if an item is on the board
}

type HookCallback = (context: any) => void;

class WhiteboardApp {
	private componentRegistry = new Map<string, any>();
	private styleRegistry = new Map<string, string>();
	private itemRegistry = new Map<
		string,
		{ factory: () => Command; validator?: (data: any) => boolean }
	>();
	private commandRegistry = new Map<string, () => Command>();
	private toolRegistry = new Map<string, () => Tool>();
	private hooks = new Map<string, HookCallback[]>();

	// Other properties and methods of WhiteboardApp...

	/**
	 * Plugins can register components, and optionally specify a decorator for existing components.
	 */
	registerComponent(
		componentName: string,
		component: any,
		decorator?: (baseComponent: any) => any,
	): void {
		const existingComponent = this.componentRegistry.get(componentName);
		this.componentRegistry.set(
			componentName,
			decorator ? decorator(existingComponent) : component,
		);
	}

	/**
    Allow plugins to introduce additional styles or override existing ones
    using CSS-in-JS methodologies that support encapsulation and prevent
    conflicts.
    */
	registerStyle(styleId: string, style: string): void {
		this.styleRegistry.set(styleId, style);
	}

	/**
    Allow plugins to introduce additional items
    or override existing ones.
    */
	registerItem(
		itemId: string,
		factory: () => Command,
		dataValidator?: (data: any) => boolean,
	): void {
		this.itemRegistry.set(itemId, { factory, validator: dataValidator });
	}

	/**
    Allow plugins to introduce additional commands
    or override existing ones.
    */
	registerCommand(commandId: string, factory: () => Command): void {
		this.commandRegistry.set(commandId, factory);
	}

	/**
    Allow plugins to introduce new item creation tools
    or override existing ones.
    */
	registerItemCreationTool(toolId: string, factory: () => Tool): void {
		this.toolRegistry.set(toolId, factory);
	}

	/**
    Allow plugins to introduce new item transformation tools
    or override existing ones.
    */
	registerItemTransformationTool(toolId: string, factory: () => Tool): void {
		this.toolRegistry.set(toolId, factory);
	}

	/**
    Implement event hooks that allow plugins to hook into various
    lifecycle events of the whiteboarding app, such as "beforeAddItem",
    "afterAddItem", or "onToolSelected". Middleware can be used to provide
    a means for plugins to modify or extend behavior.
    */
	registerHook(hookId: string, callback: HookCallback): void {
		const hookCallbacks = this.hooks.get(hookId) || [];
		hookCallbacks.push(callback);
		this.hooks.set(hookId, hookCallbacks);
	}

	triggerHook(hookId: string, context?: any): void {
		const hookCallbacks = this.hooks.get(hookId);
		if (hookCallbacks) {
			hookCallbacks.forEach(callback => callback(context));
		}
	}
}

export function registerPlugin(
	plugin: WhiteboardPlugin,
	whiteboardApp: WhiteboardApp,
): void {
	plugin.install(whiteboardApp);
}
