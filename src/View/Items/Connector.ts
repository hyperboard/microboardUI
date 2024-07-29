import type { ConnectorAnchorColors } from "Board/Items/Connector/types";

export const CONNECTOR_COLOR = "black";
export const CONNECTOR_LINE_WIDTH = 1;
export const DEFAULT_END_POINTER = "TriangleFilled";
export const DRAW_TEXT_BORDER = false;
export const TEXT_BORDER_PADDING = 0;
export const CONNECTOR_ANCHOR_COLOR: ConnectorAnchorColors = {
	snapBorder: "rgba(0,0,255,0.8)",
	snapBackgroundHighlight: "rgba(0,0,0,0.2)",
	snapBackground: "rgba(0,0,0,0)",
	anchorBorder: "rgba(0,0,255,0.8)",
	anchorBackground: "rgba(255,255,255,0.8)",
	anchorHighlight: "rgba(0,0,255,0.8)",
	pointBorder: "rgba(0,0,0,0)",
	pointBackground: "rgba(0,0,255,0.8)",
};

export const CONNECTOR_ANCHOR_TYPE = "rect";
export const CONNECTOR_LINE_CAP = "round";
