export type StarOperation = ToggleShine;

interface BaseStarOperation {
	class: "Star";
	item: string[];
}

interface ToggleShine extends BaseStarOperation {
	method: "toggleShine";
}
