import { Item, ItemData } from "Board/Items";

export class Clipboard {
	items: { [key: string]: ItemData } = {};

	list(): Item[] {
		throw new Error("Method not implemented.");
	}
}
