import { performSarvamOCR } from "../utils/ocr.utils.js";

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
