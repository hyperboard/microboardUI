export interface Template {
  id: string;
  preview?: string;
  languages: string[];
  tags: string[];
  name: Record<string, string>;
  description?: Record<string, string>;
  created: string;
}
