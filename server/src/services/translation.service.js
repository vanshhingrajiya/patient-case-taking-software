import { env } from "../../config/env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const BHASHINI_DHRUVA_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";
const BHASHINI_AUTH_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";

// In-memory translation result cache: key = `${sourceLang}:${targetLang}:${text}`
const translationCache = new Map();

// Pipeline config cache: key = `${sourceLang}:${targetLang}` -> { endpoint, apiKeyName, apiKeyValue, serviceId, expiry }
const pipelineConfigCache = new Map();

/**
 * Normalizes language codes to Bhashini standard (2-letter ISO code)
 */
function normalizeLangCode(code) {
  if (!code) return "en";
  const clean = code.toLowerCase().split("-")[0].trim();
  if (clean === "od") return "or"; // Odia
  return clean;
}

/**
 * Translates texts using Bhashini Direct Dhruva Pipeline API (fast 1-step call)
 */
async function translateWithDirectDhruva(items, sourceLang, targetLang) {
  if (!env.bhashiniInferenceApiKey) {
    throw new Error("BHASHINI_INFERENCE_API_KEY is not configured.");
  }

  const response = await fetch(BHASHINI_DHRUVA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: env.bhashiniInferenceApiKey,
    },
    body: JSON.stringify({
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            },
          },
        },
      ],
      inputData: {
        input: items.map((text) => ({ source: text })),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bhashini Dhruva error (${response.status}): ${errorText}`);
  }

  const resData = await response.json();
  const outputs = resData?.pipelineResponse?.[0]?.output || [];
  return outputs.map((out, idx) => out.target || items[idx]);
}

/**
 * Translates texts using 2-step ULCA Model Pipeline (fallback method)
 */
async function translateWithUlcaPipeline(items, sourceLang, targetLang) {
  if (!env.bhashiniUserId || !env.bhashiniUlcaApiKey) {
    throw new Error("BHASHINI_USER_ID or BHASHINI_ULCA_API_KEY is not configured.");
  }

  const cacheKey = `${sourceLang}:${targetLang}`;
  let config = pipelineConfigCache.get(cacheKey);

  if (!config || config.expiry <= Date.now()) {
    const configRes = await fetch(BHASHINI_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userID: env.bhashiniUserId,
        ulcaApiKey: env.bhashiniUlcaApiKey,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
              },
            },
          },
        ],
        pipelineRequestConfig: {
          pipelineId: env.bhashiniPipelineId || "64392f96daac50000a304e41",
        },
      }),
    });

    if (!configRes.ok) {
      const errText = await configRes.text();
      throw new Error(`Bhashini ULCA auth error (${configRes.status}): ${errText}`);
    }

    const data = await configRes.json();
    const callbackUrl = data?.pipelineInferenceAPIEndPoint?.callbackUrl;
    const inferenceApiKey = data?.pipelineInferenceAPIEndPoint?.inferenceApiKey;
    const serviceId = data?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;

    if (!callbackUrl || !inferenceApiKey?.name || !inferenceApiKey?.value) {
      throw new Error("Invalid pipeline response received from Bhashini.");
    }

    config = {
      callbackUrl,
      apiKeyName: inferenceApiKey.name,
      apiKeyValue: inferenceApiKey.value,
      serviceId,
      expiry: Date.now() + 1000 * 60 * 30,
    };
    pipelineConfigCache.set(cacheKey, config);
  }

  const computeRes = await fetch(config.callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [config.apiKeyName]: config.apiKeyValue,
    },
    body: JSON.stringify({
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            },
            ...(config.serviceId ? { serviceId: config.serviceId } : {}),
          },
        },
      ],
      inputData: {
        input: items.map((text) => ({ source: text })),
      },
    }),
  });

  if (!computeRes.ok) {
    const errText = await computeRes.text();
    throw new Error(`Bhashini compute error (${computeRes.status}): ${errText}`);
  }

  const resData = await computeRes.json();
  const outputs = resData?.pipelineResponse?.[0]?.output || [];
  return outputs.map((out, idx) => out.target || items[idx]);
}

/**
 * Fallback: Translates text using Sarvam AI translation API if available
 */
async function translateWithSarvam(items, sourceLang, targetLang) {
  if (!env.sarvamApiKey) throw new Error("Sarvam API key not available");

  const sarvamLangMap = {
    hi: "hi-IN", en: "en-IN", bn: "bn-IN", mr: "mr-IN",
    ta: "ta-IN", te: "te-IN", gu: "gu-IN", kn: "kn-IN",
    ml: "ml-IN", pa: "pa-IN", or: "od-IN",
  };

  const src = sarvamLangMap[sourceLang] || `${sourceLang}-IN`;
  const tgt = sarvamLangMap[targetLang] || `${targetLang}-IN`;

  const results = [];
  for (const text of items) {
    const res = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": env.sarvamApiKey,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: src,
        target_language_code: tgt,
        mode: "formal",
        model: "mayura:v1",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      results.push(data.translated_text || text);
    } else {
      throw new Error(`Sarvam translation failed (${res.status})`);
    }
  }

  return results;
}

/**
 * Fallback: Translates text using Gemini AI if Bhashini / Sarvam are unavailable
 */
async function translateWithGemini(items, sourceLang, targetLang) {
  if (!env.geminiApiKey) throw new Error("Gemini API key not available");

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `You are a medical translation engine. Translate the following array of JSON strings from language code "${sourceLang}" into language code "${targetLang}".
Return ONLY a valid JSON array of strings corresponding to the translations, preserving clinical accuracy.

Input:
${JSON.stringify(items)}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();
  const cleaned = rawText.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed) && parsed.length === items.length) {
    return parsed;
  }
  throw new Error("Invalid translation response from Gemini fallback");
}

