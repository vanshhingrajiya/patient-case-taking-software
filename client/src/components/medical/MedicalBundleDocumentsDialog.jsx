import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { Button } from "../ui/button";
import { MedicalDocumentViewer } from "./MedicalDocumentViewer";

const documentCategories = [
  ["Prescription", "prescription"],
  ["Medical Report", "report"],
  ["Summary", "summary"],
];

export function MedicalBundleDocumentsDialog({ bundle, onClose, onDelete, onUpdateDocument, onViewDocument, onAddDocuments }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#143337]/35 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto flex max-h-[min(88vh,760px)] max-w-2xl flex-col rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-[#142a30]">{bundle.title}</h2>
            <p className="mt-1 text-xs font-medium text-[#0c5e5b]">{bundle.bundleType} · {new Date(bundle.eventDate).toLocaleDateString()}</p>
          </div>
          <Button type="button" variant="ghost" aria-label="Close documents" className="grid size-9 shrink-0 place-items-center rounded-full p-0 text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}><RiCloseLine className="size-5" /></Button>
        </div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:#b8d5ce_transparent] [scrollbar-width:thin]">
          <div className="grid gap-3">
            {documentCategories.map(([label, type]) => {
              const documents = (bundle.documents || []).filter((document) => document.documentType === type);

              return (
                <section key={type} className="rounded-xl border border-[#d1e2dc] bg-[#f7fbf9] p-3">
                  <h3 className="text-xs font-bold text-[#142a30]">{label}</h3>
                  {documents.length > 0 ? (
                    <div className="mt-2 grid gap-2">
                      {documents.map((document) => <MedicalDocumentViewer key={document._id} document={document} onDelete={onDelete} onUpdate={onUpdateDocument} onView={onViewDocument} />)}
                      {onAddDocuments && <Button type="button" variant="outline" className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#b8d5ce] bg-white px-3 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onAddDocuments(bundle, type)}><RiAddLine className="size-4" /> Add {label}</Button>}
                    </div>
                  ) : (
                    <div className="mt-2 grid justify-items-start gap-2"><p className="text-xs text-[#8a9b9d]">No documents uploaded.</p>{onAddDocuments && <Button type="button" variant="outline" className="inline-flex items-center gap-1.5 rounded-lg border border-[#b8d5ce] bg-white px-3 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onAddDocuments(bundle, type)}><RiAddLine className="size-4" /> Add {label}</Button>}</div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
