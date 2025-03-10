import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
	const isPhoneScreenCheck = () =>
		matchMedia("screen and (max-width: 640px)").matches;
	const [isPhoneScreen, setIsPhoneScreen] = useState(isPhoneScreenCheck);
	useEffect(() => {
		const setScreen = () => {
			setIsPhoneScreen(isPhoneScreenCheck());
		};

		window.addEventListener("resize", setScreen);

		return () => {
			window.removeEventListener("resize", setScreen);
		};
	});
	return (
		<Toaster
			containerStyle={
				isPhoneScreen
					? {
							left: 10,
							top: 10,
							width: "calc(100% - 10)",
							maxHeight: "50%",
						}
					: { top: 70, right: 12 }
			}
		/>
	);
}
