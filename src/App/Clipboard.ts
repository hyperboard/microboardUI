import { Item, ItemData } from "Board/Items";

export class Clipboard {
	items: { [key: string]: ItemData } = {};

	list(): Item[] {
		throw new Error("Method not implemented.");
	}

	set(data: { [key: string]: ItemData } | null): void {
		if (data) {
			this.items = data;
		} else {
			this.items = {};
		}
	}

	get(): { [key: string]: ItemData } | null {
		return Object.keys(this.items).length > 0 ? this.items : null;
	}
}
