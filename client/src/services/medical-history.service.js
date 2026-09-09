import { request } from "./api.client";

export const medicalHistoryService = {
  getMedicalHistory: () => request("/medical-history"),

  createMedicalBundle: (formData) =>
    request("/medical-history/bundle", {
      method: "POST",
      body: formData,
    }),

  addMedicalDocuments: (formData) =>
    request("/medical-documents", {
      method: "POST",
      body: formData,
    }),

  deleteMedicalDocument: (documentId) =>
    request(`/medical-documents/${documentId}`, { method: "DELETE" }),

  updateMedicalDocument: (documentId, formData) =>
    request(`/medical-documents/${documentId}`, { method: "PUT", body: formData }),

  updateMedicalBundle: (bundleId, values) =>
    request(`/medical-history/bundle/${bundleId}`, {
      method: "PUT",
      body: JSON.stringify(values),
    }),

  deleteMedicalBundle: (bundleId) =>
    request(`/medical-history/bundle/${bundleId}`, { method: "DELETE" }),
};

export const {
  getMedicalHistory,
  createMedicalBundle,
  addMedicalDocuments,
  deleteMedicalDocument,
  updateMedicalDocument,
  updateMedicalBundle,
  deleteMedicalBundle,
} = medicalHistoryService;

export default medicalHistoryService;