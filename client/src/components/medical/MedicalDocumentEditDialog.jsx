import { useState } from "react";
import { RiCloseLine, RiFileEditLine } from "@remixicon/react";
import { Button } from "../ui/button";
import { updateMedicalDocument } from "../../services";

const documentTypes = [["Prescription", "prescription"], ["Medical Report", "report"], ["Summary", "summary"]];

export function MedicalDocumentEditDialog({ document, onClose, onUpdated }) {
  const [documentType, setDocumentType] = useState(document.documentType);
  const [documentDate, setDocumentDate] = useState(document.documentDate ? new Date(document.documentDate).toISOString().slice(0, 10) : "");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("documentType", documentType);
    if (documentDate) formData.append("documentDate", documentDate);
    if (file) formData.append("file", file);
    setBusy(true);
    try {
      const result = await updateMedicalDocument(document._id, formData);
      onUpdated(result.document);
    } catch (reason) {
      setError(reason.message || "Unable to update the document.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#143337]/35 px-4 py-8 backdrop-blur-sm"><div className="mx-auto max-w-lg rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 text-[0.7rem] font-black tracking-[0.15em] text-[#0c5e5b] uppercase"><RiFileEditLine className="size-4" /> Medical record</span><h2 className="mt-2 text-xl font-bold text-[#142a30]">Update document</h2></div><button type="button" aria-label="Close" className="grid size-9 place-items-center rounded-full text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}><RiCloseLine className="size-5" /></button></div>{error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>}<form className="mt-6 grid gap-4" onSubmit={submit}><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Document Type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="rounded-xl border border-[#d1e2dc] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0c5e5b]">{documentTypes.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Document Date <span className="font-normal text-[#556e72]">(optional)</span><input type="date" value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} className="rounded-xl border border-[#d1e2dc] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0c5e5b]" /></label><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Replacement File <span className="font-normal text-[#556e72]">(optional)</span><input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] || null)} className="rounded-xl border border-[#d1e2dc] bg-white px-3 py-2 text-xs font-normal" /></label><div className="mt-2 flex justify-end gap-3"><Button type="button" variant="outline" className="rounded-lg border border-[#d1e2dc] px-5 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={onClose}>Cancel</Button><Button disabled={busy} type="submit" className="rounded-lg bg-[#0c5e5b] px-5 py-2 text-xs font-bold text-white hover:bg-[#084341] cursor-pointer">{busy ? "Saving..." : "Save changes"}</Button></div></form></div></div>;
}
