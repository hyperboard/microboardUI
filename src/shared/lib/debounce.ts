export function debounce(func: (...args: any[]) => void, wait: number) {
	let timeout: NodeJS.Timeout | null;
	return function (...args: any[]) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => func(...args), wait);
	};
}
