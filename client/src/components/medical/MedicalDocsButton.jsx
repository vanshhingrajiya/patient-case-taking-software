import { useEffect, useState } from "react";
import { RiAddLine } from "@remixicon/react";
import { Button } from "../ui/button";
import { deleteMedicalDocument, getMedicalHistory } from "../../services";
import { MedicalBundleForm } from "./MedicalBundleForm";
import { MedicalHistoryBundleCard } from "./MedicalHistoryBundleCard";
import { MedicalDocumentPreviewDialog } from "./MedicalDocumentPreviewDialog";

export function MedicalDocsButton() {
  const [open, setOpen] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [error, setError] = useState("");
  const [previewingDocument, setPreviewingDocument] = useState(null);

  useEffect(() => { getMedicalHistory().then((result) => setBundles(result.bundles)).catch((reason) => setError(reason.message)); }, []);

  const removeDocument = async (documentId) => {
    try { await deleteMedicalDocument(documentId); setBundles((current) => current.map((bundle) => ({ ...bundle, documents: bundle.documents.filter((document) => document._id !== documentId) })).filter((bundle) => bundle.documents.length)); } catch (reason) { setError(reason.message); }
  };

  return <div className="mt-8 border-t border-[#d1e2dc] pt-6"><div className="flex items-center justify-between gap-4"><div><h3 className="text-lg font-bold text-[#142a30]">Medical history</h3><p className="mt-1 text-xs text-[#556e72]">Keep prescriptions, reports, and summaries together.</p></div><Button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#0c5e5b] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#084341] cursor-pointer" onClick={() => setOpen(true)}><RiAddLine className="size-4" /> Add Medical Docs</Button></div>{error && <p className="mt-3 text-xs font-medium text-red-700">{error}</p>}<div className="mt-4 grid gap-3">{bundles.map((bundle) => <MedicalHistoryBundleCard key={bundle._id} bundle={bundle} onDelete={removeDocument} onViewDocument={setPreviewingDocument} />)}</div>{open && <MedicalBundleForm onClose={() => setOpen(false)} onCreated={(bundle) => { setBundles((current) => [bundle, ...current]); setOpen(false); }} />}{previewingDocument && <MedicalDocumentPreviewDialog document={previewingDocument} onClose={() => setPreviewingDocument(null)} />}</div>;
}