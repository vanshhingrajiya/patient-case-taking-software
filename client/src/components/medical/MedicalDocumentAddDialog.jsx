import { useState } from "react";
import { RiCloseLine, RiUploadCloud2Line } from "@remixicon/react";
import { Button } from "../ui/button";
import { addMedicalDocuments } from "../../services";
import { DocumentUploadSection } from "./DocumentUploadSection";

const categoryLabels = {
  prescription: "Prescription",
  report: "Medical Report",
  summary: "Summary",
};

export function MedicalDocumentAddDialog({ bundle, documentType, onClose, onAdded }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const label = categoryLabels[documentType];

  const submit = async (event) => {
    event.preventDefault();
    if (!files.length) {
      setError("Add at least one medical document.");
      return;
    }
    setError("");
    const formData = new FormData();
    formData.append("bundleId", bundle._id);
    formData.append("documentType", documentType);
    files.forEach((file) => formData.append("files", file));
    setBusy(true);
    try {
      const result = await addMedicalDocuments(formData);
      onAdded(result.documents || []);
    } catch (reason) {
      setError(reason.message || "Unable to add medical documents.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#143337]/35 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><span className="inline-flex items-center gap-2 text-[0.7rem] font-black tracking-[0.15em] text-[#0c5e5b] uppercase"><RiUploadCloud2Line className="size-4" /> Medical records</span><h2 className="mt-2 text-2xl font-bold text-[#142a30]">Add {label}</h2></div>
          <button type="button" aria-label="Close" className="grid size-9 place-items-center rounded-full text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}><RiCloseLine className="size-5" /></button>
        </div>
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>}
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <DocumentUploadSection label={label} type={`existing-${documentType}`} files={files} onAdd={(added) => setFiles((current) => [...current, ...added])} onRemove={(index) => setFiles((current) => current.filter((_file, fileIndex) => fileIndex !== index))} />
          <div className="mt-2 flex justify-end gap-3"><Button type="button" variant="outline" className="rounded-lg border border-[#d1e2dc] px-5 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={onClose}>Cancel</Button><Button disabled={busy} type="submit" className="rounded-lg bg-[#0c5e5b] px-5 py-2 text-xs font-bold text-white hover:bg-[#084341] cursor-pointer">{busy ? "Uploading..." : `Add ${label}`}</Button></div>
        </form>
      </div>
    </div>
  );
}
