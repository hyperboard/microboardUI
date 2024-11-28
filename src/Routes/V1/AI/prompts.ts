import { instance as vizInstance } from "@viz-js/viz";

const shapeDescription = `
type ShapeType = "Rectangle" | "Trapezoid" | "Circle" | "Triangle" | "Rhombus" | "Pentagon" | "Octagon" | "Hexagon" | "Parallelogram" | "Star" | "Cloud" | "Cross" | "Cylinder" | "BracesLeft" | "BracesRight";
interface Shape {
    id: number; // integer
    x: number; // float, position of top-left corner on Board or Frame
    y: number; // float, position of top-left corner on Board or Frame
    width: number; // float, in pixels
    height: number; // float, in pixels
    rotation: number; // float, in degrees
    fill: string; // use HEX, default "#ffffff"
    stroke: string; // use HEX, default "#000000"
    strokeWidth: number;
    relativeTo: "Board" | "Frame";
    text?: string;
    type: ShapeType;
    }
`;

const frameDescription = `
interface Frame {
    id: number; // integer
    title?: string;
    items: number[]; // array of ids
    x: number; // float, position of top-left corner on Board
    y: number; // float, position of top-left corner on Board
    width: number; // float, in pixels
    height: number; // float, in pixels
    }
`;

const textDescription = `
interface RichText {
    id: number; // integer    text: string;
    text: string; // string
    bold: boolean;
    italic: boolean;
    underline: boolean;
    "line-through": boolean;
    fontColor: string; // use HEX, default "#000000" 
    fontSize: number; // default to 14
    fontHighlight?: string;
    x: number; // float, position of top-left corner on Board or Frame
    y: number; // float, position of top-left corner on Board or Frame
    width: number; // float, in pixels
    height: number; // float, in pixels
    color: string; // use HEX, default "#000000"
    relativeTo: "Board" | "Frame";
    }
`;

const connectorDescription = `
type PointerStyle =
	| "None"
	| "Angle"
	| "AngleTalk"
	| "ArrowBroad"
	| "ArrowThin"
	| "CircleFilled"
	| "DiamondEmpty"
	| "DiamondFilled"
	| "Many"
	| "ManyMandatory"
	| "ManyOptional"
	| "One"
	| "OneMandatory"
	| "OneOptional"
	| "TriangleEmpty"
	| "TriangleFilled"
	| "TriangleFilledTalk"
	| "Zero";
type Point = {
 type: "Fixed", // use this if connector attached to certain item
 id: number; // integer, point to the item
 relativeX: number; // float form 0 to 100, relative to the item
 relativeY: number; // float form 0 to 100, relative to the item
 style: PointerStyle;
}
interface Connector {
    id: number; // integer
    startPoint: Point;
    endPoint: Point;
    lineType: "orthogonal"; 
    text?: string; 
}`;

const imageDescription = `
interface Image {

}
`;

const stickerDescription = `
interface Sticker {
    id: number; // integer
    backgroundColor: "Sky Blue" | "Pastel Red" | "Pale Yellow" | "Sage Green" | "Lavender" | "Aqua Cyan" | "Black Black" | "Light Gray";
    text: string;
    x: number; // float, position of top-left corner on Board or Frame
    y: number; // float, position of top-left corner on Board of Frame
    size: number; // in pixels, size of the side of square
    relativeTo: "Board" | "Frame";
}
`;

export const getBlockSchemaPrompt = () => {
    return `
You are an expert block schema generator for a whiteboard application, proficient in DOT notation.

Given user specifications, generate a detailed block schema using DOT notation to represent various elements, connections, and properties within the whiteboard app. 

Respond with only the generated schema in DOT notation and no additional explanations or comments.
    `;
};

const getGenerateChartFromDotSchemaPrompt = () => {
    return `
Convert the provided JSON DOT notation graph into a structured whiteboard visualization with the following object types:

1. **Shape**: ${shapeDescription}
2. **Frame**: ${frameDescription}
3. **RichText**: ${textDescription}
4. **Connector**: ${connectorDescription}

### Conversion Guidelines:
- **Clusters**: Convert each cluster into a **Frame**.
- **Nodes**: Map each node to either a **Shape**. Include any node labels as text property of Shape. If node are part of cluster it should be relative to Frame.
- **Edges**: Convert each edge into a **Connector** to illustrate relationships. Use distinct connector styles if relationships differ.
- **Labels**: Apply labels as embedded text within **Shapes** or as separate **RichText** objects where appropriate.
- **Structure**: Maintain the hierarchy and logical flow of the graph, arranging elements to clearly convey relationships.
- **Positioning**: Position each item to reflect the graph’s structure, ensuring clarity of relationships and alignment. By default each position in DOT is absolute, but if node inside of cluster you need to adjust it for be relative to Frame.

### Output Format:
Return only a JSON array of objects where each object matches the following structure:
\`\`\`
{
    itemType: "Shape" | "Frame" | "RichText" | "Connector" | "Sticker",
    data: Shape | Frame | RichText | Connector | Sticker
}
\`\`\`

Respond with only the JSON array as the output.`;
};

