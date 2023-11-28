export function isSafari(): boolean {
	const agent = navigator.userAgent;
	const vendor = navigator.vendor;
	// const is = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	// const is = window.safari !== undefined;
	const is =
		vendor !== undefined &&
		vendor.includes("Apple") &&
		agent !== undefined &&
		!agent.includes("CriOS") &&
		!agent.includes("FxiOS");
	return is;
}
