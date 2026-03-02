export function getTolgeeApiUrl(path?: string): string {
  if (!path) {
    path = "";
  }
  return `${import.meta.env.TOLGEE_API_URL}/v2/projects/single${path}`;
}
