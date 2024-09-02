export const isMicroboard = (): boolean => {
	return import.meta.env.INTEGRATION_UI === "microboard";
};
