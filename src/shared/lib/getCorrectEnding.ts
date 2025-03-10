export const getCorrectEnding = (number: number): "one" | "few" | "many" => {
	const cases = [
		"many", // 0, 5-9, 11-14
		"one", // 1
		"few", // 2-4
	] as const;

	const n = number % 100;
	const index =
		n > 4 && n < 20
			? 0
			: n % 10 === 1
				? 1
				: n % 10 >= 2 && n % 10 <= 4
					? 2
					: 0;

	return cases[index];
};
