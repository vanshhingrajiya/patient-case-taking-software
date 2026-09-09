import { RiCloseLine, RiFileTextLine } from "@remixicon/react";
import { Button } from "../ui/button";

export function MedicalDocumentPreviewDialog({ document, onClose }) {
  const isPdf = document.mimeType === "application/pdf" || document.fileUrl?.toLowerCase().includes(".pdf");

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#143337]/35 px-4 py-8 backdrop-blur-sm">
      <div className={`mx-auto flex h-[min(85vh,720px)] ${document.ocr?.rawText ? 'max-w-6xl' : 'max-w-4xl'} flex-col rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 text-[#0c5e5b]">
            <RiFileTextLine className="size-5 shrink-0" />
            <h2 className="truncate text-xl font-bold text-[#142a30]">{document.originalFileName}</h2>
          </div>
          <Button type="button" variant="ghost" aria-label="Close document preview" className="grid size-9 shrink-0 place-items-center rounded-full p-0 text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}>
            <RiCloseLine className="size-5" />
          </Button>
        </div>
        <div className={`mt-5 min-h-0 flex-1 flex gap-4 ${document.ocr?.rawText ? 'flex-col lg:flex-row' : 'flex-col'}`}>
          <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-[#d1e2dc] bg-[#f7fbf9]">
            {isPdf ? (
              <iframe src={document.fileUrl} title={document.originalFileName} className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                <img src={document.fileUrl} alt={document.originalFileName} className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>
          {document.ocr?.rawText && (
            <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-[#d1e2dc] bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-bold text-[#0c5e5b]">Extracted Text (OCR)</h3>
              <pre className="whitespace-pre-wrap font-sans text-xs text-[#142a30] leading-relaxed">{document.ocr.rawText}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
