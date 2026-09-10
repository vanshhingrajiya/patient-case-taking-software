import { RiCloseLine, RiFileTextLine } from "@remixicon/react";
import { Button } from "../ui/button";

export function MedicalDocumentPreviewDialog({ document, onClose }) {
  const isPdf = document.mimeType === "application/pdf" || document.fileUrl?.toLowerCase().includes(".pdf");

  // Decide whether to show the extra side panel for extraction data
  const hasAnalysis = document.analysisStatus !== undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#143337]/35 p-4 sm:p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative flex w-full h-[min(85vh,720px)] ${hasAnalysis ? 'max-w-6xl' : 'max-w-4xl'} flex-col rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2 text-[#0c5e5b]">
            <RiFileTextLine className="size-5 shrink-0" />
            <h2 className="truncate text-xl font-bold text-[#142a30]">{document.originalFileName}</h2>
          </div>
          <Button type="button" variant="ghost" aria-label="Close document preview" className="grid size-9 shrink-0 place-items-center rounded-full p-0 text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}>
            <RiCloseLine className="size-5" />
          </Button>
        </div>
        <div className={`mt-5 min-h-0 flex-1 flex gap-4 ${hasAnalysis ? 'flex-col lg:flex-row' : 'flex-col'}`}>
          <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-[#d1e2dc] bg-[#f7fbf9]">
            {isPdf ? (
              <iframe src={document.fileUrl} title={document.originalFileName} className="h-full w-full" />
            ) : (
              <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                <img src={document.fileUrl} alt={document.originalFileName} className="max-h-full max-w-full object-contain" />
              </div>
            )}
          </div>

          {document.analysisStatus === "pending" && (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-xl border border-[#d1e2dc] bg-[#f7fbf9] p-6 shadow-sm text-center">
              <div className="size-10 animate-spin rounded-full border-4 border-[#0c5e5b] border-t-transparent mb-4"></div>
              <h3 className="font-bold text-[#0c5e5b] text-lg">Processing Document</h3>
              <p className="text-sm text-[#556e72] mt-2 max-w-xs">Our AI is extracting medical information from this document. This may take a few moments...</p>
            </div>
          )}

          {document.analysisStatus === "failed" && (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm text-center">
              <div className="size-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <RiCloseLine className="size-6" />
              </div>
              <h3 className="font-bold text-red-700 text-lg">Analysis Failed</h3>
              <p className="text-sm text-red-600 mt-2 max-w-xs">We encountered an error while trying to extract information from this document.</p>
            </div>
          )}

          {document.analysisStatus === "completed" && document.extractedData && (
            <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-[#d1e2dc] bg-white p-5 shadow-sm flex flex-col gap-5">
              <div className="border-b border-[#d1e2dc] pb-3">
                <h3 className="font-bold text-[#0c5e5b] text-lg">Extracted Medical Data</h3>
                {document.extractedData.document_type && (
                  <p className="text-sm text-[#556e72] mt-1 capitalize">{document.extractedData.document_type.replace(/_/g, " ")} {document.extractedData.document_subtype ? `- ${document.extractedData.document_subtype}` : ""}</p>
                )}
              </div>

              {document.extractedData.summary?.clinical_summary && (
                <div className="rounded-xl bg-[#f4f9f7] p-4 border border-[#d1e2dc]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c5e5b] block mb-2">Clinical Summary</span>
                  <p className="text-sm text-[#142a30] leading-relaxed">{document.extractedData.summary.clinical_summary}</p>
                </div>
              )}

              {document.extractedData.summary?.overall_status && (
                <div className="flex items-center gap-3 bg-white border border-[#d1e2dc] p-3 rounded-lg">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#556e72]">Overall Status</span>
                  <span className={`text-sm font-bold capitalize ${document.extractedData.summary.overall_status === 'critical' ? 'text-red-600' :
                    document.extractedData.summary.overall_status === 'abnormal' ? 'text-orange-600' :
                      document.extractedData.summary.overall_status === 'normal' ? 'text-green-600' :
                        'text-[#0c5e5b]'
                    }`}>
                    {document.extractedData.summary.overall_status}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
