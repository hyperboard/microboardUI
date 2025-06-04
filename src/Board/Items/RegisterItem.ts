import { Item, ItemData } from "Board/Items/Item";
import { Board } from "Board/Board";
import { itemFactories } from "Board/itemFactories";
import { validators } from "Board/Validators/Validators";
import { itemCommandFactories, ItemCommandFactory } from "Board/Events/Command";

type ItemFactory = (id: string, data: ItemData, board: Board) => Item;
type Validator = (itemData: any) => boolean;

type RegisterItemArgs = {
	itemFactory: ItemFactory;
	validator: Validator;
	itemType: string;
	commandFactory?: ItemCommandFactory;
};

export function registerItem({
	itemFactory,
	validator,
	itemType,
	commandFactory,
}: RegisterItemArgs): void {
	itemFactories[itemType] = itemFactory;
	validators[itemType] = validator;

	if (commandFactory) {
		itemCommandFactories[itemType] = commandFactory;
	}
}
