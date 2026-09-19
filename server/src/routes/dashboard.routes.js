import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/doctor-stats", requireAuth, dashboardController.getDoctorStats);

export default router;
