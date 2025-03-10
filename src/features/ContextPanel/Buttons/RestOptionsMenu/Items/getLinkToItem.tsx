export function getLinkToItem(id: string): string {
	return `${window.location.origin}${window.location.pathname}?focus=${id}`;
}
