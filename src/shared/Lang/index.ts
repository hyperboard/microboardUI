import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ru from "./ru.json";

export const defaultNS = "default";
export const resources = {
	en: {
		default: en,
	},
	ru: {
		default: ru,
	},
};

// i18n.use(initReactI18next)
// 	.use(LanguageDetector)
// 	.init({
// 		// @ts-expect-error import.meta object didn't exists in common-js modules
// 		debug: import.meta.env.NODE_ENV === "development",
// 		detection: {
// 			order: ["navigator"],
// 		},
// 		supportedLngs: ["en", "ru"],
// 		defaultNS,
// 		resources,
// 		// @ts-expect-error import.meta object didn't exists in common-js modules
// 		fallbackLng: import.meta.env.FALLBACK_LNG ?? "en",
// 		interpolation: {
// 			escapeValue: false,
// 		},
// 	});

// export default i18n;
