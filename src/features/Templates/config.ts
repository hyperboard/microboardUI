export function getTolgeeApiUrl(path?: string): string {
	if (!path) {
		path = "";
	}
	return `${import.meta.env.TOLGEE_API_URL}/v2/projects/${import.meta.env.TOLGEE_PROJECT_ID}${path}`;
}
