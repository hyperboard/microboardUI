import { Item, ItemData } from "Board/Items/Item";
import { Board } from "Board/Board";
import { itemFactories } from "Board/itemFactories";
import { validators } from "Board/Validators/Validators";
import {
	Command,
	ItemCommand,
	itemCommandFactories,
} from "Board/Events/Command";
import { CustomTool } from "Board/Tools/CustomTool";
import { registeredTools } from "Board/Tools/Tools";
import { BaseItemData } from "Board/Items/BaseItem/BaseItem";
import { ItemOperation } from "Board/Events/EventsOperations";

type RegisterItemArgs = {
	item: any;
	defaultData: BaseItemData;
	toolData: { name: string; tool: typeof CustomTool };
	command?: typeof ItemCommand;
};

export function registerItem({
	item,
	defaultData,
	command,
	toolData,
}: RegisterItemArgs): void {
	const { itemType } = defaultData;
	itemFactories[itemType] = createItemFactory(item, defaultData);
	validators[itemType] = createItemValidator(defaultData);
	registeredTools[toolData.name] = toolData.tool;

	if (command) {
		itemCommandFactories[itemType] = createItemCommandFactory(
			command,
			itemType,
		);
	}
}

function createItemFactory(item: any, defaultData: BaseItemData) {
	return function itemFactory(
		id: string,
		data: ItemData,
		board: Board,
	): Item {
		if (data.itemType !== defaultData.itemType) {
			throw new Error(`Invalid data for ${defaultData.itemType}`);
		}
		return new item(board, id, defaultData).setId(id).deserialize(data);
	};
}

function createItemValidator(defaultData: BaseItemData) {
	return function validateItem(itemData: any): boolean {
		for (const [key, value] of Object.entries(defaultData)) {
			if (
				!itemData.hasOwnProperty(key) ||
				typeof itemData[key] !== typeof value
			) {
				return false;
			}
		}
		return true;
	};
}

function createItemCommandFactory(
	command: typeof ItemCommand,
	itemType: string,
) {
	return function itemCommandFactory(
		items: Item[],
		operation: ItemOperation,
	): Command {
		return new command(
			items.filter((item): boolean => item.itemType === itemType),
			operation,
		);
	};
}
