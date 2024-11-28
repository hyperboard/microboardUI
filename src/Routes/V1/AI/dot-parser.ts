export interface JSONDot extends Record<any, any> {
    objects: any[];
    edges: any[];
}

export function transformDotJson(dotJson: JSONDot): any[] {
    const items: any[] = [];
    let itemId = 1;

    // Helper function to parse bb (bounding box) coordinates
    function parseBB(bb: string) {
        const [x1, y1, x2, y2] = bb.split(",").map(parseFloat);
        return { x1, y1, x2, y2, width: x2 - x1, height: y2 - y1 };
    }

    // Helper function to parse position string including spline points
    function parsePosition(pos: string): { x: number; y: number }[] {
        // Handle edge position format "e,255.26,159.71 263.57,362.57 235.25,355.54..."
        const parts = pos.split(" ");
        return parts
            .filter((p) => p && !p.startsWith("e,"))
            .map((point) => {
                const [x, y] = point.split(",").map(parseFloat);
                return { x, y };
            });
    }

    // Helper function to calculate relative position
    function calculateRelativePosition(pos: string, bb: string | null) {
        if (!bb) return { relativeX: 0, relativeY: 0 };

        const box = parseBB(bb);
        const [x, y] = pos.split(",").map(parseFloat);
        return {
            relativeX: ((x - box.x1) / box.width) * 100,
            relativeY: ((y - box.y1) / box.height) * 100,
        };
    }

    // Transform clusters (subgraphs) into Frames
    dotJson.objects.forEach((obj) => {
        if (obj.name?.startsWith("cluster_")) {
            const bbox = parseBB(obj.bb);

            // Add Frame
            items.push({
                itemType: "Frame",
                data: {
                    id: itemId++,
                    title: obj.label || "",
                    items: obj.nodes || [],
                    x: bbox.x1,
                    y: bbox.y1,
                    width: bbox.width,
                    height: bbox.height,
                    style: obj.style || "solid", // Add support for dashed style
                },
            });

            // Calculate text position relative to frame
            if (obj.lp) {
                const [textX, textY] = obj.lp.split(",").map(parseFloat);
                const textRelPos = {
                    x: ((textX - bbox.x1) / bbox.width) * 100,
                    y: ((textY - bbox.y1) / bbox.height) * 100,
                };

                items.push({
                    itemType: "RichText",
                    data: {
                        id: `text_${itemId - 1}`,
                        text: obj.label || "",
                        bold: false,
                        italic: false,
                        underline: false,
                        "line-through": false,
                        fontColor: "#000000",
                        fontSize: 14,
                        x: textX,
                        y: textY,
                        width: (parseFloat(obj.lwidth) || 1) * 72,
                        height: (parseFloat(obj.lheight) || 0.23) * 72,
                        color: "#000000",
                        relativeTo: "Frame",
                        relativeX: textRelPos.x,
                        relativeY: textRelPos.y,
                    },
                });
            }
        }
    });

    // Transform nodes into Shapes
    dotJson.objects.forEach((obj) => {
        if (!obj.name?.startsWith("cluster_") && obj.pos) {
            const [nodeX, nodeY] = obj.pos.split(",").map(parseFloat);
            const width = parseFloat(obj.width || "0.75") * 72;
            const height = parseFloat(obj.height || "0.5") * 72;

            // Find parent cluster
            const parentCluster = dotJson.objects.find(
                (cluster) => cluster.name?.startsWith("cluster_") && cluster.nodes?.includes(obj._gvid)
            );

            let relativePos = { relativeX: 0, relativeY: 0 };
            if (parentCluster) {
                relativePos = calculateRelativePosition(obj.pos, parentCluster.bb);
            }

            items.push({
                itemType: "Shape",
                data: {
                    id: obj._gvid,
                    x: nodeX - width / 2, // Center the shape
                    y: nodeY - height / 2,
                    width: width,
                    height: height,
                    rotation: 0,
                    fill: "#ffffff",
                    stroke: "#000000",
                    strokeWidth: 1,
                    relativeTo: parentCluster ? "Frame" : null,
                    text: obj.label || "",
                    type: obj.shape === "box" ? "Rectangle" : "Ellipse",
                    relativeX: relativePos.relativeX,
                    relativeY: relativePos.relativeY,
                },
            });
        }
    });

    // Transform edges into Connectors
    dotJson.edges.forEach((edge) => {
        const points = parsePosition(edge.pos);
        if (points.length < 2) return;

        // Extract start and end points
        const startPoint = points[0];
        const endPoint = points[points.length - 1];

        items.push({
            itemType: "Connector",
            data: {
                id: `edge_${edge._gvid}`,
                startPoint: {
                    type: "Fixed",
                    id: edge.tail,
                    x: 0,
                    y: 0,
                    style: "None",
                },
                endPoint: {
                    type: "Fixed",
                    id: edge.head,
                    x: 0,
                    y: 0,
                    style: edge.arrowhead || "None",
                },
                lineType: "orthogonal",
                points: points,
                label: edge.label || "",
                labelPosition: edge.lp
                    ? {
                          x: parseFloat(edge.lp.split(",")[0]),
                          y: parseFloat(edge.lp.split(",")[1]),
                      }
                    : undefined,
            },
        });
    });

    return items;
}
