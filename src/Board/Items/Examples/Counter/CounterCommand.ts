import { Command } from "../../../Events";
import { mapItemsByOperation } from "../../ItemsCommandUtils.ts";
import { Counter } from "Board/Items/Examples/Counter/Counter";
import { CounterOperation } from "Board/Items/Examples/Counter/CounterOperation";

export class CounterCommand implements Command {
	private reverse: { item: Counter; operation: CounterOperation }[];

	constructor(
		private counter: Counter[],
		private operation: CounterOperation,
	) {
		this.reverse = this.getReverse();
	}

	merge(op: CounterOperation): this {
		this.operation = op;
		return this;
	}

	apply(): void {
		for (const counter of this.counter) {
			counter.apply(this.operation);
		}
	}

	revert(): void {
		for (const { item, operation } of this.reverse) {
			item.apply(operation);
		}
	}

	getReverse(): { item: Counter; operation: CounterOperation }[] {
		const counters = this.counter;

		switch (this.operation.method) {
			case "updateCounter":
				return mapItemsByOperation(counters, counter => {
					return {
						...this.operation,
						newState: this.operation.prevState,
					};
				});
		}
	}
}
