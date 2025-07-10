import { useEffect, useState } from "react";

export function useIsPhoneScreen(): boolean {
	const isPhoneScreenCheck = (): boolean =>
		matchMedia("screen and (max-width: 640px)").matches;

	const [isPhoneScreen, setIsPhoneScreen] = useState(isPhoneScreenCheck);

	useEffect(() => {
		const setScreen = (): void => {
			setIsPhoneScreen(isPhoneScreenCheck());
		};

		window.addEventListener("resize", setScreen);
		return () => {
			window.removeEventListener("resize", setScreen);
		};
	}, []);

	return isPhoneScreen;
}
