import {
  AiConnector,
  AiFrame,
  AiItem,
  AiShape,
  AiSticker,
  AiText,
  Point,
} from "./types";
import {
  Board,
  Connector,
  Frame,
  Item,
  Mbr,
  Point as BoardPoint,
  RichText,
  Shape,
  Sticker,
  stickerColors,
  BoardPoint as ConnectorPoint,
  FixedPoint,
  toRelativePoint,
} from "microboard-temp";

const SIZE_MULTIPLIER = 1;
function multiplySize(x: number): number {
  return x * SIZE_MULTIPLIER;
}

// Store references to created items by their IDs
const itemsById = new Map<number, Item>();

function applyTransformation(item: Item, x = 0, y = 0): void {
  item.transformation.translateTo(multiplySize(x), multiplySize(y));
}

function applyScaleTransformation(item: Item, width = 100, height = 100): void {
  item.transformation.scaleTo(
    multiplySize(width) / 100,
    multiplySize(height) / 100,
  );
}

function transformSticker(data: AiSticker, board: Board): void {
  const sticker = new Sticker(board);
  sticker.setId(board.getNewItemId());
  if (data.backgroundColor) {
    sticker.setBackgroundColor(stickerColors[data.backgroundColor]);
  }
  if (data.text) {
    sticker.text.editor.editor.children = [
      {
        type: "paragraph",
        children: [
          {
            text: data.text,
            type: "text",
            bold: false,
            italic: false,
            underline: false,
            "line-through": false,
            fontColor: "#000000",
            fontSize: 14,
            overline: false,
            subscript: false,
            superscript: false,
          },
        ],
        horisontalAlignment: "center",
      },
    ];
  }
  applyTransformation(sticker, data.x, data.y);
  applyScaleTransformation(sticker, data.size, data.size);

  const newSticker = board.add<Sticker>(sticker);
  itemsById.set(data.id, newSticker);
}

function transformText(data: AiText, board: Board): void {
  const textItem = new RichText(board, new Mbr());
  textItem.setId(board.getNewItemId());

  // Set text content with formatting
  textItem.editor.editor.children = [
    {
      type: "paragraph",
      children: [
        {
          text: data.text || "",
          type: "text",
          bold: data.bold,
          italic: data.italic,
          underline: data.underline,
          "line-through": data["line-through"],
          fontColor: data.fontColor,
          fontSize: data.fontSize,
          fontHighlight: data.fontHighlight,
          overline: false,
          subscript: false,
          superscript: false,
        },
      ],
      horisontalAlignment: "left",
    },
  ];

  applyTransformation(textItem, data.x, data.y);
  textItem.applyMaxWidth(multiplySize(data.width));

  const newRichText = board.add<RichText>(textItem);
  itemsById.set(data.id, newRichText);
}

const getPoint = (
  position: number,
  geometry: number,
  percent: number,
): number => {
  if (geometry) {
    return position + (geometry * percent) / 100;
  }
  return position;
};

function getConnectorPoint(point: Point): BoardPoint {
  if (point.type === "Board") {
    return new ConnectorPoint(point.x, point.y);
  }

  const targetItem = itemsById.get(point.id);
  if (!targetItem) {
    return new ConnectorPoint(0, 0);
  }

  const { left: itemX, top: itemY } = targetItem.getPath().getMbr();
  const x = getPoint(itemX, targetItem.getMbr().getWidth(), point.relativeX);
  const y = getPoint(itemY, targetItem.getMbr().getHeight(), point.relativeY);
  return toRelativePoint(new BoardPoint(x, y), targetItem);
}

