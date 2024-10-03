import { Board } from "./Board";
import { BoardSnapshot } from "./Board/Board";

export function isFiniteNumber(value: unknown): boolean {
	return typeof value === "number" && isFinite(value);
}

export function toFiniteNumber(value: unknown, coerce = 0): number {
	return isFiniteNumber(value) ? (value as number) : coerce;
}

export function isNumberEven(number: number): boolean {
	return number !== 0 && number % 2 === 0;
}

export function isNumberEvenOrZero(number: number): boolean {
	return number % 2 === 0;
}

export function isNumberOdd(number: number): boolean {
	return number % 2 !== 0;
}

export function getRandomNumber(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function forceNumberIntoInterval(
	number: number,
	min: number,
	max: number,
): number {
	// same as return Math.min (max, Math.max (min, number));
	// same as return Math.max (min, Math.min (max, number));
	return number < min ? min : number > max ? max : number;
}

function isEqual(x: unknown, y: unknown): boolean {
	if (x === y) {
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	} else {
		return x !== x && y !== y;
	}
}

interface MapStringUnknown {
	[key: string]: unknown;
}

/*
	Returns true if isObject and toObject have the same properties. 
*/

export function isShallowEqualTo(
	isObject: unknown,
	toObject: unknown,
): boolean {
	if (isEqual(isObject, toObject)) {
		return true;
	}

	if (
		typeof isObject !== "object" ||
		isObject === null ||
		typeof toObject !== "object" ||
		toObject === null
	) {
		return false;
	}

	const keysA = Object.keys(isObject);
	const keysB = Object.keys(toObject);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		if (
			!Object.prototype.hasOwnProperty.call(toObject, keysA[i]) ||
			!isEqual(
				(isObject as MapStringUnknown)[keysA[i]],
				(toObject as MapStringUnknown)[keysA[i]],
			)
		) {
			return false;
		}
	}

	return true;
}

/*
	Returns true if isObject has all the properties that toObject has. 
*/

export function isShallowSimilarTo(
	isObject: unknown,
	toObject: unknown,
): boolean {
	if (isEqual(isObject, toObject)) {
		return true;
	}

	if (
		typeof isObject !== "object" ||
		isObject === null ||
		typeof toObject !== "object" ||
		toObject === null
	) {
		return false;
	}

	const keysA = Object.keys(isObject);
	const keysB = Object.keys(toObject);

	if (keysA.length > keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		if (
			!Object.prototype.hasOwnProperty.call(toObject, keysA[i]) ||
			!isEqual(
				(isObject as MapStringUnknown)[keysA[i]],
				(toObject as MapStringUnknown)[keysA[i]],
			)
		) {
			return false;
		}
	}

	return true;
}

export type PublicInterfaceOf<T> = { [K in keyof T]: T[K] };

export function omitDefaultProperties<Type>(
	defaultObject: Type,
	fullObject: Type,
): Partial<Type> {
	if (
		typeof defaultObject !== "object" ||
		Array.isArray(defaultObject) ||
		!defaultObject ||
		typeof fullObject === "object" ||
		Array.isArray(fullObject) ||
		!fullObject
	) {
		throw new Error(
			"Omit default properties of an object. Argument is not an object.",
		);
	}
	const partialObject: Partial<Type> = {};
	for (const key in defaultObject) {
		if (defaultObject[key] !== fullObject[key]) {
			partialObject[key] = fullObject[key];
		}
	}
	return partialObject;
}

export function detectLanguage(text: string) {
	const scores = {};

	const regexes = {
		en: /[\u0000-\u007F]/gi,
		zh: /[\u3000\u3400-\u4DBF\u4E00-\u9FFF]/gi,
		hi: /[\u0900-\u097F]/gi,
		ar: /[\u0621-\u064A\u0660-\u0669]/gi,
		bn: /[\u0995-\u09B9\u09CE\u09DC-\u09DF\u0985-\u0994\u09BE-\u09CC\u09D7\u09BC]/gi,
		he: /[\u0590-\u05FF]/gi,
		ru: /[\u0400-\u04FF]/gi,
	};
	for (const [lang, regex] of Object.entries(regexes)) {
		// detect occurances of lang in a word
		const matches = text.match(regex) || [];
		const score = matches.length / text.length;
		if (score) {
			// high percentage, return result
			if (score > 0.85) {
				return lang;
			}
			scores[lang] = score;
		}
	}
	// not detected
	if (Object.keys(scores).length == 0) {
		return "en";
	}
	// pick lang with highest percentage
	return Object.keys(scores).reduce((a, b) =>
		scores[a] > scores[b] ? a : b,
	);
}

export const pasteSnapshot = ({
	board,
	snapshot,
}: {
	board: Board;
	snapshot: BoardSnapshot;
}) => {
	if (board.events && snapshot) {
		board.paste(snapshot.items, true);
		if (!board.tools.getSelect()) {
			board.tools.select();
		}
		const itemsMbr = board.items.getMbr();
		board.camera.zoomToFit(itemsMbr);
	}
};
