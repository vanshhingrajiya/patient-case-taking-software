import { env } from "../../config/env.js";

// Uses the Dhruva Bhashini API for TTS (Text to Speech)
export async function bhashiniTTS(text, sourceLanguage = "en") {
  try {
    const response = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.bhashiniInference,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: "tts",
            config: {
              language: {
                sourceLanguage: sourceLanguage,
              },
            },
          },
        ],
        inputData: {
          input: [
            {
              source: text,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Bhashini TTS Error:", err);
      throw new Error("Failed to generate TTS audio from Bhashini");
    }

    const data = await response.json();
    return data.pipelineResponse[0].audio[0].audioContent; // Returns base64 audio string
  } catch (error) {
    console.error("Bhashini TTS Utils Error:", error);
    throw error;
  }
}

// Uses the Dhruva Bhashini API for ASR (Automatic Speech Recognition)
export async function bhashiniASR(base64Audio, sourceLanguage = "en") {
  try {
    const response = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.bhashiniInference,
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: "asr",
            config: {
              language: {
                sourceLanguage: sourceLanguage,
              },
              audioFormat: "wav", // Assuming the frontend sends wav
              samplingRate: 16000,
            },
          },
        ],
        inputData: {
          audio: [
            {
              audioContent: base64Audio,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Bhashini ASR Error:", err);
      throw new Error("Failed to transcribe audio from Bhashini");
    }

    const data = await response.json();
    return data.pipelineResponse[0].output[0].source; // Returns transcribed text string
  } catch (error) {
    console.error("Bhashini ASR Utils Error:", error);
    throw error;
  }
}
