import { bhashiniTTS, bhashiniASR } from "../utils/bhashini.utils.js";

// POST /api/bhashini/tts
export const generateConsentAudio = async (req, res) => {
  try {
    const { text, language = "en" } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required for TTS" });
    }

    const base64Audio = await bhashiniTTS(text, language);

    return res.json({
      success: true,
      audioBase64: base64Audio,
    });
  } catch (error) {
    console.error("Generate Consent Audio Error:", error);
    return res.status(500).json({
      message: "Failed to generate audio prompt",
    });
  }
};

// POST /api/bhashini/process-consent
export const processConsentVoice = async (req, res) => {
  try {
    // The frontend should send the audio file in the request body as base64 or upload it via multipart
    // Let's assume it sends base64 for simplicity: { audioBase64: "...", language: "en" }
    const { audioBase64, language = "en" } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ message: "Audio data is required" });
    }

    const transcribedText = await bhashiniASR(audioBase64, language);

    if (!transcribedText) {
      return res.status(400).json({ message: "Could not transcribe audio" });
    }

    // Simple intent matching
    const lowerText = transcribedText.toLowerCase().trim();
    const consentKeywords = ["yes", "agree", "haan", "ok", "okay", "sure", "accept"];
    const rejectKeywords = ["no", "disagree", "nahi", "reject", "cancel"];

    let consentGranted = false;

    // Check for positive intent
    const hasConsent = consentKeywords.some((word) => lowerText.includes(word));
    // Check for negative intent (if negative is present, we might override, but let's keep it simple)
    const hasReject = rejectKeywords.some((word) => lowerText.includes(word));

    if (hasConsent && !hasReject) {
      consentGranted = true;
    }

    return res.json({
      success: true,
      transcribedText: transcribedText,
      consentGranted: consentGranted,
    });
  } catch (error) {
    console.error("Process Consent Voice Error:", error);
    return res.status(500).json({
      message: "Failed to process voice consent",
    });
  }
};
