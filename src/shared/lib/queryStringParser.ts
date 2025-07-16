/** Default value is returned if did not find such param */
function getBooleanParam(searchParam: string, defaultValue: boolean): boolean {
  const param = new URLSearchParams(window.location.search).get(searchParam);
  if (!param) {
    return defaultValue;
  }
  return param === "true" ? true : false;
}

type PanelType = "titlePanel" | "userPanel";
/** Tries to find panel in search param, returns default value if not found */
export function shouldShow(panel: PanelType): boolean {
  return getBooleanParam(panel, true);
}

export function isTemplateView(): boolean {
  return getBooleanParam("isTemplateView", false);
}
