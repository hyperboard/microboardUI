/*
import { Connection } from "./";
import { Shape } from "Board/Items";
import { assert } from "chai";
import { Board } from "Board";

const server = new Connection();

function buildScope(userId: number, connectionId: number): Board {
	const userService = new UserService(userId, connectionId);
	return new Board("", server, userService);
}

describe("Test board sync", () => {
	const firstBoard = buildScope(1, 1);
	firstBoard.connectServer();
	const secondBoard = buildScope(2, 2);
	secondBoard.connectServer();

	it("Test sync shape", () => {
		const shape = firstBoard.add(new Shape());
		assert.exists(secondBoard.items.getById(shape.getId()));
	});
	it("Test board sync offline changes", () => {
		// отключаем второго пользователя от сервера
		secondBoard.disconnectServer();

		// меняем цвет в шейпе на первой доске
		const firstShapeOnFirstBoard = firstBoard.items.listAll()[0] as Shape;
		firstShapeOnFirstBoard.setBackgroundColor("#ffffff");

		// добавляем шейп на вторую доску
		const secondShapeOnSecondBoard = secondBoard.add(new Shape());
		// подключаем вторую доску к серверу
		secondBoard.connectServer();

		const firstShapeOnSecondBoard = secondBoard.items.listAll()[0] as Shape;
		assert.equal(
			firstShapeOnFirstBoard.getBackgroundColor(),
			firstShapeOnSecondBoard.getBackgroundColor(),
		);

		assert.exists(
			firstBoard.items.getById(secondShapeOnSecondBoard.getId()),
		);
	});

	it("Test board sync merge", () => {
		// отключаем второго пользователя от сервера
		secondBoard.disconnectServer();

		// меняем цвет в шейпе на первой доске
		const firstShapeOnFirstBoard = firstBoard.items.listAll()[0] as Shape;
		firstShapeOnFirstBoard.setBackgroundColor("#123456");

		// меняем цвет в шейпе на второй доске
		const firstShapeOnSecondBoard = secondBoard.items.listAll()[0] as Shape;
		firstShapeOnSecondBoard.setBackgroundColor("#012345");

		// подключаем вторую доску к серверу
		secondBoard.connectServer();

		assert.equal(firstShapeOnFirstBoard.getBackgroundColor(), "#012345");
	});

	it("Test undo after other user", () => {
		// меняем цвет в шейпе на первой доске
		const firstShapeOnFirstBoard = firstBoard.items.listAll()[0] as Shape;

		const startBorderWidth = firstShapeOnFirstBoard.getBorderWidth();
		firstShapeOnFirstBoard.setBackgroundColor("#FF00FF");
		firstShapeOnFirstBoard.setBorderWidth(5);

		// меняем цвет в шейпе на второй доске
		const firstShapeOnSecondBoard = secondBoard.items.listAll()[0] as Shape;
		firstShapeOnSecondBoard.setBackgroundColor("#FF11FF");

		// отменяем изменения цвета на первой доске
		firstBoard.undo();

		// отменя действия для первой доски не должно было сработать, так как последний раз цвет был изменен на второй доске
		assert.equal(firstShapeOnSecondBoard.getBackgroundColor(), "#FF11FF");
		assert.equal(firstShapeOnSecondBoard.getBackgroundColor(), "#FF11FF");
		// но ширина рамки должна была вернуться к предыдущей
		assert.equal(
			firstShapeOnSecondBoard.getBorderWidth(),
			startBorderWidth,
		);
		assert.equal(
			firstShapeOnSecondBoard.getBorderWidth(),
			startBorderWidth,
		);

		secondBoard.undo();

		assert.equal(firstShapeOnSecondBoard.getBackgroundColor(), "#FF00FF");
		assert.equal(firstShapeOnSecondBoard.getBackgroundColor(), "#FF00FF");
	});
});
*/
