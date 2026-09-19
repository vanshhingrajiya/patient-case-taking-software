import express from "express";
import { generateConsentAudio, processConsentVoice } from "../controllers/bhashini.controller.js";

const router = express.Router();

router.post("/tts", generateConsentAudio);
router.post("/process-consent", processConsentVoice);

export default router;
