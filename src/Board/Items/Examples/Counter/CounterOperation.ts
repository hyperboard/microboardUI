export type CounterOperation = UpdateCounter;

interface BaseCounterOperation {
	class: "Counter";
	item: string[];
}

interface UpdateCounter extends BaseCounterOperation {
	method: "updateCounter";
	newState: { counter: number };
	prevState: { counter: number };
}
