import mongoose from "mongoose";
import multer from "multer";
import { env } from "../../config/env.js";
import { MedicalDocument, MedicalHistoryBundle, Patient, UserPatientProfile } from "../models/index.js";
import { deleteCloudinaryFile, uploadMedicalDocument } from "../services/cloudinary.service.js";
import { performSarvamOCR } from "../utils/ocr.utils.js";

const documentTypes = ["prescription", "report", "summary"];
const bundleTypes = ["surgery", "hospitalization", "disease", "treatment", "injury", "other"];
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/jpg", "image/png"]);

const medicalDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname !== "file" || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    callback(null, true);
  },
}).single("file");

const additionalMedicalDocumentsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname !== "files" || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    callback(null, true);
  },
}).array("files", 10);

export const medicalUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 30, fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!documentTypes.includes(file.fieldname) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    callback(null, true);
  },
}).fields(documentTypes.map((name) => ({ name, maxCount: 10 })));

async function selectedPatientId(req) {
  if (req.auth?.role !== "patient") return null;
  if (req.auth.selectedPatientId) return req.auth.selectedPatientId;

  const link = await UserPatientProfile.findOne({ userId: req.auth.sub })
    .sort({ isPrimary: -1, createdAt: 1 })
    .select("patientId")
    .lean();

  return link?.patientId || null;
}

async function ownedPatient(req) {
  const patientId = await selectedPatientId(req);
  if (!patientId || !mongoose.isValidObjectId(patientId)) return null;
  const linked = await UserPatientProfile.exists({ userId: req.auth.sub, patientId });
  return linked ? Patient.findById(patientId) : null;
}

function validateBundleInput(body) {
  const { title, description, bundleType, eventDate } = body;
  if (!title?.trim() || !eventDate || Number.isNaN(Date.parse(eventDate))) {
    return "Title and a valid event date are required.";
  }
  if (!bundleTypes.includes(bundleType)) {
    return "Choose a valid bundle type.";
  }
  if (description && description.length > 2000) return "Description is too long.";
  return null;
}

export async function createMedicalBundle(req, res) {
  const patient = await ownedPatient(req);
  if (!patient) return res.status(403).json({ message: "You do not have access to this patient profile." });

  const validationError = validateBundleInput(req.body);
  if (validationError) return res.status(400).json({ message: validationError });
  const files = Object.values(req.files || {}).flat();
  if (!files.length) return res.status(400).json({ message: "Add at least one medical document." });
  if (![...files].every((file) => allowedMimeTypes.has(file.mimetype))) {
    return res.status(400).json({ message: "Only PDF, JPG, JPEG, and PNG files are supported." });
  }

  let bundle;
  const uploaded = [];
  try {
    bundle = await MedicalHistoryBundle.create({
      patientId: patient._id,
      title: req.body.title.trim(),
      description: req.body.description?.trim() || undefined,
      bundleType: req.body.bundleType,
      eventDate: new Date(req.body.eventDate),
    });

    const documents = [];
    for (const file of files) {
      const result = await uploadMedicalDocument(file.buffer, {
        folder: `medikiosk/patients/${patient._id}/${bundle._id}/${file.fieldname}`,
        mimeType: file.mimetype,
        originalFileName: file.originalname,
      });

      const ocrResult = await performSarvamOCR(file.buffer, file.mimetype).catch(() => null);
      let rawText = undefined;
      if (ocrResult) {
        rawText = typeof ocrResult === "string" ? ocrResult : JSON.stringify(ocrResult, null, 2);
      }

      uploaded.push({ publicId: result.public_id, resourceType: result.resource_type });
      documents.push({
        patientId: patient._id,
        bundleId: bundle._id,
        documentType: file.fieldname,
        fileUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        resourceType: result.resource_type,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        documentDate: req.body.documentDate ? new Date(req.body.documentDate) : undefined,
        ocr: rawText ? { rawText } : undefined,
      });
    }

    const savedDocuments = await MedicalDocument.insertMany(documents);
    patient.bundles.push(bundle._id);
    await patient.save();
    return res.status(201).json({ bundle: { ...bundle.toObject(), documents: savedDocuments } });
  } catch (error) {
    await Promise.all(uploaded.map((file) => deleteCloudinaryFile(file.publicId, file.resourceType).catch(() => null)));
    if (bundle) await MedicalHistoryBundle.findByIdAndDelete(bundle._id);
    return res.status(500).json({ message: error.message || "Unable to upload medical documents." });
  }
}

