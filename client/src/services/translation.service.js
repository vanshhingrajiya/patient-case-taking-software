import { apiClient } from "./api.client";

// In-memory client cache: key = `${sourceLang}:${targetLang}:${text}`
const clientTranslationCache = new Map();

/**
 * Normalizes language codes to base 2-letter ISO standard (e.g., 'hi-IN' -> 'hi')
 */
export function normalizeLanguageCode(code) {
  if (!code) return "en";
  const clean = code.toLowerCase().split("-")[0].trim();
  if (clean === "od") return "or";
  return clean;
}

/**
 * Translates a single text string using the backend Bhashini service
 */
export async function translateText(text, targetLang = "hi", sourceLang = "en") {
  if (!text || typeof text !== "string" || !text.trim()) {
    return text;
  }

  const src = normalizeLanguageCode(sourceLang);
  const tgt = normalizeLanguageCode(targetLang);

  if (src === tgt) {
    return text;
  }

  const cacheKey = `${src}:${tgt}:${text.trim()}`;
  if (clientTranslationCache.has(cacheKey)) {
    return clientTranslationCache.get(cacheKey);
  }

  try {
    const response = await apiClient.post("/translate", {
      text: text.trim(),
      sourceLang: src,
      targetLang: tgt,
    });

    const translated = response.translatedText || text;
    clientTranslationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    console.warn("Client translation request failed, returning original:", error);
    return text;
  }
}

/**
 * Translates multiple text strings in a single batch request
 */
export async function translateBatch(texts, targetLang = "hi", sourceLang = "en") {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const src = normalizeLanguageCode(sourceLang);
  const tgt = normalizeLanguageCode(targetLang);

  if (src === tgt) {
    return [...texts];
  }

  const results = new Array(texts.length);
  const missingIndices = [];
  const missingTexts = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (typeof text !== "string" || !text.trim()) {
      results[i] = text;
      continue;
    }

    const cacheKey = `${src}:${tgt}:${text.trim()}`;
    if (clientTranslationCache.has(cacheKey)) {
      results[i] = clientTranslationCache.get(cacheKey);
    } else {
      missingIndices.push(i);
      missingTexts.push(text.trim());
    }
  }

  if (missingTexts.length === 0) {
    return results;
  }

  try {
    const response = await apiClient.post("/translate", {
      texts: missingTexts,
      sourceLang: src,
      targetLang: tgt,
    });

    const translatedList = response.translatedTexts || missingTexts;

    for (let j = 0; j < missingIndices.length; j++) {
      const originalIndex = missingIndices[j];
      const originalText = missingTexts[j];
      const translated = translatedList[j] || originalText;

      results[originalIndex] = translated;

      const cacheKey = `${src}:${tgt}:${originalText}`;
      clientTranslationCache.set(cacheKey, translated);
    }
  } catch (error) {
    console.warn("Batch translation request failed:", error);
    for (let j = 0; j < missingIndices.length; j++) {
      results[missingIndices[j]] = missingTexts[j];
    }
  }

  return results;
}

export const translationService = {
  translateText,
  translateBatch,
  normalizeLanguageCode,
};

export default translationService;

