export type BorderStyle = "solid" | "dot" | "dash" | "longDash" | "dotDash" | "tripleDotDash" | "looseDoubleDotDash";
export type ShapeType =
    | "Rectangle"
    | "Triangle"
    | "Circle"
    | "ArrowLeft"
    | "ArrowLeftRight"
    | "ArrowRight"
    | "ArrowBlockLeft"
    | "ArrowBlockRight"
    | "BracesLeft"
    | "BracesRight"
    | "Cloud"
    | "Cross"
    | "Cylinder"
    | "Hexagon"
    | "Octagon"
    | "Parallelogram"
    | "ReversedParallelogram"
    | "Pentagon"
    | "PredefinedProcess"
    | "Rhombus"
    | "RoundedRectangle"
    | "SpeachBubble"
    | "Star"
    | "Trapezoid";

export interface BoardItem {
    id: string;
    itemType: string;
    text?: {
        children: any[];
        [key: string]: any;
    };
    transformation?: ItemTransformation;
    [key: string]: any;
}

export interface ItemTransformation {
    translateX?: number;
    translateY?: number;
    scaleX?: number;
    scaleY?: number;
    rotate?: number;
}

export interface BoardEvent {
    order: number;
    eventId?: string;
    body: BoardEventBody;
    lastKnownOrder?: number;
}

export interface BoardEventBody {
    eventId: string;
    userId: number;
    boardId: string;
    operation: Operation;
}

export type Operation = UndoableOperation | EventsOperation;

export type UndoableOperation = BoardOperation | ItemOperation;

interface OperationBase {
    class: string;
    method: string;
    item?: string | string[];
}

export interface BoardOperation extends OperationBase {
    data?: any;
    items?: Record<string, any>;
    ops?: any[];
}

export type TransformationOperation = TranslateOperation | ScaleOperation | TransformMany;

interface TransformationBase extends OperationBase {
    class: "Transformation";
    item: string[];
    timestamp?: number;
}

export interface TranslateOperation extends TransformationBase {
    method: "translateTo" | "translateBy";
    x: number;
    y: number;
    timeStamp?: number;
}

export interface ScaleOperation extends TransformationBase {
    method: "scaleTo" | "scaleBy";
    x: number;
    y: number;
}

export interface TransformMany extends OperationBase {
    class: "Transformation";
    method: "transformMany";
    items: Record<
        string,
        {
            translate?: { x: number; y: number };
            scale?: { x: number; y: number };
        }
    >;
    timeStamp?: number;
}

export type ItemOperation = TransformationOperation | TextOperation;

export interface TextOperation extends OperationBase {
    class: "RichText";
    method: "edit";
    ops: TextEditOperation[];
}

export interface TextEditOperation {
    type: "insert_text" | "remove_text";
    path: number[];
    offset: number;
    text?: string;
    length?: number;
}

export type EventsOperation = Undo | Redo;

export interface Undo {
    class: "Events";
    method: "undo";
    eventId: string;
}

export interface Redo {
    class: "Events";
    method: "redo";
    eventId: string;
}

export interface BoardSnapshot {
    items: BoardItem[];
    events: BoardEvent[];
    lastIndex?: number;
}

export interface BoardSnapshotRecord {
    id: number;
    boardId: number | null;
    snapshot: {
        items: BoardItem[];
        events?: BoardEvent[];
        lastIndex?: number;
    };
    lastEventOrder: number;
    createdAt: Date | null;
}

export interface BaseShapeOperation {
    class: "Shape";
    item: string[];
}

export type ShapeOperation =
    | (BaseShapeOperation & { method: "setBackgroundColor"; backgroundColor: string })
    | (BaseShapeOperation & { method: "setBackgroundOpacity"; backgroundOpacity: number })
    | (BaseShapeOperation & { method: "setBorderColor"; borderColor: string })
    | (BaseShapeOperation & { method: "setBorderOpacity"; borderOpacity: number })
    | (BaseShapeOperation & { method: "setBorderStyle"; borderStyle: BorderStyle })
    | (BaseShapeOperation & { method: "setBorderWidth"; borderWidth: number })
    | (BaseShapeOperation & { method: "setShapeType"; shapeType: ShapeType });

export interface BaseConnectorOperation extends OperationBase {
    class: "Connector";
    item: string[];
}

interface BoardPointData {
    pointType: "Board";
    x: number;
    y: number;
}

interface FloatingPointData {
    pointType: "Floating";
    itemId: string;
    relativeX: number;
    relativeY: number;
}

interface FixedPointData {
    pointType: "Fixed";
    itemId: string;
    relativeX: number;
    relativeY: number;
}

interface FixedConnectorPointData {
    pointType: "FixedConnector";
    itemId: string;
    tangent: number;
    segment: number; // segment index
}

export type ControlPointData = BoardPointData | FloatingPointData | FixedPointData | FixedConnectorPointData;

export type ConnectorPointerStyle =
    | "Arrow"
    | "ArrowBlock"
    | "ArrowBlockFilled"
    | "ArrowBlockFilledTalk"
    | "ArrowFilled"
    | "ArrowFilledTalk"
    | "ArrowTalk"
    | "Zero"
    | "Triangle"
    | "TriangleFilled"
    | "TriangleFilledTalk"
    | "Zero"
    | "Triangle"
    | "TriangleFilled"
    | "TriangleFilledTalk"
    | "None"
    | "Angle"
    | "AngleTalk";

export type ConnectorLineStyle = "straight" | "curved" | "orthogonal";

export type ConnectorOperation =
    | (BaseConnectorOperation & { method: "setStartPoint"; startPointData: ControlPointData })
    | (BaseConnectorOperation & { method: "setEndPoint"; endPointData: ControlPointData })
    | (BaseConnectorOperation & { method: "setStartPointerStyle"; startPointerStyle: ConnectorPointerStyle })
    | (BaseConnectorOperation & { method: "setEndPointerStyle"; endPointerStyle: ConnectorPointerStyle })
    | (BaseConnectorOperation & { method: "setLineStyle"; lineStyle: ConnectorLineStyle })
    | (BaseConnectorOperation & { method: "setBorderStyle"; borderStyle: BorderStyle })
    | (BaseConnectorOperation & { method: "setLineColor"; lineColor: string })
    | (BaseConnectorOperation & { method: "setLineWidth"; lineWidth: number });
