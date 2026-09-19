import { MedicalDocument } from "../models/index.js";
import { performSarvamOCR } from "../utils/ocr.utils.js";
import { extractMedicalDataFromOCR } from "../utils/llm.utils.js";

const UUID_PATTERN = /\b(?:upload-)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/gi;

function normalizeRawText(rawText) {
  return rawText.replace(UUID_PATTERN, "").trim();
}

/**
 * Background job to process a medical document (OCR -> LLM Summary -> DB Update)
 * @param {string} documentId - The MongoDB ObjectID of the MedicalDocument
 * @param {Buffer} fileBuffer - The file buffer uploaded by the user
 * @param {string} mimeType - The mime type of the file
 */
export async function processMedicalDocumentBackground(documentId, fileBuffer, mimeType) {
  try {
    // 1. Perform OCR
    let ocrResult;
    try {
      ocrResult = await performSarvamOCR(fileBuffer, mimeType);
    } catch (ocrError) {
      console.error(`[Background Job] OCR failed for document ${documentId}:`, ocrError);
      await MedicalDocument.findByIdAndUpdate(documentId, { analysisStatus: "failed" });
      return; // Stop pipeline
    }

    let rawText = undefined;
    if (ocrResult) {
      rawText = typeof ocrResult === "string" ? ocrResult : JSON.stringify(ocrResult, null, 2);
    }

    rawText = rawText ? normalizeRawText(rawText) : rawText;

    if (!rawText) {
      console.warn(`[Background Job] No text extracted by OCR for document ${documentId}.`);
      await MedicalDocument.findByIdAndUpdate(documentId, { 
        "ocr.rawText": "", 
        analysisStatus: "completed" 
      });
      return; // Stop pipeline, nothing to summarize
    }

    // 2. Perform LLM Extraction
    let extractedData;
    try {
      extractedData = await extractMedicalDataFromOCR(rawText);
    } catch (llmError) {
      console.error(`[Background Job] LLM extraction failed for document ${documentId}:`, llmError);
      await MedicalDocument.findByIdAndUpdate(documentId, { 
        "ocr.rawText": rawText,
        analysisStatus: "failed" 
      });
      return;
    }

    if (!extractedData || typeof extractedData !== "object" || Array.isArray(extractedData)) {
      extractedData = {};
    }

    extractedData.rawText = rawText;
    delete extractedData.summary;

    // 3. Update Document with Success
    await MedicalDocument.findByIdAndUpdate(documentId, {
      "ocr.rawText": rawText,
      extractedData: extractedData,
      analysisStatus: "completed"
    });
    
    console.log(`[Background Job] Successfully processed document ${documentId}`);

  } catch (error) {
    console.error(`[Background Job] Unexpected error processing document ${documentId}:`, error);
    await MedicalDocument.findByIdAndUpdate(documentId, { analysisStatus: "failed" }).catch(console.error);
  }
}