function transformConnector(data: AiConnector, board: Board): void {
  const startPoint = getConnectorPoint(data.startPoint);
  const endPoint = getConnectorPoint(data.endPoint);
  if (data.startPoint.type !== "Fixed" || data.endPoint.type !== "Fixed") {
    console.warn("Temporary not supported connector with Board point");
    return;
  }
  const startItem = itemsById.get(data.startPoint.id);
  const endItem = itemsById.get(data.endPoint.id);
  if (!startItem || !endItem) {
    return;
  }

  const connector = new Connector(
    board,
    new FixedPoint(startItem, startPoint),
    new FixedPoint(endItem, endPoint),
  );
  connector.setId(board.getNewItemId());

  // Set connector properties
  connector.setLineStyle(data.lineType);

  if (data.startPoint.style) {
    connector.setStartPointerStyle(data.startPoint.style);
  }
  if (data.endPoint.style) {
    connector.setEndPointerStyle(data.endPoint.style);
  }

  if (data.text) {
    connector.text.editor.editor.children = [
      {
        type: "paragraph",
        children: [
          {
            text: data.text,
            type: "text",
            bold: false,
            italic: false,
            underline: false,
            "line-through": false,
            fontColor: "#000000",
            fontSize: 14,
            overline: false,
            subscript: false,
            superscript: false,
          },
        ],
        horisontalAlignment: "center",
      },
    ];
  }

  const newConnector = board.add<Connector>(connector);
  itemsById.set(data.id, newConnector);
}

function transformShape(data: AiShape, board: Board): void {
  const shape = new Shape(board, undefined, "Rectangle");
  shape.setId(board.getNewItemId());
  try {
    shape.setShapeType(data.type as Parameters<typeof shape.setShapeType>[0]);
  } catch (err) {
    shape.setShapeType("Rectangle");
  }

  // Apply styling
  shape.setBackgroundColor(data.fill);
  shape.setBorderColor(data.stroke);
  shape.setBorderWidth(data.strokeWidth);

  // Apply transformations
  applyTransformation(shape, data.x, data.y);
  applyScaleTransformation(shape, data.width, data.height);

  if (data.rotation) {
    shape.transformation.rotateBy(data.rotation);
  }

  if (data.text) {
    shape.text.editor.editor.children = [
      {
        type: "paragraph",
        children: [
          {
            text: data.text,
            type: "text",
            bold: false,
            italic: false,
            underline: false,
            "line-through": false,
            fontColor: "#000000",
            fontSize: 14,
            overline: false,
            subscript: false,
            superscript: false,
          },
        ],
        horisontalAlignment: "center",
      },
    ];
  }

  const newShape = board.add<Shape>(shape);
  itemsById.set(data.id, newShape);
}

function transformFrame(data: AiFrame, board: Board): void {
  const frame = new Frame(
    board,
    board.items.getById.bind(board.items),
    undefined,
    data.title || "Frame",
  );
  frame.setId(board.getNewItemId());

  // Apply transformations
  applyTransformation(frame, data.x, data.y);
  applyScaleTransformation(frame, data.width, data.height);

  const newFrame = board.add<Frame>(frame);
  itemsById.set(data.id, newFrame);

  // Add items to frame if they exist
  if (data.items && data.items.length > 0) {
    data.items.forEach((itemId) => {
      const item = itemsById.get(itemId);
      if (item?.itemType === "Connector") {
        return;
      }
      if (item) {
        frame.addChildItems([item]);
      }
    });
  }
}

function transformItem(item: AiItem, board: Board): void {
  switch (item.itemType) {
    case "RichText":
      transformText(item.data, board);
      return;
    case "Shape":
      transformShape(item.data, board);
      return;
    case "Frame":
      transformFrame(item.data, board);
      return;
    case "Connector":
      transformConnector(item.data, board);
      return;
    case "Sticker":
      transformSticker(item.data, board);
      return;
  }
}

export function transformAiOutput(output: AiItem[], board: Board): void {
  itemsById.clear(); // Clear previous items map

  // First pass: create all non-connector items
  output.forEach((item: AiItem) => {
    if (item.itemType !== "Connector") {
      transformItem(item, board);
    }
  });

  // Second pass: create connectors (now that all items exist)
  output.forEach((item: AiItem) => {
    if (item.itemType === "Connector") {
      transformItem(item, board);
    }
  });

  itemsById.clear();
  zoomToFit(board);
}

function zoomToFit(board: Board): void {
  const items = board.items.listAll();
  if (items.length > 0) {
    const rect = board.items.getMbr();
    board.camera.zoomToFit(rect);
  }
}
