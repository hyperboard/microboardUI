import { BaseOperation } from "Board/Events/EventsOperations";

export type CounterOperation = UpdateCounter;

export interface UpdateCounter extends BaseOperation<{ count: number }> {
	class: "Counter";
	method: "updateCounter";
}
