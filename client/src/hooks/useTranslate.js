import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translationService } from "../services/translation.service";

/**
 * Custom hook to translate dynamic text reactively based on currentLanguage
 *
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Base source language (default "en")
 * @returns {{ translatedText: string, loading: boolean }}
 */
export function useTranslate(text, sourceLang = "en") {
  const { currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text || typeof text !== "string" || !text.trim()) {
      setTranslatedText(text || "");
      setLoading(false);
      return;
    }

    if (currentLanguage === sourceLang) {
      setTranslatedText(text);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    translationService
      .translateText(text, currentLanguage, sourceLang)
      .then((res) => {
        if (isMounted) {
          setTranslatedText(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslatedText(text);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, currentLanguage, sourceLang]);

  return { translatedText, loading };
}

/**
 * Custom hook to translate an array of strings in batch
 *
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLang - Base source language (default "en")
 * @returns {{ translatedTexts: string[], loading: boolean }}
 */
export function useBatchTranslate(texts, sourceLang = "en") {
  const { currentLanguage } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState(texts || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Array.isArray(texts) || texts.length === 0) {
      setTranslatedTexts(texts || []);
      setLoading(false);
      return;
    }

    if (currentLanguage === sourceLang) {
      setTranslatedTexts(texts);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    translationService
      .translateBatch(texts, currentLanguage, sourceLang)
      .then((res) => {
        if (isMounted) {
          setTranslatedTexts(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslatedTexts(texts);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(texts), currentLanguage, sourceLang]);

  return { translatedTexts, loading };
}

export default useTranslate;

