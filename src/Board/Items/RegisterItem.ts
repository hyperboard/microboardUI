import { Item, ItemData } from "Board/Items/Item";
import { Board } from "Board/Board";
import { itemFactories } from "Board/itemFactories";
import { validators } from "Board/Validators/Validators";
import { itemCommandFactories, ItemCommandFactory } from "Board/Events/Command";
import { CustomTool } from "Board/Tools/CustomTool";
import { registeredTools } from "Board/Tools/Tools";

type ItemFactory = (id: string, data: ItemData, board: Board) => Item;
type Validator = (itemData: any) => boolean;

type RegisterItemArgs = {
	itemFactory: ItemFactory;
	validator: Validator;
	itemType: string;
	toolData: { name: string; tool: typeof CustomTool };
	commandFactory?: ItemCommandFactory;
};

export function registerItem({
	itemFactory,
	validator,
	itemType,
	commandFactory,
	toolData,
}: RegisterItemArgs): void {
	itemFactories[itemType] = itemFactory;
	validators[itemType] = validator;
	registeredTools[toolData.name] = toolData.tool;

	if (commandFactory) {
		itemCommandFactories[itemType] = commandFactory;
	}
}
