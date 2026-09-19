import { env } from "./config/env.js";

async function inspectBhashini() {
  console.log("UserID:", env.bhashiniUserId);
  console.log("ULCA Key:", env.bhashiniUlcaApiKey ? "present" : "missing");
  console.log("Inference Key:", env.bhashiniInferenceApiKey ? "present" : "missing");

  // Test 1: getModelsPipeline without pipelineId or with ulcacontrib
  try {
    const res = await fetch("https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline", {
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
                sourceLanguage: "en",
                targetLanguage: "hi",
              },
            },
          },
        ],
        pipelineRequestConfig: {
          pipelineId: "64392f96daac50000a304e41",
        },
      }),
    });
    console.log("Test 1 status:", res.status, await res.text());
  } catch (e) {
    console.log("Test 1 error:", e.message);
  }

  // Test 2: Bhashini direct inference endpoint
  try {
    const res2 = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
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
                sourceLanguage: "en",
                targetLanguage: "hi",
              },
            },
          },
        ],
        inputData: {
          input: [{ source: "Hello world" }],
        },
      }),
    });
    console.log("Test 2 (Direct Dhruva) status:", res2.status, await res2.text());
  } catch (e) {
    console.log("Test 2 error:", e.message);
  }
}

inspectBhashini();

