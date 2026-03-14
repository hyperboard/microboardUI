import { resolveColor, conf } from "microboard-temp";
import type { ColorValue } from "microboard-temp";

/**
 * Resolve a ColorValue (or legacy CSS string) to a CSS string for UI display.
 * Uses the current conf.theme for semantic colors.
 */
export function resolveColorForUI(
  value: unknown,
  role: "background" | "foreground" = "background",
): string {
  if (!value) return "none";
  return resolveColor(value as ColorValue | string, conf.theme, role);
}

/**
 * Get the semantic ID of a ColorValue if it is semantic, otherwise null.
 */
export function getSemanticId(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    (value as ColorValue).type === "semantic"
  ) {
    return (value as { type: "semantic"; id: string }).id;
  }
  return null;
}
