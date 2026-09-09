import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileHeart,
  Pill,
  Activity,
  PlusCircle,
  CheckCircle,
  FileText,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { RiAddLine } from "@remixicon/react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { MedicalBundleForm } from "../../components/medical/MedicalBundleForm";
import { MedicalHistoryBundleCard } from "../../components/medical/MedicalHistoryBundleCard";
import { deleteMedicalBundle, deleteMedicalDocument, getMedicalHistory } from "../../services";
import { MedicalBundleEditDialog } from "../../components/medical/MedicalBundleEditDialog";
import { MedicalDocumentEditDialog } from "../../components/medical/MedicalDocumentEditDialog";
import { MedicalDocumentPreviewDialog } from "../../components/medical/MedicalDocumentPreviewDialog";
import { MedicalDocumentAddDialog } from "../../components/medical/MedicalDocumentAddDialog";
import { MedicalBundleDocumentsDialog } from "../../components/medical/MedicalBundleDocumentsDialog";

export function MedicalHistory() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [bundlesError, setBundlesError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [previewingDocument, setPreviewingDocument] = useState(null);
  const [addingDocuments, setAddingDocuments] = useState(null);
  const [viewingBundleId, setViewingBundleId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadMedicalHistory() {
      try {
        const result = await getMedicalHistory();
        if (active) setBundles(result.bundles || []);
      } catch (reason) {
        if (active) setBundlesError(reason.message || "Unable to load medical documents.");
      } finally {
        if (active) setBundlesLoading(false);
      }
    }

    loadMedicalHistory();
    return () => {
      active = false;
    };
  }, []);

  const removeDocument = async (documentId) => {
    if (!window.confirm("Delete this medical document permanently?")) return;
    try {
      await deleteMedicalDocument(documentId);
      setBundles((current) => current.map((bundle) => ({ ...bundle, documents: bundle.documents.filter((document) => document._id !== documentId) })).filter((bundle) => bundle.documents.length));
    } catch (reason) {
      setBundlesError(reason.message || "Unable to delete the document.");
    }
  };

  const removeBundle = async (bundleId) => {
    if (!window.confirm("Delete this medical history bundle? All documents inside this bundle will also be permanently deleted.")) return;
    try {
      await deleteMedicalBundle(bundleId);
      setBundles((current) => current.filter((bundle) => bundle._id !== bundleId));
    } catch (reason) {
      setBundlesError(reason.message || "Unable to delete the bundle.");
    }
  };

  const replaceDocument = (updatedDocument) => {
    setBundles((current) => current.map((bundle) => ({ ...bundle, documents: bundle.documents.map((document) => document._id === updatedDocument._id ? updatedDocument : document) })));
    setEditingDocument(null);
  };

  const replaceBundle = (updatedBundle) => {
    setBundles((current) => current.map((bundle) => bundle._id === updatedBundle._id ? { ...bundle, ...updatedBundle } : bundle));
    setEditingBundle(null);
  };

  const appendDocuments = (documents) => {
    if (!addingDocuments) return;
    setBundles((current) => current.map((bundle) => bundle._id === addingDocuments.bundle._id ? { ...bundle, documents: [...(bundle.documents || []), ...documents] } : bundle));
    setAddingDocuments(null);
  };

  const viewingBundle = bundles.find((bundle) => bundle._id === viewingBundleId);

  const [conditions] = useState([
    {
      id: "c1",
      name: "Mild Seasonal Asthma",
      diagnosedDate: "March 2023",
      status: "Controlled",
      severity: "Mild",
    },
    {
      id: "c2",
      name: "Pre-Hypertension",
      diagnosedDate: "November 2024",
      status: "Monitoring",
      severity: "Moderate",
    },
  ]);

  const [allergies] = useState([
    {
      id: "a1",
      allergen: "Penicillin",
      type: "Medication",
      reaction: "Skin Rash & Urticaria",
      severity: "High",
    },
    {
      id: "a2",
      allergen: "Dust Mites",
      type: "Environmental",
      reaction: "Sneezing & Nasal Congestion",
      severity: "Mild",
    },
  ]);

  const [medications] = useState([
    {
      id: "m1",
      name: "Salbutamol Inhaler (100 mcg)",
      dosage: "1-2 puffs as needed for breathlessness",
      prescribedBy: "Dr. A. K. Verma (Pulmonologist)",
      startDate: "Apr 2024",
      status: "Active",
    },
    {
      id: "m2",
      name: "Vitamin D3 (60,000 IU)",
      dosage: "Once weekly for 8 weeks",
      prescribedBy: "Dr. S. Nair (Internal Medicine)",
      startDate: "Jan 2026",
      status: "Completed",
    },
  ]);

  return (
    <DashboardLayout title="Medical History">
      <div className="space-y-6">
        {/* Header Intro Banner */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e2f2ef] text-[#0c5e5b] shadow-xs">
                <FileHeart className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Comprehensive Medical History
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  All clinical diagnoses, active prescriptions, and critical drug allergies recorded in your profile.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/patient/new-case")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0c5e5b] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#084341] cursor-pointer"
            >
              <PlusCircle className="size-4" />
              Record New Symptom
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#e2f2ef] text-[#0c5e5b]">
                <FileText className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Uploaded Medical Documents</h2>
                <span className="text-xs text-gray-500">Records grouped by medical event</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!bundlesLoading && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0c5e5b]">{bundles.length} {bundles.length === 1 ? "Bundle" : "Bundles"}</span>}
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0c5e5b] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#084341] cursor-pointer"
              >
                <RiAddLine className="size-4" />
                Add Medical Docs
              </button>
            </div>
          </div>

          {bundlesLoading && <p className="mt-4 text-sm text-gray-500">Loading medical documents...</p>}
          {!bundlesLoading && bundlesError && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{bundlesError}</p>}
          {!bundlesLoading && !bundlesError && bundles.length === 0 && <p className="mt-4 text-sm text-gray-500">No uploaded medical documents yet.</p>}
          {!bundlesLoading && !bundlesError && bundles.length > 0 && <div className="mt-4 grid items-start gap-4 md:grid-cols-2">{bundles.map((bundle) => <MedicalHistoryBundleCard key={bundle._id} bundle={bundle} onDeleteBundle={removeBundle} onUpdate={setEditingBundle} onViewBundle={(selectedBundle) => setViewingBundleId(selectedBundle._id)} />)}</div>}
        </div>

        {uploadOpen && <MedicalBundleForm onClose={() => setUploadOpen(false)} onCreated={(bundle) => { setBundles((current) => [bundle, ...current]); setUploadOpen(false); }} />}
        {editingDocument && <MedicalDocumentEditDialog document={editingDocument} onClose={() => setEditingDocument(null)} onUpdated={replaceDocument} />}
        {previewingDocument && <MedicalDocumentPreviewDialog document={previewingDocument} onClose={() => setPreviewingDocument(null)} />}
        {addingDocuments && <MedicalDocumentAddDialog bundle={addingDocuments.bundle} documentType={addingDocuments.documentType} onClose={() => setAddingDocuments(null)} onAdded={appendDocuments} />}
        {editingBundle && <MedicalBundleEditDialog bundle={editingBundle} onClose={() => setEditingBundle(null)} onUpdated={replaceBundle} />}
        {viewingBundle && <MedicalBundleDocumentsDialog bundle={viewingBundle} onClose={() => setViewingBundleId(null)} onDelete={removeDocument} onUpdateDocument={setEditingDocument} onViewDocument={setPreviewingDocument} onAddDocuments={(selectedBundle, documentType) => setAddingDocuments({ bundle: selectedBundle, documentType })} />}

        {/* Section 1: Chronic Conditions & Medical Diagnoses */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-[#0c5e5b]">
                <Activity className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Diagnosed Medical Conditions
                </h2>
                <span className="text-xs text-gray-500">
                  Chronic or recurring health issues recorded by physicians
                </span>
              </div>
            </div>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-[#0c5e5b]">
              {conditions.length} Active
            </span>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {conditions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" /> Diagnosed: {item.diagnosedDate}
                    </span>
                    <span>•</span>
                    <span>Severity: <strong className="text-gray-700">{item.severity}</strong></span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 w-fit">
                  <CheckCircle className="size-3" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Allergies & Adverse Reactions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <ShieldAlert className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Known Allergies & Drug Sensitivities
                </h2>
                <span className="text-xs text-gray-500">
                  Crucial information for physicians prior to prescribing medications
                </span>
              </div>
            </div>
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
              {allergies.length} Recorded
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="rounded-xl border border-red-100 bg-[#fffafa] p-4 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-red-900">
                      {allergy.allergen}
                    </span>
                    <span className="ml-2 rounded-full bg-red-100/80 px-2 py-0.5 text-[0.68rem] font-medium text-red-800">
                      {allergy.type}
                    </span>
                  </div>
                  <span className="rounded-md bg-red-600 px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase">
                    {allergy.severity} Risk
                  </span>
                </div>
                <div className="mt-2.5 text-gray-600">
                  <span className="font-medium text-gray-800">Reaction:</span> {allergy.reaction}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Current & Past Medications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#e2f2ef] text-[#0c5e5b]">
                <Pill className="size-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Medication Records
                </h2>
                <span className="text-xs text-gray-500">
                  Current prescriptions and historical treatment courses
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {medications.map((med) => (
              <div
                key={med.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-gray-900">
                      {med.name}
                    </strong>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                        med.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {med.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Dosage: {med.dosage}
                  </p>
                  <span className="mt-0.5 block text-[0.72rem] text-gray-400">
                    Prescribed by {med.prescribedBy} • Started {med.startDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MedicalHistory;
