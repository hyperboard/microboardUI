import { BoardSnapshot } from "Board/Board";

export interface Template {
	uniqId: string;
	preview: string;
	description: string;
	lan: string;
	tags: string[];
	snapshot: BoardSnapshot;
	name: string;
}

export type TemplateCategory =
	| "All templates"
	| "Research & Analysis"
	| "Diagramming"
	| "Meeting & Workshop"
	| "Strategy & Planning"
	| "Brainstorming"
	| "Agile Workflow"
	| "Icebreaker & Game"
	| "Education";

export const CATEGORIES: TemplateCategory[] = [
	"Research & Analysis",
	"Diagramming",
	"Meeting & Workshop",
	"Strategy & Planning",
	"Brainstorming",
	"Agile Workflow",
	"Icebreaker & Game",
	"Education",
];

export const LANGUAGES: { value: string; label: string }[] = [
	{ value: "ru", label: "Russian" },
	{ value: "en", label: "English" },
	{ value: "de", label: "German" },
	{ value: "es", label: "Spanish" },
	{ value: "fr", label: "French" },
	{ value: "zh", label: "Chinese" },
];
