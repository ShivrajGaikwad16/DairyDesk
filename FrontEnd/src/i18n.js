import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import mr from "./locales/mr.json";

// Get saved language or default to English
const savedLanguage = localStorage.getItem("lng") || "en";

i18n.use(initReactI18next).init({
   resources: {
      en: { translation: en },
      mr: { translation: mr },
   },
   lng: savedLanguage, // ← set initial language from localStorage
   fallbackLng: "en",
   interpolation: {
      escapeValue: false,
   },
});

export default i18n;