export async function genDot(dotSchema: string) {
    const viz = await vizInstance();

    try {
        // Render the DOT schema as JSON
        const jsonSchema = await viz.renderJSON(dotSchema);
        // const jsonSchema = await viz.renderString(dotSchema);

        return jsonSchema; // Parsing to return as a JavaScript object
    } catch (error) {
        console.error("Error generating JSON from DOT schema:", error);
        return null;
    }
}

const getGenerateFlowchartVisualizationPrompt = () => {
    return `
Create a structured, row-based flowchart visualization for the described concept, positioning elements in a top-to-bottom format. Arrange multiple choices side-by-side in rows, and use connectors to guide the flow between them. Adjust the number of elements based on the complexity of the topic—use fewer elements (5-7) for simpler models and more (15-20) for complex systems.

1. **Shape**: ${shapeDescription}
3. **RichText**: ${textDescription}
4. **Connector**: ${connectorDescription}

### Visualization Guidelines:
- **Flowchart Structure**: Organize the flow from top to bottom with each step in its own row.
- **Choices and Branching**: If a step has multiple options, display them side-by-side in the same row, creating a branching effect.
- **Main Elements**: Convert each component of the concept into **Shapes** with labels for clarity.
- **Relationships**: Use **Connectors** to represent paths, showing dependencies or logical sequences.
- **Annotations**: Add **RichText** where necessary to clarify relationships or add context.
- **Structure**: Ensure a clear path from start to end, with branching options in rows for multiple choices.
- **Complexity**:
  - You should create create complex systems with 15-20 elements if needed.

### Output Format:
Return only a JSON array of objects where each object follows this structure:
\`\`\`
{
    itemType: "Shape" | "Frame" | "RichText" | "Connector" | "Sticker",
    data: Shape | Frame | RichText | Connector | Sticker
}
\`\`\`

Based on the provided concept, create a row-based flowchart visualization with multiple choices per row where relevant. Respond with only the JSON array as the output.`;
};

const getGenerateDotSchemaPrompt = () => {
    return `
Create a comprehensive DOT language graph schema for the described concept.

### Guidelines:
- Use clusters to group related elements
- Create meaningful node hierarchies
- Apply appropriate connections and relationships
- Include descriptive labels
- Use node and edge attributes to enhance clarity
- Structure the layout for optimal readability

### Required DOT Features:
- Use 'digraph' for directed relationships
- Implement 'subgraph cluster_X' for logical grouping
- Apply labels for nodes and edges
- Include positioning hints where relevant
- Use appropriate node shapes and styles
- Add edge decorations where meaningful

Example structure:
digraph {
    // Graph attributes
    rankdir=LR;
    
    // Clusters for grouping
    subgraph cluster_0 {
        label = "Group A";
        node [style=filled];
        // ... nodes
    }
    
    // Nodes and relationships
    node1 [label="Component 1"];
    node2 [label="Component 2"];
    node1 -> node2 [label="connects to"];
}

Respond with only the DOT language schema, without any additional text or explanation.`;
};

const getDotToVisualizationPrompt = () => {
    return `
Convert the provided DOT language graph into a structured visualization with these elements:

1. **Shape**: ${shapeDescription}
3. **RichText**: ${textDescription}
4. **Connector**: ${connectorDescription}

### Conversion Rules:
- **DOT Clusters**: Do not implement. Just use related content.
- **DOT Nodes**: Transform into **Shapes**
  - Use node labels as shape text
  - Maintain node attributes where applicable
  - If node is within cluster, position relative to parent Frame
- **DOT Edges**: Convert to **Connectors**
  - Preserve edge labels
  - Maintain edge direction
  - Keep edge styling attributes
- **DOT Labels**: Convert to either:
  - Embedded text within Shapes
  - Separate RichText objects
  - Frame titles for clusters
- **Layout**:
  - Respect DOT's 'rankdir' for general flow
  - Maintain relative positioning
  - Preserve hierarchical structure
  - Convert absolute positions to relative when inside Frames
### Output Format:
Return only a JSON array of objects where each object matches the following structure:
\`\`\`
{
    itemType: "Shape" | "Frame" | "RichText" | "Connector" | "Sticker",
    data: Shape | Frame | RichText | Connector | Sticker
}
\`\`\`

Parse the provided DOT schema and respond with only the JSON array as output.`;
};

export const prompts = {
    getGenerateChartFromDotSchemaPrompt,
    getBlockSchemaPrompt,
    getGenerateFlowchartVisualizationPrompt,
    getDotToVisualizationPrompt,
    getGenerateDotSchemaPrompt,
};
