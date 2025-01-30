// import { BorderStyle } from "./Transformers/Update";

// Common types
export type Position = {
    x: number;
    y: number;
};

export type Transformation = {
    rotate: number;
    scaleX: number;
    scaleY: number;
    translateX: number;
    translateY: number;
};

// Text-related types
export interface TextStyle {
    text: string;
    type: "text";
    bold: boolean;
    italic: boolean;
    fontSize: number;
    overline: boolean;
    fontColor: string;
    subscript: boolean;
    underline: boolean;
    fontFamily: string;
    lineHeight: number;
    lineThrough: boolean;
    superscript: boolean;
    fontHighlight: string;
}

export interface TextBlock {
    type: "paragraph";
    children: TextStyle[];
    horisontalAlignment: "left" | "center" | "right";
}

export interface RichText {
    children: TextBlock[];
    insideOf: "Frame" | "Shape" | "Sticker" | "RichText";
    itemType: "RichText";
    realSize: number | "auto";
    placeholderText: string;
    containerMaxWidth?: number;
    verticalAlignment: "center";
}

// Style-related types
export const BorderStyles = [
    "solid",
    "dot",
    "dash",
    "longDash",
    "dotDash",
    "tripleDotDash",
    "looseDoubleDotDash",
] as const;

export type BorderStyle = typeof BorderStyles[number];

// Shape and Frame types
export const ShapeTypes = [
    "Rectangle",
    "RoundedRectangle",
    "Circle",
    "Triangle",
    "Rhombus",
    "SpeachBubble",
    "Parallelogram",
    "Star",
    "ArrowRight",
    "ArrowLeft",
    "ArrowLeftRight",
    "Pentagon",
    "Octagon",
    "Hexagon",
    "PredefinedProcess",
    "Trapezoid",
    "Cloud",
    "Cross",
    "Cylinder",
    "BracesRight",
    "BracesLeft",
] as const;

export type ShapeType = typeof ShapeTypes[number];

export const FrameTypes = ["Custom", "Frame16x9", "Frame4x3", "A4", "Letter", "Frame1x1"] as const;

export type FrameType = typeof FrameTypes[number];

// Geometry types
export interface Point {
    x: number;
    y: number;
}

// Board item types
export interface BaseItem {
    id: string;
    transformation: Transformation;
}

export interface ShapeItem extends BaseItem {
    itemType: "Shape";
    text: RichText;
    shapeType: ShapeType;
    borderColor: string;
    borderStyle: BorderStyle;
    borderWidth: number;
    borderOpacity: number;
    backgroundColor: string | "none";
    backgroundOpacity: number;
}

export interface StickerItem extends BaseItem {
    itemType: "Sticker";
    text: RichText;
    backgroundColor: string;
}

export interface FrameItem extends BaseItem {
    itemType: "Frame";
    text: RichText;
    children: string[];
    shapeType: FrameType;
    borderColor: string;
    borderStyle: BorderStyle;
    borderWidth: number;
    borderOpacity: number;
    backgroundColor: string;
    backgroundOpacity: number;
    canChangeRatio: boolean;
}

export interface DrawingItem extends BaseItem {
    itemType: "Drawing";
    points: Position[];
    strokeStyle: string;
    strokeWidth: number;
}

export interface RichTextItem extends BaseItem {
    itemType: "RichText";
    children: TextBlock[];
    insideOf: "RichText";
    realSize: number;
    placeholderText: string;
    containerMaxWidth: number;
    verticalAlignment: "center";
}

export type BoardItem = ShapeItem | StickerItem | FrameItem | DrawingItem | RichTextItem;

// Request types
export interface CreateItemRequest {
    type: "Shape" | "Sticker" | "RichText" | "Frame" | "Drawing";
    transformation?: Transformation;
    text?: RichText;
    shapeType?: ShapeType | FrameType;
    borderColor?: string;
    borderStyle?: BorderStyle;
    borderWidth?: number;
    borderOpacity?: number;
    backgroundColor?: string;
    backgroundOpacity?: number;
    canChangeRatio?: boolean;
    children?: string[];
    points?: Point[];
    strokeStyle?: string;
    strokeWidth?: number;
}

export interface UpdateItemRequest {
    shapeType?: ShapeType | FrameType;
    backgroundColor?: string;
    backgroundOpacity?: number;
    borderColor?: string;
    borderStyle?: BorderStyle;
    borderWidth?: number;
    text?: RichText;
}

export interface BatchOperationRequest {
    operations: Array<{
        type: "create" | "update" | "delete";
        itemId?: string;
        data?: CreateItemRequest | UpdateItemRequest;
    }>;
}

export interface RefreshConfigRequest {
    url: string;
    interval: number;
}

export function isShapeType(value: string): value is ShapeType {
    return ShapeTypes.includes(value as any);
}

export function isFrameType(value: string): value is FrameType {
    return FrameTypes.includes(value as any);
}

export function isBorderStyle(value: string | undefined): value is BorderStyle {
    if (!value) return false;
    return BorderStyles.includes(value as any);
}
