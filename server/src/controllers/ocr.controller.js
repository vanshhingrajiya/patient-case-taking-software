import { performSarvamOCR } from "../utils/ocr.utils.js";
import { summarizeReportForCase } from "../utils/llm.utils.js";

export const extractTextFromDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }
    
    const resultsData = await performSarvamOCR(req.file.buffer, req.file.mimetype);

    if (!resultsData) {
      return res.status(500).json({ success: false, message: "Failed to extract text using OCR" });
    }

    return res.status(200).json({
      success: true,
      message: "OCR text extracted successfully",
      data: resultsData
    });

  } catch (error) {
    console.error("OCR API Error:", error);
    res.status(500).json({ success: false, message: "Internal server error during OCR processing" });
  }
};

export const summarizeCaseReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Upload a medical report to continue." });
    }

    const caseSummary = typeof req.body.caseSummary === "string" ? req.body.caseSummary.trim() : "";
    if (!caseSummary) {
      return res.status(400).json({ message: "A case summary is required." });
    }

    const ocrResult = await performSarvamOCR(req.file.buffer, req.file.mimetype);
    const ocrText = typeof ocrResult === "string" ? ocrResult : JSON.stringify(ocrResult, null, 2);
    if (!ocrText.trim()) {
      return res.status(422).json({ message: "No readable text was found in this report." });
    }

    const analysis = await summarizeReportForCase(caseSummary, ocrText);
    return res.status(200).json({
      message: "Report analyzed successfully.",
      report: {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        analysis,
      },
    });
  } catch (error) {
    console.error("Case report summary error:", error);
    return res.status(502).json({ message: "Unable to analyze this report right now." });
  }
};
