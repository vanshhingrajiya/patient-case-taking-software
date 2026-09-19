import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { authService } from "../services/auth.service";
import { translationService } from "../services/translation.service";
import { setDomTranslatorLanguage } from "../services/domTranslator";
import { useAuth } from "./AuthContext";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", isDefault: true },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ks", name: "Kashmiri", nativeName: "कॉशुर" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

export const LanguageContext = createContext({
  currentLanguage: "en",
  changeLanguage: () => {},
  languages: SUPPORTED_LANGUAGES,
  translate: async (text, sourceLang = "en") => text,
  translateBatch: async (texts, sourceLang = "en") => texts,
});

const LANGUAGE_PREFERENCE_KEY = "medikiosk_language";
const LANGUAGE_PREFERENCE_CONFIRMED_KEY = "medikiosk_language_preference_confirmed";

function getSavedLanguagePreference() {
  if (typeof window === "undefined") return "en";

  const savedLanguage = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
  const wasExplicitlyChosen = localStorage.getItem(LANGUAGE_PREFERENCE_CONFIRMED_KEY) === "true";
  return wasExplicitlyChosen && SUPPORTED_LANGUAGES.some((language) => language.code === savedLanguage)
    ? savedLanguage
    : "en";
}

// Clear any lingering Google Translate cookies from browser history
function clearLegacyGoogleTranslateCookies() {
  if (typeof document === "undefined") return;
  const cookiePath = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  document.cookie = cookiePath;
  const host = window.location.hostname;
  document.cookie = `${cookiePath} domain=${host};`;
  document.cookie = `${cookiePath} domain=.${host};`;
  if (host && host !== "localhost" && !host.startsWith("127.")) {
    const parts = host.split(".");
    if (parts.length > 1) {
      document.cookie = `${cookiePath} domain=.${parts.slice(-2).join(".")};`;
    }
  }
}

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const lastSyncedUserRef = useRef(null);

  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return getSavedLanguagePreference();
  });

  // Clear any legacy Google Translate cookies on initialization
  useEffect(() => {
    clearLegacyGoogleTranslateCookies();
  }, []);

  // Update universal DOM translator whenever language changes
  useEffect(() => {
    setDomTranslatorLanguage(currentLanguage);
  }, [currentLanguage]);

  // Sync initial language preference when user first logs in
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId && lastSyncedUserRef.current !== userId) {
      lastSyncedUserRef.current = userId;
      const patientLang =
        user?.patient?.preferences?.preferredLanguage ||
        user?.patient?.preferredLanguage ||
        user?.preferredLanguage;
      if (patientLang && SUPPORTED_LANGUAGES.some((l) => l.code === patientLang)) {
        setCurrentLanguage(patientLang);
        localStorage.setItem(LANGUAGE_PREFERENCE_KEY, patientLang);
        localStorage.setItem(LANGUAGE_PREFERENCE_CONFIRMED_KEY, "true");
      }
    }
  }, [user]);

  const changeLanguage = useCallback(
    async (langCode) => {
      if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) return;

      setCurrentLanguage(langCode);

      if (typeof window !== "undefined") {
        localStorage.setItem(LANGUAGE_PREFERENCE_KEY, langCode);
        localStorage.setItem(LANGUAGE_PREFERENCE_CONFIRMED_KEY, "true");
      }

      // If user is authenticated, persist preferred language to patient profile
      if (user?.role === "patient") {
        try {
          await authService.updatePreferredLanguage(langCode);
        } catch (err) {
          console.error("Failed to persist preferred language to profile:", err);
        }
      }
    },
    [user]
  );

  const translate = useCallback(
    async (text, sourceLang = "en") => {
      return translationService.translateText(text, currentLanguage, sourceLang);
    },
    [currentLanguage]
  );

  const translateBatch = useCallback(
    async (texts, sourceLang = "en") => {
      return translationService.translateBatch(texts, currentLanguage, sourceLang);
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        languages: SUPPORTED_LANGUAGES,
        translate,
        translateBatch,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageContext;
