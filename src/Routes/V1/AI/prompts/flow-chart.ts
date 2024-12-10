const shapeDescription = `
type ShapeType = 
  | "Rectangle"      // Process or action block
  | "Rhombus"       // Decision/branch point
  | "Circle"        // Start/End terminal
  | "Parallelogram" // Input/Output
  | "PredefinedProcess"; // Predefined process or subroutine

interface Shape {
    id: number;      // integer
    x: number;       // float, position of top-left corner on Board or Frame
    y: number;       // float, position of top-left corner on Board or Frame
    width: number;   // float, in pixels
    height: number;  // float, in pixels
    rotation: number; // float, in degrees
    fill: string;    // use HEX, default "#ffffff"
    stroke: string;  // use HEX, default "#000000"
    strokeWidth: number;
    relativeTo: "Board" | "Frame";
    text?: string;   // text content inside the shape
    type: ShapeType;
    purpose?: "Start" | "End" | "Process" | "Decision" | "Input" | "Output" | "Subroutine";
}`;

const connectorDescription = `
type PointerStyle =
    | "None"
    | "ArrowBroad";

type ConnectorLabel =
    | "Yes"         // For positive decision outcomes
    | "No"          // For negative decision outcomes
    | "Loop"        // For iteration markers
    | string;       // For custom labels

type Point = {
    type: "Fixed",
    id: number;     // integer, point to the item
    relativeX: number; // float from 0 to 100, relative to the item
    relativeY: number; // float from 0 to 100, relative to the item
    style: PointerStyle;
}

interface Connector {
    id: number;     // integer
    startPoint: Point;
    endPoint: Point;
    lineType: "straight" | "orthogonal" | "curved";
    text?: ConnectorLabel;
    isLoop?: boolean; // Indicates if this connector is part of a loop
}`;

const getGenerateFlowchartVisualizationPrompt = () => {
    return `
Create a standardized flowchart visualization following classical computer science conventions for algorithmic representation. The flowchart should support decision-making, loops, and various types of operations.

1. **Shape**: ${shapeDescription}
2. **Connector**: ${connectorDescription}

### Flowchart Conventions:


### Output Format:
Return only a JSON array of objects where each object follows this structure:
\`\`\`
{
    itemType: "Shape" | "Connector",
    data: Shape | Connector
}
\`\`\`

Generate a flowchart that strictly follows these conventions, maintaining clarity and standard notation throughout the diagram. The output should be a complete, valid JSON array of shapes and connectors.
Respond only with JSON array oj objects. This is important!`;
};

const getFlowChartDotPrompt = () => {
    return `
    You are a expert flowchart generator for a whiteboard application, proficient in DOT notation.
    
    Given user specifications, generate a classical flowchart using DOT notation to represent various elements, connections, and properties within the whiteboard app.
    
    Use this guidelines:
    - Do not use subgraphs.
    - Define shapes for each node separately. Do not use general shape definition like node [shape=circle];.
    - For start and end nodes use circle shape.
    - For decision - diamond shape.
    - For common node - rectangle shape.
    - Graph direction - TB (top-bottom).
    - The nodes that come from the answer "Yes" are placed first, from "No" - the second.
    - Prefer user language. English or Russian allowed.
    
    Respond with only the generated diagram in DOT notation and no additional explanations or comments.
    `;
};

export { getGenerateFlowchartVisualizationPrompt, getFlowChartDotPrompt };
