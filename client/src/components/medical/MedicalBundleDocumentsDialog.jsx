import { useState } from "react";
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { Button } from "../ui/button";
import { MedicalDocumentViewer } from "./MedicalDocumentViewer";
import { MedicalDocumentPreview } from "./MedicalDocumentPreview";
import { MedicalDocumentEdit } from "./MedicalDocumentEdit";

const documentCategories = [
  ["Prescription", "prescription"],
  ["Medical Report", "report"],
  ["Summary", "summary"],
];

export function MedicalBundleDocumentsDialog({ bundle, onClose, onDelete, onDocumentUpdated, onAddDocuments }) {
  const [activeView, setActiveView] = useState({ type: "list", document: null });

  const handleUpdate = (updatedDocument) => {
    onDocumentUpdated(updatedDocument);
    // After update, if the document is still open in preview or edit, 
    // update the local state with the new document data.
    setActiveView((current) => ({ ...current, document: updatedDocument }));
    
    // Go back to list view on successful save from edit view
    if (activeView.type === "edit") {
      setActiveView({ type: "list", document: null });
    }
  };

  const handleBack = () => {
    setActiveView({ type: "list", document: null });
  };

  const handleDelete = async (documentId) => {
    await onDelete(documentId);
    if (activeView.document?._id === documentId) {
      handleBack();
    }
  };

  // The dialog width should expand if we are in preview mode and the document has OCR analysis
  const hasAnalysis = activeView.document?.analysisStatus !== undefined;
  const isPreviewExpanded = activeView.type === "preview" && hasAnalysis;
  const dialogMaxWidth = isPreviewExpanded ? "max-w-6xl" : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#143337]/35 p-4 sm:p-8 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`relative flex w-full max-h-[min(88vh,760px)] ${dialogMaxWidth} flex-col rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8 transition-all duration-300`} 
        onClick={(e) => e.stopPropagation()}
      >
        {activeView.type === "list" && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-[#142a30]">{bundle.title}</h2>
                <p className="mt-1 text-xs font-medium text-[#0c5e5b]">{bundle.bundleType} · {new Date(bundle.eventDate).toLocaleDateString()}</p>
              </div>
              <Button type="button" variant="ghost" aria-label="Close documents" className="grid size-9 shrink-0 place-items-center rounded-full p-0 text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}>
                <RiCloseLine className="size-5" />
              </Button>
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
                          {documents.map((document) => (
                            <MedicalDocumentViewer 
                              key={document._id} 
                              document={document} 
                              onDelete={handleDelete} 
                              onUpdate={() => setActiveView({ type: "edit", document })} 
                              onView={() => setActiveView({ type: "preview", document })} 
                            />
                          ))}
                          {onAddDocuments && (
                            <Button type="button" variant="outline" className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#b8d5ce] bg-white px-3 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onAddDocuments(bundle, type)}>
                              <RiAddLine className="size-4" /> Add {label}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 grid justify-items-start gap-2">
                          <p className="text-xs text-[#8a9b9d]">No documents uploaded.</p>
                          {onAddDocuments && (
                            <Button type="button" variant="outline" className="inline-flex items-center gap-1.5 rounded-lg border border-[#b8d5ce] bg-white px-3 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onAddDocuments(bundle, type)}>
                              <RiAddLine className="size-4" /> Add {label}
                            </Button>
                          )}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeView.type === "preview" && (
          <MedicalDocumentPreview 
            document={activeView.document} 
            onBack={handleBack} 
          />
        )}

        {activeView.type === "edit" && (
          <MedicalDocumentEdit 
            document={activeView.document} 
            onBack={handleBack} 
            onUpdated={handleUpdate} 
          />
        )}
      </div>
    </div>
  );
}
