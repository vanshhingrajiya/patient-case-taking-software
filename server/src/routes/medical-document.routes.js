import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { addMedicalDocuments, additionalMedicalDocumentsUploadMiddleware, deleteMedicalDocument, handleMedicalUploadError, medicalDocumentUploadMiddleware, updateMedicalDocument } from "../controllers/medical-history.controller.js";

const router = Router();

router.use(requireAuth);
router.post("/", additionalMedicalDocumentsUploadMiddleware, addMedicalDocuments);
router.put("/:documentId", medicalDocumentUploadMiddleware, updateMedicalDocument);
router.delete("/:documentId", deleteMedicalDocument);
router.use(handleMedicalUploadError);

export default router;