export async function listMedicalBundles(req, res) {
  const patient = await ownedPatient(req);
  if (!patient) return res.status(403).json({ message: "You do not have access to this patient profile." });
  const bundles = await MedicalHistoryBundle.find({ patientId: patient._id }).sort({ eventDate: -1, createdAt: -1 }).lean();
  const documents = await MedicalDocument.find({ patientId: patient._id, bundleId: { $in: bundles.map((bundle) => bundle._id) } }).lean();
  const grouped = documents.reduce((result, document) => {
    (result[document.bundleId.toString()] ||= []).push(document);
    return result;
  }, {});
  return res.json({ bundles: bundles.map((bundle) => ({ ...bundle, documents: grouped[bundle._id.toString()] || [] })) });
}

export const additionalMedicalDocumentsUploadMiddleware = additionalMedicalDocumentsUpload;

export async function addMedicalDocuments(req, res) {
  const patient = await ownedPatient(req);
  if (!patient) return res.status(403).json({ message: "You do not have access to this patient profile." });
  if (!mongoose.isValidObjectId(req.body.bundleId)) return res.status(400).json({ message: "A valid bundle is required." });
  if (!documentTypes.includes(req.body.documentType)) return res.status(400).json({ message: "Choose a valid document type." });
  if (!req.files?.length) return res.status(400).json({ message: "Add at least one medical document." });

  const bundle = await MedicalHistoryBundle.findOne({ _id: req.body.bundleId, patientId: patient._id });
  if (!bundle) return res.status(404).json({ message: "Medical history bundle not found." });

  const uploaded = [];
  try {
    const documents = [];
    for (const file of req.files) {
      const result = await uploadMedicalDocument(file.buffer, {
        folder: `medikiosk/patients/${patient._id}/${bundle._id}/${req.body.documentType}`,
        mimeType: file.mimetype,
        originalFileName: file.originalname,
      });

      const ocrResult = await performSarvamOCR(file.buffer, file.mimetype).catch(() => null);
      let rawText = undefined;
      if (ocrResult) {
        rawText = typeof ocrResult === "string" ? ocrResult : JSON.stringify(ocrResult, null, 2);
      }

      uploaded.push({ publicId: result.public_id, resourceType: result.resource_type });
      documents.push({
        patientId: patient._id,
        bundleId: bundle._id,
        documentType: req.body.documentType,
        fileUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        resourceType: result.resource_type,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        documentDate: req.body.documentDate ? new Date(req.body.documentDate) : undefined,
        ocr: rawText ? { rawText } : undefined,
      });
    }
    const savedDocuments = await MedicalDocument.insertMany(documents);
    return res.status(201).json({ documents: savedDocuments });
  } catch (error) {
    await Promise.all(uploaded.map((file) => deleteCloudinaryFile(file.publicId, file.resourceType).catch(() => null)));
    return res.status(500).json({ message: error.message || "Unable to add medical documents." });
  }
}

export const medicalDocumentUploadMiddleware = medicalDocumentUpload;

function documentResourceType(document) {
  return document.resourceType || (document.mimeType === "application/pdf" ? "raw" : "image");
}

function validDate(value) {
  return !value || !Number.isNaN(Date.parse(value));
}

export async function updateMedicalBundle(req, res) {
  const patient = await ownedPatient(req);
  if (!patient) return res.status(403).json({ message: "You do not have access to this patient profile." });
  if (!mongoose.isValidObjectId(req.params.bundleId)) return res.status(404).json({ message: "Medical history bundle not found." });
  const validationError = validateBundleInput(req.body);
  if (validationError) return res.status(400).json({ message: validationError });
  const bundle = await MedicalHistoryBundle.findOne({ _id: req.params.bundleId, patientId: patient._id });
  if (!bundle) return res.status(404).json({ message: "Medical history bundle not found." });
  bundle.title = req.body.title.trim();
  bundle.description = req.body.description?.trim() || undefined;
  bundle.bundleType = req.body.bundleType;
  bundle.eventDate = new Date(req.body.eventDate);
  await bundle.save();
  return res.json({ bundle });
}

