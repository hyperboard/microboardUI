export function applyStyle(styles: string): void {
	const styleElem = document.createElement("style");

	styleElem.innerHTML = styles;

	document.head.appendChild(styleElem);
}
