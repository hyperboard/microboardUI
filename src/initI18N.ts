import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { conf, initI18N } from "microboard-temp";
import { initReactI18next } from "react-i18next";
import en from "shared/Lang/en.json";
import ru from "shared/Lang/ru.json";

let configuredI18n: any = null;

export async function initInter(): Promise<void> {
	const defaultNS = "default";
	const resources = {
		en: {
			default: en,
		},
		ru: {
			default: ru,
		},
	};
	const i18Instance = createInstance({
		debug: conf.debug,
		detection: {
			order: ["navigator"],
		},
		supportedLngs: ["en", "ru"],
		defaultNS,
		resources,
		fallbackLng: conf.FALLBACK_LNG,
		interpolation: {
			escapeValue: false,
		},
	});

	await i18Instance.use(LanguageDetector).use(initReactI18next).init();

	configuredI18n = i18Instance;
	initI18N(i18Instance);
}

export function getConfiguredI18n() {
	return configuredI18n;
}
