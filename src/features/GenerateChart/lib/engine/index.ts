import {
  Item,
  Shape,
  Board,
  Connector,
  Point,
  FixedPoint,
  toRelativePoint,
} from "microboard-temp";

export interface Node {
  id: number;
  itemType: "node";
  label: string;
  shape: string;
}

export interface Edge {
  itemType: "edge";
  start: number;
  end: number;
  label?: string;
}

export interface Graph {
  itemType: "graph";
  direction?: "TB" | "LR";
}

export type GraphObject = Graph | Edge | Node;

interface NodeLayout {
  id: number;
  row: number;
  column: number;
  width?: number;
  height?: number;
}

interface RowInfo {
  nodes: number[];
  y: number;
}

// TODO: Implement different layouts engine
// Now only work for tob-bottom classic flowcharts
export class LayoutEngine {
  private itemsById = new Map<number, Item>();
  private graphObjects: GraphObject[] = [];
  // private SCALE_FACTOR = 1;

  private nodeLayouts = new Map<number, NodeLayout>();
  private rows: RowInfo[] = [];
  private readonly DEFAULT_NODE_WIDTH = 200;
  private readonly DEFAULT_NODE_HEIGHT = 150;
  private readonly VERTICAL_GAP = 80;
  private readonly HORIZONTAL_GAP = 40;
  private generatedItems: Item[] = [];

  private board: Board;

  constructor(board: Board) {
    this.board = board;
  }

