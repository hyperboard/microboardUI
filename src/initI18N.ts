import { conf, initI18N } from "microboard-temp";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { createInstance } from "i18next";
import ru from "shared/Lang/ru.json";
import en from "shared/Lang/en.json";

export function initInter(): void {
	const defaultNS = "default";
	const resources = {
		en: {
			default: ru,
		},
		ru: {
			default: en,
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

	i18Instance.use(LanguageDetector).use(initReactI18next).init();

	initI18N(i18Instance);
}
