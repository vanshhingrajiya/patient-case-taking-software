import express from "express";
import multer from "multer";
import { extractTextFromDocument } from "../controllers/ocr.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/ocr-doc", upload.single("file"), extractTextFromDocument);

export default router;