  protected transformConnector(options: {
    startId: number;
    endId: number;
    label?: string;
  }): Connector {
    const startItem: Item = this.itemsById.get(options.startId);
    const endItem: Item = this.itemsById.get(options.endId);
    const { left: startItemX, top: startItemY } = startItem.getPath().getMbr();
    const startWidth = startItem.getMbr().getWidth();
    const startHeight = startItem.getMbr().getHeight();
    const endWidth = endItem.getMbr().getWidth();
    const endHeight = endItem.getMbr().getHeight();

    const { left: endItemX, top: endItemY } = endItem.getPath().getMbr();

    function getConnectorPoint(
      startX: number,
      width?: number,
      percent?: string,
    ) {
      if (width) {
        const percentInt = percent?.replace("%", "") ?? 1;
        return startX + (width * Number(percentInt)) / 100;
      }
      return startX;
    }

    const isYes =
      options.label?.toLowerCase() === "yes" ||
      options.label?.toLowerCase() === "да";

    const isNo =
      options.label?.toLowerCase() === "no" ||
      options.label?.toLowerCase() === "нет";

    const startPosPercentages = {
      x: "50%",
      y: "100%",
    };
    if (isYes) {
      startPosPercentages.x = "0%";
      startPosPercentages.y = "50%";
    }
    if (isNo) {
      startPosPercentages.x = "100%";
      startPosPercentages.y = "50%";
    }

    const startX = getConnectorPoint(
      startItemX,
      startWidth,
      startPosPercentages.x,
    );
    const startY = getConnectorPoint(
      startItemY,
      startHeight,
      startPosPercentages.y,
    );
    const endX = getConnectorPoint(endItemX, endWidth, "50%");
    const endY = getConnectorPoint(endItemY, endHeight, "0%");

    const startRelative = toRelativePoint(new Point(startX, startY), startItem);
    const endRelative = toRelativePoint(new Point(endX, endY), endItem);

    const connector = new Connector(
      this.board,
      new FixedPoint(startItem, startRelative),
      new FixedPoint(endItem, endRelative),
    );
    connector.setStartPointerStyle("None");
    connector.setLineStyle("orthogonal");
    if (options.label) {
      connector.text.editor.editor.children = [
        {
          type: "paragraph",
          children: [
            {
              text: options.label,
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
    const newConnector = this.board.add<Connector>(connector);
    this.generatedItems.push(newConnector);

    return newConnector;
  }

  protected transformShape(options: {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    shape: string;
    label: string;
    rowInfo: {
      rowIndex: number;
      totalInRow: number;
      indexInRow: number;
    };
  }): void {
    const shape = new Shape(this.board);
    switch (options.shape) {
      case "rectangle":
        shape.setShapeType("Rectangle");
        break;
      case "diamond":
        shape.setShapeType("Rhombus");
        break;
      case "circle":
        shape.setShapeType("Circle");
        break;
      default:
        shape.setShapeType("Rectangle");
        break;
    }

    const camera = this.board.camera;
    const cameraPos = camera.getMbr().getCenter(); // { x: Number; y: Number }
    const rowLength =
      options.rowInfo.totalInRow * (options.width + this.HORIZONTAL_GAP);
    const translateX =
      cameraPos.x -
      rowLength / 2 +
      (options.rowInfo.indexInRow === 0 ? 0 : this.HORIZONTAL_GAP) +
      options.rowInfo.indexInRow * (options.width + this.HORIZONTAL_GAP);
    const translateY =
      cameraPos.y +
      options.rowInfo.rowIndex * (options.height + this.VERTICAL_GAP);

    shape.transformation.translateTo(translateX, translateY);
    shape.transformation.scaleTo(
      this.DEFAULT_NODE_WIDTH / 100,
      this.DEFAULT_NODE_HEIGHT / 100,
    );

    if (options.label) {
      shape.text.editor.editor.children = [
        {
          type: "paragraph",
          children: [
            {
              text: options.label,
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

    const newShape = this.board.add(shape);
    this.generatedItems.push(newShape);
    this.itemsById.set(options.id, newShape);
  }

  protected transformText(_options: {}): void {
    // No text for flowchart
  }

  protected transformFrame(_options: {}): void {
    // No frames for flowchart
  }

  protected transformSticker(_options: {}): void {
    // No stickers for flowchart
  }

  private assignRows(): void {
    this.nodeLayouts.clear();
    this.rows = [];

    const nodes = this.graphObjects.filter(
      (obj) => obj.itemType === "node",
    ) as Node[];
    const edges = this.graphObjects.filter(
      (obj) => obj.itemType === "edge",
    ) as Edge[];

    const outgoingEdges = new Map<number, number[]>();
    const incomingEdges = new Map<number, number[]>();

    nodes.forEach((node) => {
      outgoingEdges.set(node.id, []);
      incomingEdges.set(node.id, []);
    });

    edges.forEach((edge) => {
      outgoingEdges.get(edge.start)?.push(edge.end);
      incomingEdges.get(edge.end)?.push(edge.start);
    });

    const rootNodes = nodes
      .filter((node) => !incomingEdges.get(node.id)?.length)
      .map((node) => node.id);

    if (!rootNodes.length && nodes.length) {
      rootNodes.push(nodes[0].id);
    }

    const visited = new Set<number>();
    const queue: { nodeId: number; row: number }[] = rootNodes.map((id) => ({
      nodeId: id,
      row: 0,
    }));

    while (queue.length > 0) {
      const { nodeId, row } = queue.shift()!;

      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);

      while (this.rows.length <= row) {
        this.rows.push({
          nodes: [],
          y: row * (this.DEFAULT_NODE_HEIGHT + this.VERTICAL_GAP),
        });
      }

      this.rows[row].nodes.push(nodeId);

      this.nodeLayouts.set(nodeId, {
        id: nodeId,
        row,
        column: this.rows[row].nodes.length - 1,
        width: this.DEFAULT_NODE_WIDTH,
        height: this.DEFAULT_NODE_HEIGHT,
      });

      const children = outgoingEdges.get(nodeId) || [];
      for (const childId of children) {
        if (!visited.has(childId)) {
          queue.push({ nodeId: childId, row: row + 1 });
        }
      }
    }

    const lastRow = this.rows.length;
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        if (!this.rows[lastRow]) {
          this.rows[lastRow] = {
            nodes: [],
            y: lastRow * (this.DEFAULT_NODE_HEIGHT + this.VERTICAL_GAP),
          };
        }
        this.rows[lastRow].nodes.push(node.id);
        this.nodeLayouts.set(node.id, {
          id: node.id,
          row: lastRow,
          column: this.rows[lastRow].nodes.length - 1,
          width: this.DEFAULT_NODE_WIDTH,
          height: this.DEFAULT_NODE_HEIGHT,
        });
      }
    });

    this.rows.forEach((rowInfo) => {
      rowInfo.nodes.forEach((nodeId, column) => {
        const layout = this.nodeLayouts.get(nodeId);
        if (layout) {
          layout.column = column;
        }
      });
    });
  }

  // private getNodePosition(nodeId: number): { x: number; y: number } {
  //     const layout = this.nodeLayouts.get(nodeId);
  //     if (!layout) {
  //         return {x: 0, y: 0};
  //     }
  //
  //     const x = layout.column * (this.DEFAULT_NODE_WIDTH + this.HORIZONTAL_GAP);
  //     const y = layout.row * (this.DEFAULT_NODE_HEIGHT + this.VERTICAL_GAP);
  //
  //     return {x, y};
  // }

  private calculateRowMetrics(): Map<
    number,
    {
      totalItems: number;
      currentIndex: number;
      y: number;
    }
  > {
    const rowMetrics = new Map();
    this.nodeLayouts.forEach((layout) => {
      if (!rowMetrics.has(layout.row)) {
        rowMetrics.set(layout.row, {
          totalItems: 1,
          currentIndex: 0,
          y: layout.row * (this.DEFAULT_NODE_HEIGHT + this.VERTICAL_GAP),
        });
      } else {
        const metrics = rowMetrics.get(layout.row);
        metrics.totalItems++;
      }
    });

    return rowMetrics;
  }

  private getShapePosition(
    nodeId: number,
    rowMetrics: Map<
      number,
      {
        totalItems: number;
        currentIndex: number;
        y: number;
      }
    >,
  ): { x: number; y: number } {
    const layout = this.nodeLayouts.get(nodeId);
    if (!layout || !rowMetrics.has(layout.row)) {
      return { x: 0, y: 0 };
    }

    const metrics = rowMetrics.get(layout.row)!;
    const totalWidth =
      metrics.totalItems * this.DEFAULT_NODE_WIDTH +
      (metrics.totalItems - 1) * this.HORIZONTAL_GAP;
    const startX = -totalWidth / 2;

    const x =
      startX +
      metrics.currentIndex * (this.DEFAULT_NODE_WIDTH + this.HORIZONTAL_GAP) +
      this.DEFAULT_NODE_WIDTH / 2;

    metrics.currentIndex++;

    return {
      x,
      y: metrics.y,
    };
  }

  protected transformGraphObjects(): void {
    this.assignRows();
    this.generatedItems = [];

    const rowMetrics = this.calculateRowMetrics();

    const shapes: Map<number, { x: number; y: number }> = new Map();

    this.graphObjects.forEach((object) => {
      if (object.itemType === "node") {
        const position = this.getShapePosition(object.id, rowMetrics);
        shapes.set(object.id, position);

        this.transformShape({
          id: object.id,
          x: position.x,
          y: position.y,
          width: this.DEFAULT_NODE_WIDTH,
          height: this.DEFAULT_NODE_HEIGHT,
          shape: object.shape,
          label: object.label,
          rowInfo: {
            rowIndex: this.nodeLayouts.get(object.id)?.row ?? 0,
            totalInRow:
              rowMetrics.get(this.nodeLayouts.get(object.id)?.row ?? 0)
                ?.totalItems ?? 1,
            indexInRow: this.nodeLayouts.get(object.id)?.column ?? 0,
          },
        });
      }
    });

    this.graphObjects.forEach((object) => {
      if (object.itemType === "edge") {
        const startPos = shapes.get(object.start);
        const endPos = shapes.get(object.end);

        if (startPos && endPos) {
          this.transformConnector({
            startId: object.start,
            endId: object.end,
            label: object.label,
          });
        }
      }
    });

    this.board.selection.removeAll();
    this.board.selection.add(this.generatedItems);
    const mbr = this.board.selection.getMbr();
    if (!mbr) {
      this.board.selection.removeAll();
      return;
    }
    this.board.camera.zoomToFit(mbr);
    this.board.selection.removeAll();
  }

  parse(input: string): GraphObject[] {
    const objects: GraphObject[] = [];
    const idMap = new Map<string, number>();
    const declaredNodes = new Set<string>();
    let currentId = 1;

    const data = input
      .replace(/^```(?:dot|)\s*|\s*```$/g, "")
      .replace(/\/\/.*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();

    const graphDeclareRegex = /(?:di)?graph\s*(?:\w+\s*)?\{([\s\S]*)\}/i;
    const graphMatch = data.match(graphDeclareRegex);
    if (!graphMatch) {
      throw new Error("Invalid DOT format: Missing graph declaration");
    }
    const graphContent = graphMatch[1];

    const graphDirectionRegex = /\brankdir\s*=\s*(TB|LR|BT|RL)\b/i;
    const directionMatch = graphContent.match(graphDirectionRegex);
    if (directionMatch) {
      const direction = directionMatch[1] as "TB" | "LR";
      objects.push({ itemType: "graph", direction });
    } else {
      objects.push({ itemType: "graph", direction: "TB" });
    }

    const parseAttributes = (attrString: string): Record<string, string> => {
      const attrs: Record<string, string> = {};
      const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|([^,\s\]]+))/g;
      let match;
      while ((match = attrRegex.exec(attrString)) !== null) {
        const [, key, quotedValue, unquotedValue] = match;
        attrs[key] = quotedValue ?? unquotedValue;
      }
      return attrs;
    };

    const lines = graphContent
      .split(";")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("rankdir"));

    for (const line of lines) {
      if (!line.includes("->")) {
        // Find DOT node declaration
        const nodeMatch = line.match(
          /(\w+)\s*\[((?:\w+\s*=\s*(?:"[^"]*"|[^,\]]+)\s*,?\s*)*)\]/,
        );
        if (nodeMatch) {
          const [, nodeName, attrString] = nodeMatch;
          const attrs = parseAttributes(attrString);

          if (nodeName.toLowerCase() === "node") {
            continue;
          }

          if (!idMap.has(nodeName)) {
            idMap.set(nodeName, currentId++);
          }

          if (!declaredNodes.has(nodeName)) {
            declaredNodes.add(nodeName);
            objects.push({
              id: idMap.get(nodeName)!,
              itemType: "node",
              label: attrs.label?.replace(/^"(.*)"$/, "$1") || nodeName,
              shape: attrs.shape?.replace(/^"(.*)"$/, "$1") || "rectangle",
            });
          }
        }
      } else {
        // This is an edge declaration
        const edgeMatch = line.match(/(\w+)\s*->\s*(\w+)(?:\s*\[(.*?)\])?/);
        if (edgeMatch) {
          const [, start, end, attrString] = edgeMatch;

          for (const nodeName of [start, end]) {
            if (!idMap.has(nodeName)) {
              idMap.set(nodeName, currentId++);
            }

            if (!declaredNodes.has(nodeName)) {
              objects.push({
                id: idMap.get(nodeName)!,
                itemType: "node",
                label: nodeName,
                shape: "rectangle",
              });
            }
          }

          const attrs = attrString ? parseAttributes(attrString) : {};
          objects.push({
            itemType: "edge",
            start: idMap.get(start)!,
            end: idMap.get(end)!,
            label: attrs.label?.replace(/^"(.*)"$/, "$1"),
          });
        }
      }
    }

    this.graphObjects = objects;
    this.transformGraphObjects();
    return objects;
  }
}
