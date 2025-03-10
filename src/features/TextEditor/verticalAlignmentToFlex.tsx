import { VerticalAlignment } from "Board/Items/Alignment";

export function verticalAlignmentToFlex(
	align: VerticalAlignment,
): "start" | "center" | "end" {
	switch (align) {
		case "top":
			return "start";
		case "center":
			return "center";
		case "bottom":
			return "end";
	}
}
