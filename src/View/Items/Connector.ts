import type { ConnectorAnchorColors } from "Board/Items/Connector/types";

export const CONNECTOR_COLOR = "black";
export const CONNECTOR_LINE_WIDTH = 1;
export const DEFAULT_END_POINTER = "TriangleFilled";
export const DRAW_TEXT_BORDER = false;
export const TEXT_BORDER_PADDING = 0;
export const CONNECTOR_ANCHOR_COLOR: ConnectorAnchorColors = {
	snapBorder: "rgb(71, 120, 245)",
	snapBackgroundHighlight: "rgba(0,0,0,0.1)",
	snapBackground: "rgba(0,0,0,0)",
	anchorBorder: "rgb(147, 175, 246)",
	anchorBackground: "rgb(255, 255, 255)",
	anchorHighlight: "rgb(255, 255, 255)",
	pointBorder: "rgb(147, 175, 246)",
	pointBackground: "rgb(147, 175, 246)",
};

export const CONNECTOR_ANCHOR_TYPE = "rect";
export const CONNECTOR_LINE_CAP = "round";
