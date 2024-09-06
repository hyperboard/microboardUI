/** Default value is returned if did not find such param */
function getBooleanParam(searchParam: string, defaultValue: boolean): boolean {
	const param = new URLSearchParams(window.location.search).get(searchParam);
	if (!param) {
		return defaultValue;
	}
	return param === "true" ? true : false;
}

/** Tries to find "titlePanel" search param, returns default value if not found */
export function showTitlePanel(defaultValue = true): boolean {
	return getBooleanParam("titlePanel", defaultValue);
}