/**
 * Translates an array of text strings with caching and multi-tier fallback
 */
export async function translateTexts(texts, sourceLang = "en", targetLang = "hi") {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const src = normalizeLangCode(sourceLang);
  const tgt = normalizeLangCode(targetLang);

  if (src === tgt) {
    return [...texts];
  }

  const results = new Array(texts.length);
  const missingIndices = [];
  const missingTexts = [];

  // 1. Check in-memory cache
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (typeof text !== "string" || !text.trim()) {
      results[i] = text;
      continue;
    }

    const cacheKey = `${src}:${tgt}:${text.trim()}`;
    if (translationCache.has(cacheKey)) {
      results[i] = translationCache.get(cacheKey);
    } else {
      missingIndices.push(i);
      missingTexts.push(text.trim());
    }
  }

  if (missingTexts.length === 0) {
    return results;
  }

  // 2. Translate uncached items
  let translatedList = null;

  // Primary: Direct Dhruva Pipeline with Authorization Key
  if (env.bhashiniInferenceApiKey) {
    try {
      translatedList = await translateWithDirectDhruva(missingTexts, src, tgt);
    } catch (dhruvaErr) {
      console.warn("Bhashini Direct Dhruva error:", dhruvaErr.message);
    }
  }

  // Secondary: ULCA 2-step Pipeline
  if (!translatedList && env.bhashiniUserId && env.bhashiniUlcaApiKey) {
    try {
      translatedList = await translateWithUlcaPipeline(missingTexts, src, tgt);
    } catch (bhashiniErr) {
      console.warn("Bhashini ULCA Pipeline error:", bhashiniErr.message);
    }
  }

  // Fallback 1: Sarvam
  if (!translatedList && env.sarvamApiKey) {
    try {
      translatedList = await translateWithSarvam(missingTexts, src, tgt);
    } catch (sarvamErr) {
      console.warn("Sarvam fallback translation error:", sarvamErr.message);
    }
  }

  // Fallback 2: Gemini
  if (!translatedList && env.geminiApiKey) {
    try {
      translatedList = await translateWithGemini(missingTexts, src, tgt);
    } catch (geminiErr) {
      console.warn("Gemini fallback translation error:", geminiErr.message);
    }
  }

  // Populate results and update cache
  for (let j = 0; j < missingIndices.length; j++) {
    const originalIndex = missingIndices[j];
    const originalText = missingTexts[j];
    const translatedText = translatedList?.[j] || originalText;

    results[originalIndex] = translatedText;

    const cacheKey = `${src}:${tgt}:${originalText}`;
    translationCache.set(cacheKey, translatedText);
  }

  return results;
}

/**
 * Translates a single text string
 */
export async function translateSingleText(text, sourceLang = "en", targetLang = "hi") {
  if (!text || typeof text !== "string") return text;
  const [result] = await translateTexts([text], sourceLang, targetLang);
  return result;
}
