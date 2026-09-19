"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getTranslation } from "../lib/language";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [mounted, setMounted] = useState(false);

  // Keep the whole application language in sync.
  useEffect(() => {
    const isArabic = language === "ar";
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language]);

  // Load saved language
  useEffect(() => {
    try {
      const savedLanguage =
        localStorage.getItem("readify_language");

      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error(
        "Failed to load language:",
        error
      );
    }

    setMounted(true);
  }, []);

  // Change language
  function setLanguage(newLanguage) {
    setLanguageState(newLanguage);

    try {
      localStorage.setItem(
        "readify_language",
        newLanguage
      );
    } catch (error) {
      console.error(
        "Failed to save language:",
        error
      );
    }

    // Notify other components
    window.dispatchEvent(
      new CustomEvent("readify-language-change", {
        detail: newLanguage,
      })
    );
  }

  // Translation helper
  function t(key) {
    return getTranslation(language, key);
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      mounted,
    }),
    [language, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}