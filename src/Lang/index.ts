import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import ru from "./ru.json";
import enTalk from "./talk/en.json";
import ruTalk from "./talk/ru.json";

export const defaultNS = "default";
export const resources = {
	en: {
		default: en,
		talk: enTalk,
	},
	ru: {
		default: ru,
		talk: ruTalk,
	},
};

i18n.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		debug: process.env.NODE_ENV === "development",
		detection: {
			order: ["navigator"],
		},
		supportedLngs: ["en", "ru"],
		defaultNS,
		resources,
		fallbackLng: "en",
		interpolation: {
			escapeValue: false,
		},
	});
