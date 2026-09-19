import { translationService } from "./translation.service";

/**
 * Universal Bhashini DOM Auto-Translator
 * Translates every text node across all pages and components dynamically.
 */

// WeakMap storing original English text for each DOM text node
const originalTextMap = new WeakMap();

// In-memory cache for translated strings: `${targetLang}:${originalText}` -> `translatedText`
const stringCache = new Map();

// Elements and classes to skip during translation
const IGNORE_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "SVG",
  "PATH",
  "CODE",
  "PRE",
  "INPUT",
  "TEXTAREA",
]);

let currentTargetLang = "en";
let isProcessing = false;
let mutationObserver = null;
let pendingBatch = new Map(); // originalText -> Set of TextNodes
let debounceTimer = null;

/**
 * Checks if a DOM node should be ignored
 */
function shouldIgnoreNode(node) {
  if (!node) return true;
  const parent = node.parentElement;
  if (!parent) return true;

  if (IGNORE_TAGS.has(parent.tagName)) return true;
  if (parent.closest(".notranslate, [data-notranslate], [data-bhashini-skip]")) return true;
  if (parent.isContentEditable) return true;

  return false;
}

/**
 * Checks if text is translatable (contains alphabetic characters, not just numbers/symbols)
 */
function isTranslatable(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;

  // Ignore pure numbers, phone numbers, timestamps, and punctuation
  if (/^[\d\s+\-/:.,#()%]+$/.test(trimmed)) return false;

  // Must contain at least one letter
  if (!/[a-zA-Z\u0900-\u0D7F]/.test(trimmed)) return false;

  return true;
}

/**
 * Flushes all pending text nodes in a single batched translation API call
 */
async function flushPendingBatch(targetLang) {
  if (pendingBatch.size === 0 || targetLang === "en") return;

  const batchEntries = Array.from(pendingBatch.entries());
  pendingBatch = new Map();

  const textsToTranslate = [];
  const uncachedEntries = [];

  // Check cache first
  for (const [text, nodes] of batchEntries) {
    const cacheKey = `${targetLang}:${text}`;
    if (stringCache.has(cacheKey)) {
      const translated = stringCache.get(cacheKey);
      applyTranslationToNodes(nodes, translated);
    } else {
      textsToTranslate.push(text);
      uncachedEntries.push([text, nodes]);
    }
  }

  if (textsToTranslate.length === 0) return;

  try {
    const translatedResults = await translationService.translateBatch(
      textsToTranslate,
      targetLang,
      "en"
    );

    uncachedEntries.forEach(([originalText, nodes], idx) => {
      const translated = translatedResults[idx] || originalText;
      stringCache.set(`${targetLang}:${originalText}`, translated);
      applyTranslationToNodes(nodes, translated);
    });
  } catch (err) {
    console.warn("DOM Auto-Translator batch error:", err);
  }
}

/**
 * Applies translated text to a collection of DOM text nodes
 */
function applyTranslationToNodes(nodes, translatedText) {
  isProcessing = true;
  try {
    for (const node of nodes) {
      if (node.isConnected && currentTargetLang !== "en") {
        const orig = originalTextMap.get(node);
        if (orig) {
          // Preserve leading/trailing whitespace
          const leadingWs = orig.match(/^\s*/)?.[0] || "";
          const trailingWs = orig.match(/\s*$/)?.[0] || "";
          node.nodeValue = leadingWs + translatedText.trim() + trailingWs;
        }
      }
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Collects a text node for translation
 */
function queueTextNode(node, targetLang) {
  if (shouldIgnoreNode(node)) return;

  let original = originalTextMap.get(node);
  if (!original) {
    original = node.nodeValue;
    if (!isTranslatable(original)) return;
    originalTextMap.set(node, original);
  } else {
    if (!isTranslatable(original)) return;
  }

  const cleanText = original.trim();
  if (!cleanText) return;

  if (!pendingBatch.has(cleanText)) {
    pendingBatch.set(cleanText, new Set());
  }
  pendingBatch.get(cleanText).add(node);

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    flushPendingBatch(targetLang);
  }, 10);
}

/**
 * Recursively walks a DOM subtree and queues all text nodes
 */
function walkSubtree(root, targetLang) {
  if (!root || shouldIgnoreNode(root)) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (shouldIgnoreNode(node)) return NodeFilter.FILTER_REJECT;
        const val = node.nodeValue?.trim();
        if (!val || val.length < 2) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  let textNode = walker.nextNode();
  while (textNode) {
    queueTextNode(textNode, targetLang);
    textNode = walker.nextNode();
  }
}

/**
 * Restores all translated DOM text nodes back to original English text
 */
function restoreOriginalText(root = document.body) {
  isProcessing = true;
  try {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode = walker.nextNode();
    while (textNode) {
      if (originalTextMap.has(textNode)) {
        textNode.nodeValue = originalTextMap.get(textNode);
      }
      textNode = walker.nextNode();
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Sets the active language for universal DOM translation
 */
export function setDomTranslatorLanguage(targetLang) {
  currentTargetLang = targetLang || "en";

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingBatch.clear();

  if (currentTargetLang === "en") {
    restoreOriginalText();
    return;
  }

  // Scan and translate the entire document
  const root = document.getElementById("root") || document.body;
  walkSubtree(root, currentTargetLang);

  // Setup MutationObserver for dynamic React components
  if (!mutationObserver && typeof MutationObserver !== "undefined") {
    mutationObserver = new MutationObserver((mutations) => {
      if (isProcessing || currentTargetLang === "en") return;

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.TEXT_NODE) {
              queueTextNode(addedNode, currentTargetLang);
            } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
              walkSubtree(addedNode, currentTargetLang);
            }
          }
        } else if (mutation.type === "characterData") {
          if (mutation.target.nodeType === Node.TEXT_NODE) {
            queueTextNode(mutation.target, currentTargetLang);
          }
        }
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
}

