import { Router } from "express";
import { translateTexts, translateSingleText } from "../services/translation.service.js";

const router = Router();

/**
 * POST /api/translate
 * Translates single text or array of texts
 * Body: { text?: string, texts?: string[], sourceLang?: string, targetLang: string }
 */
router.post("/", async (req, res) => {
  try {
    const { text, texts, sourceLang = "en", targetLang } = req.body;

    if (!targetLang) {
      return res.status(400).json({ success: false, message: "targetLang is required" });
    }

    if (Array.isArray(texts)) {
      const translatedTexts = await translateTexts(texts, sourceLang, targetLang);
      return res.json({
        success: true,
        sourceLang,
        targetLang,
        translatedTexts,
      });
    }

    if (typeof text === "string") {
      const translatedText = await translateSingleText(text, sourceLang, targetLang);
      return res.json({
        success: true,
        sourceLang,
        targetLang,
        translatedText,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Either 'text' or 'texts' array is required in request body",
    });
  } catch (error) {
    console.error("Translation route error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process translation request",
    });
  }
});

export default router;

