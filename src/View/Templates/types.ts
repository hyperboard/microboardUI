import { BoardSnapshot } from "../../Board/Board";

export interface Template {
	uniq_id: string;
	preview: string;
	desc: string;
	lan: string;
	tags: string[];
	snapshot: BoardSnapshot;
}
