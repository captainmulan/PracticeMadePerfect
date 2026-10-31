import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import mm from "./locales/mm.json";

export const DEFAULT_LOCALE = "mm" as const;
export const SUPPORTED_LOCALES = ["mm", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = "pmp-locale";
const resources = {
  mm: { translation: mm },
  en: { translation: en },
};

function getInitialLocale(): AppLocale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === "en" || stored === "mm" ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLocale(),
  fallbackLng: "en",
  supportedLngs: [...SUPPORTED_LOCALES],
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== "undefined") {
  document.documentElement.lang = getInitialLocale() === "mm" ? "my" : "en";
}

i18n.on("languageChanged", (locale) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale === "mm" ? "my" : "en";
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Keep locale switching available when storage is disabled.
  }
});

export default i18n;