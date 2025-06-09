import { Star } from "./Star.ts";
import { StarOperation } from "./StarOperation.ts";
import { Command } from "../../../Events";
import { mapItemsByOperation } from "../../ItemsCommandUtils.ts";

export class StarCommand implements Command {
	private reverse: { item: Star; operation: StarOperation }[];

	constructor(
		private star: Star[],
		private operation: StarOperation,
	) {
		this.reverse = this.getReverse();
	}

	merge(op: StarOperation): this {
		this.operation = op;
		return this;
	}

	apply(): void {
		for (const star of this.star) {
			star.apply(this.operation);
		}
	}

	revert(): void {
		for (const { item, operation } of this.reverse) {
			item.apply(operation);
		}
	}

	getReverse(): { item: Star; operation: StarOperation }[] {
		const stars = this.star;

		switch (this.operation.method) {
			case "toggleShine":
				return mapItemsByOperation(stars, star => {
					return {
						...this.operation,
					};
				});
		}
	}
}
