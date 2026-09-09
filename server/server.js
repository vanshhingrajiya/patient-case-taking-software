import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import medicalHistoryRoutes from "./src/routes/medical-history.routes.js";
import medicalDocumentRoutes from "./src/routes/medical-document.routes.js";
import utilRoutes from "./src/routes/util.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.json({ success: true, message: "MediKiosk API is running" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/medical-history", medicalHistoryRoutes);
  app.use("/api/medical-documents", medicalDocumentRoutes);
  app.use("/api/util", utilRoutes);

  return app;
}

export async function startServer() {
  await connectDB();
  const app = createApp();
  return app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}
