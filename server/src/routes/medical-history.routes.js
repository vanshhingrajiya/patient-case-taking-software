import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createMedicalBundle, deleteMedicalBundle, handleMedicalUploadError, listMedicalBundles, medicalUpload, updateMedicalBundle } from "../controllers/medical-history.controller.js";

const router = Router();

router.use(requireAuth);
router.post("/bundle", medicalUpload, createMedicalBundle);
router.get("/", listMedicalBundles);
router.put("/bundle/:bundleId", updateMedicalBundle);
router.delete("/bundle/:bundleId", deleteMedicalBundle);
router.use(handleMedicalUploadError);

export default router;