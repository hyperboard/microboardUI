import { ConnectorPointerType } from "shared/ui-lib/Icon";

export interface BoardPoint {
  type: "Board" | "Fixed";
  x: number;
  y: number;
}

export interface FixedPoint {
  type: "Fixed";
  id?: number;
  relativeX: number;
  relativeY: number;
  style?: ConnectorPointerType;
}

export type Point =
  | {
      type: "Board";
      x: number;
      y: number;
    }
  | {
      type: "Fixed";
      x: number;
      y: number;
      id: number;
      relativeX: number;
      relativeY: number;
      style?: ConnectorPointerType;
    };

export interface AiSticker {
  id: number;
  x: number;
  y: number;
  size: number;
  text?: string;
  backgroundColor?: string;
}

export interface AiText {
  id: number;
  x: number;
  y: number;
  width: number;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  "line-through"?: boolean;
  fontColor?: string;
  fontSize?: number;
  fontHighlight?: string;
}

export interface AiConnector {
  id: number;
  startPoint: Point;
  endPoint: Point;
  lineType: "straight" | "curved" | "orthogonal";
  text?: string;
}

export interface AiShape {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation?: number;
  text?: string;
}

export interface AiFrame {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  items?: number[];
}

export type AiItem =
  | { itemType: "RichText"; data: AiText }
  | { itemType: "Shape"; data: AiShape }
  | { itemType: "Frame"; data: AiFrame }
  | { itemType: "Connector"; data: AiConnector }
  | { itemType: "Sticker"; data: AiSticker };
