import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 15),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 10),
  otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 0),
  otpHourlyLimit: Number(process.env.OTP_HOURLY_LIMIT || 9999),
  cloudinaryCloudName: process.env.CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUD_API_KEY,
  cloudinaryApiSecret: process.env.CLOUD_API_SECRET,
  bhashiniUserId: process.env.BHASHINI_USER_ID,
  bhashiniUlcaApiKey: process.env.BHASHINI_ULCA_API_KEY,
  bhashiniInferenceApiKey: process.env.BHASHINI_INFERENCE_API_KEY,
  bhashiniPipelineId: process.env.BHASHINI_PIPELINE_ID || "64392f96daac50000a304e41",
  sarvamApiKey: process.env.SARVAM_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  isProduction: process.env.NODE_ENV === "production",
};

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is required. Add it to server/.env before starting the server.");
}
