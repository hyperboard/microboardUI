export function useStyle(style: string): void {
	const element = document.createElement("style");
	element.innerHTML = style;
	document.head.appendChild(element);
}
