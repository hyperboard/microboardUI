import { ConnectorLineStyle } from "Board/Items/Connector";
import { ConnectorEdge } from "Board/Items/Connector/Pointers";
import { ConnectorPointerStyle } from "Board/Items/Connector/Pointers/Pointers";

export class SessionStorage {
	setConnectorPointer(
		type: ConnectorPointerStyle,
		edge: ConnectorEdge,
	): void {
		sessionStorage.setItem(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
			type,
		);
	}

	getConnectorPointer(
		edge: ConnectorEdge,
	): ConnectorPointerStyle | undefined {
		const saved = sessionStorage.getItem(
			`connector${edge.charAt(0).toUpperCase() + edge.slice(1)}Pointer`,
		);
		return (saved as ConnectorPointerStyle) || undefined;
	}

	setConnectorLineStyle(type: ConnectorLineStyle): void {
		sessionStorage.setItem("connectorLineStyle", type);
	}

	getConnectorLineStyle(): ConnectorLineStyle | undefined {
		const saved = sessionStorage.getItem("connectorLineStyle");
		if (saved) {
			return saved as ConnectorLineStyle;
		}

		return undefined;
	}
}
