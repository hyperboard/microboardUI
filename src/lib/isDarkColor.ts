export function isDarkColor(color: string): boolean {
	const rgb = color.match(/\d+/g)?.map(Number);
	if (!rgb || rgb.length !== 3) {
		return false;
	}

	const [red, green, blue] = rgb;
	const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

	const threshold = 128;

	return luminance < threshold;
}
