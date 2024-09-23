export const isMicroboard = (): boolean => {
	// @ts-expect-error import.meta object didn't exists in common-js modules
	return import.meta.env.INTEGRATION_UI === "microboard";
};