export async function deleteMedicalBundle(req, res) {
  const patient = await ownedPatient(req);
  if (!patient) return res.status(403).json({ message: "You do not have access to this patient profile." });
  if (!mongoose.isValidObjectId(req.params.bundleId)) return res.status(404).json({ message: "Medical history bundle not found." });
  const bundle = await MedicalHistoryBundle.findOne({ _id: req.params.bundleId, patientId: patient._id });
  if (!bundle) return res.status(404).json({ message: "Medical history bundle not found." });
  const documents = await MedicalDocument.find({ bundleId: bundle._id, patientId: patient._id });
  try {
    for (const document of documents) {
      await deleteCloudinaryFile(document.cloudinaryPublicId, documentResourceType(document));
    }
    await MedicalDocument.deleteMany({ bundleId: bundle._id, patientId: patient._id });
    await bundle.deleteOne();
    patient.bundles = patient.bundles.filter((bundleId) => bundleId.toString() !== bundle._id.toString());
    await patient.save();
  } catch (error) {
    return res.status(502).json({ message: error.message || "Unable to delete the medical history bundle files." });
  }
  return res.json({ message: "Medical history bundle deleted." });
}

export async function updateMedicalDocument(req, res) {
  const patient = await ownedPatient(req);
  if (!patient || !mongoose.isValidObjectId(req.params.documentId)) return res.status(403).json({ message: "You do not have access to this document." });
  const document = await MedicalDocument.findOne({ _id: req.params.documentId, patientId: patient._id });
  if (!document) return res.status(404).json({ message: "Medical document not found." });
  const documentType = req.body.documentType || document.documentType;
  if (!documentTypes.includes(documentType)) return res.status(400).json({ message: "Choose a valid document type." });
  if (!validDate(req.body.documentDate)) return res.status(400).json({ message: "Choose a valid document date." });

  const oldResourceType = documentResourceType(document);
  let replacement;
  try {
    if (req.file) {
      await deleteCloudinaryFile(document.cloudinaryPublicId, oldResourceType);
      const result = await uploadMedicalDocument(req.file.buffer, {
        folder: `medikiosk/patients/${patient._id}/${document.bundleId}/${documentType}`,
        mimeType: req.file.mimetype,
        originalFileName: req.file.originalname,
      });
      replacement = result;
      document.fileUrl = result.secure_url;
      document.cloudinaryPublicId = result.public_id;
      document.resourceType = result.resource_type;
      document.originalFileName = req.file.originalname;
      document.mimeType = req.file.mimetype;
      document.fileSize = req.file.size;

      const ocrResult = await performSarvamOCR(req.file.buffer, req.file.mimetype).catch(() => null);
      if (ocrResult) {
        document.ocr = document.ocr || {};
        document.ocr.rawText = typeof ocrResult === "string" ? ocrResult : JSON.stringify(ocrResult, null, 2);
      }
    }
    document.documentType = documentType;
    if (req.body.documentDate) document.documentDate = new Date(req.body.documentDate);
    await document.save();
  } catch (error) {
    if (replacement) await deleteCloudinaryFile(replacement.public_id, replacement.resource_type).catch(() => null);
    return res.status(502).json({ message: error.message || "Unable to update the medical document." });
  }
  return res.json({ document });
}

export async function deleteMedicalDocument(req, res) {
  const patient = await ownedPatient(req);
  if (!patient || !mongoose.isValidObjectId(req.params.documentId)) return res.status(403).json({ message: "You do not have access to this document." });
  const document = await MedicalDocument.findOne({ _id: req.params.documentId, patientId: patient._id });
  if (!document) return res.status(404).json({ message: "Medical document not found." });
  try {
    await deleteCloudinaryFile(document.cloudinaryPublicId, documentResourceType(document));
    await document.deleteOne();
    const remaining = await MedicalDocument.findOne({ bundleId: document.bundleId });
    if (!remaining) {
      await MedicalHistoryBundle.findByIdAndDelete(document.bundleId);
      patient.bundles = patient.bundles.filter((bundleId) => bundleId.toString() !== document.bundleId.toString());
      await patient.save();
    }
  } catch (error) {
    return res.status(502).json({ message: error.message || "Unable to delete the medical document." });
  }
  return res.json({ message: "Medical document deleted." });
}

export function handleMedicalUploadError(error, _req, res, next) {
  if (error instanceof multer.MulterError) return res.status(400).json({ message: "Each file must be a PDF, JPG, JPEG, or PNG under 10 MB." });
  return next(error);
}