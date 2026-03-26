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

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Research & Analysis",
  "Diagramming",
  "Meeting & Workshop",
  "Strategy & Planning",
  "Brainstorming",
  "Agile Workflow",
  "Icebreaker & Game",
  "Education",
];

export const TEMPLATE_LANGUAGES = [
  { value: "ru", label: "Russian" },
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "zh", label: "Chinese" },
];

export const CATEGORY_ICONS: Record<TemplateCategory, string> = {
  "All templates": "AllTemplates",
  "Research & Analysis": "ResearchAnalysis",
  Diagramming: "Diagramming",
  "Meeting & Workshop": "MeetingWorkshop",
  "Strategy & Planning": "StrategyPlanning",
  Brainstorming: "Brainstorming",
  "Agile Workflow": "AgileWorkflow",
  "Icebreaker & Game": "IcebreakerGame",
  Education: "Education",
};
