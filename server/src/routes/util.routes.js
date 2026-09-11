import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.middleware.js";
import { extractTextFromDocument, summarizeCaseReport } from "../controllers/ocr.controller.js";

const router = express.Router();
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/jpg", "image/png"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, fieldSize: 100 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    return callback(null, true);
  },
});

router.post("/ocr-doc", upload.single("file"), extractTextFromDocument);
router.post("/case-report-summary", requireAuth, upload.single("file"), summarizeCaseReport);

export default router;
