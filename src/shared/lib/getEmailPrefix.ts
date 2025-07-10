import { conf } from "microboard-temp";
const { i18n } = conf;

export function getEmailPrefix(
	email: string | null,
	placeholder = i18n.t("common.anonymous"),
): string {
	const atIndex = email?.indexOf("@");
	if (email === null || atIndex === -1) {
		return placeholder;
	}
	return email.substring(0, atIndex);
}
