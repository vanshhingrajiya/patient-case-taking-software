import { useTranslate } from "../../hooks/useTranslate";

/**
 * Reusable component to render translated text with fallback and skeleton loading support.
 */
export function TranslatedText({ text, sourceLang = "en", className = "", fallback, as: Component = "span" }) {
  const { translatedText, loading } = useTranslate(text, sourceLang);

  if (loading && fallback) {
    return fallback;
  }

  return <Component className={className}>{translatedText}</Component>;
}

export default TranslatedText;

