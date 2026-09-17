import { useState, useEffect } from "react";
import { FileText, HeartPulse, Clock3, Stethoscope, PencilLine, Eye, X, Save } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";

export function DoctorPatientRecords() {
  const [records, setRecords] = useState([]);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [previewSummary, setPreviewSummary] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("medikiosk_case_history");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        const historyArray = Array.isArray(parsedHistory) ? parsedHistory : [parsedHistory];
        
        const dynamicRecords = historyArray.map((caseItem) => ({
          id: caseItem.id || `CAS-${Math.floor(Math.random() * 10000)}`,
          initials: "PT",
          name: `Patient (${caseItem.id || "Unknown"})`,
          details: `Recorded: ${caseItem.displayDate || caseItem.dateFormatted || "N/A"}`,
          status: caseItem.status || "Completed",
          summary: caseItem.summary || caseItem.markdown || "No summary available.",
          notes: `Chief Complaint: ${caseItem.chiefComplaint || "None reported"}`,
          documents: caseItem.reportSummaries && caseItem.reportSummaries.length > 0
            ? caseItem.reportSummaries.map((doc, idx) => ({
                id: doc.id || `doc-${idx}`,
                time: caseItem.displayDate || caseItem.dateFormatted || "00:00",
                title: doc.fileName || `Uploaded Document ${idx + 1}`,
                description: doc.mimeType === "application/pdf" ? "PDF Document" : "Medical File",
                fileUrl: doc.fileUrl || doc.url,
                mimeType: doc.mimeType,
                status: doc.analysis?.overall_status || doc.overallStatus || doc.status || "review",
                summary: doc.analysis?.clinical_summary || doc.summary || "",
              }))
            : [
                {
                  id: 'default-doc',
                  time: caseItem.displayDate || caseItem.dateFormatted || "00:00",
                  title: "Pre-consultation form",
                  description: "Symptoms and general history submitted",
                  status: "Completed",
                  summary: "",
                }
              ]
        }));
        
        // Show newest records first
        setRecords(dynamicRecords.reverse());
      }
    } catch (error) {
      console.error("Error parsing medikiosk_case_history:", error);
    }
  }, []);

  const handleSummaryChange = (recordId, value) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId ? { ...record, summary: value } : record,
      ),
    );
  };

  const handleDocumentUpdate = (field, value) => {
    setSelectedDocument(current => 
      current ? { ...current, doc: { ...current.doc, [field]: value } } : current
    );
  };

  const handleSaveDocument = () => {
    if (selectedDocument) {
      setRecords((currentRecords) =>
        currentRecords.map((record) => {
          if (record.id === selectedDocument.recordId) {
            return {
              ...record,
              documents: record.documents.map((doc) => 
                doc.id === selectedDocument.doc.id ? selectedDocument.doc : doc
              )
            };
          }
          return record;
        })
      );
      setSelectedDocument(null);
    }
  };

  const openPreview = (record) => {
    setPreviewRecord(record);
    setPreviewSummary(record.summary);
  };

  const handleSavePreview = () => {
    if (previewRecord) {
      handleSummaryChange(previewRecord.id, previewSummary);
      setPreviewRecord(null);
    }
  };

  return (
    <DashboardLayout title="Patient Records">
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-2xs sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e2f2ef] text-[#0c5e5b]">
              <FileText className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
              <p className="mt-1 text-xs text-gray-500">Editable pre-consultation summaries and chronological document timeline.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {records.map((record) => (
            <article key={record.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e2f2ef] text-sm font-bold text-[#0c5e5b]">
                      {record.initials}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{record.name}</h2>
                      <p className="text-xs text-gray-500">{record.details}</p>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[0.7rem] font-semibold text-[#0c5e5b]">
                    <HeartPulse className="size-3.5" />
                    {record.status}
                  </span>
                </div>

                </div>

              <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                <div className="flex-1 p-5 sm:p-6 flex flex-col bg-[#f8faf9]/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#0c5e5b]">
                      <Stethoscope className="size-3.5" />
                      Editable summary
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreview(record)}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[0.65rem] font-medium text-[#0c5e5b] transition hover:bg-teal-100 cursor-pointer"
                        title="Edit Fullscreen"
                      >
                        <PencilLine className="size-3" />
                        Edit
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={record.summary}
                    onChange={(event) => handleSummaryChange(record.id, event.target.value)}
                    className="mt-4 flex-1 min-h-[200px] w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 shadow-sm outline-none transition focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#d9efeb]"
                  />

                  <p className="mt-3 text-xs leading-5 text-gray-500">{record.notes}</p>
                </div>

                <div className="flex-1 p-5 sm:p-6 bg-white">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#0c5e5b]" />
                    <h3 className="text-sm font-bold text-gray-900">Medical documents</h3>
                  </div>

                  <div className="relative mt-4 ml-1">
                    <div className="absolute left-[8px] top-1 bottom-1 w-px bg-gradient-to-b from-[#0c5e5b] via-[#69b0a8] to-[#dfeae8]" />

                    <div className="space-y-4">
                      {record.documents.map((document, idx) => (
                        <div key={`${record.id}-${document.time}-${document.title}`} className="relative flex gap-4">
                          <span
                            className={`relative z-10 mt-0.5 flex size-4 shrink-0 rounded-full border-2 border-white shadow-sm ${
                              idx === 0 ? "bg-[#0c5e5b] shadow-[0_0_0_4px_rgba(12,94,91,0.12)]" : "bg-[#51a9a1]"
                            }`}
                          />

                          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-gray-500">
                              <Clock3 className="size-3 text-gray-400" />
                              {document.time}
                            </span>
                            <div className="rounded-xl border border-gray-200 bg-[#f9fbfa] p-3">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setSelectedDocument({ recordId: record.id, doc: document })}
                                    className="text-xs font-semibold text-gray-800 hover:text-[#0c5e5b] transition text-left cursor-pointer"
                                  >
                                    {document.title}
                                  </button>
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium capitalize ${
                                    document.status === "critical" ? "bg-red-100 text-red-700" :
                                    document.status === "abnormal" ? "bg-amber-100 text-amber-800" :
                                    document.status === "normal" ? "bg-emerald-100 text-emerald-700" :
                                    "bg-teal-50 text-[#0c5e5b]"
                                  }`}>
                                    {document.status}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">{document.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {previewRecord && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewRecord(null)}
        >
          <div 
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900">Preview & Edit Summary - {previewRecord.name}</h2>
              <button 
                onClick={() => setPreviewRecord(null)} 
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5">
              <textarea
                value={previewSummary}
                onChange={(e) => setPreviewSummary(e.target.value)}
                rows={15}
                className="w-full resize-none rounded-xl border border-gray-200 bg-[#f9fbfa] px-4 py-3 text-sm leading-6 text-gray-800 shadow-sm outline-none transition focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#d9efeb]"
              />
            </div>
            <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50 p-5">
              <button 
                onClick={() => setPreviewRecord(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePreview}
                className="flex items-center gap-2 rounded-lg bg-[#0c5e5b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#094845] cursor-pointer"
              >
                <Save className="size-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div 
            className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold text-gray-800">{selectedDocument.doc.title}</h3>
               </div>
               <div className="flex-1 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center relative">
                  {selectedDocument.doc.fileUrl ? (
                      selectedDocument.doc.mimeType === "application/pdf" ? (
                          <iframe src={selectedDocument.doc.fileUrl} className="w-full h-full border-0" title={selectedDocument.doc.title} />
                      ) : (
                          <img src={selectedDocument.doc.fileUrl} alt={selectedDocument.doc.title} className="max-w-full max-h-full object-contain" />
                      )
                  ) : (
                     <div className="text-gray-400 flex flex-col items-center">
                       <FileText className="size-12 mb-2" />
                       <p>No preview available</p>
                     </div>
                  )}
               </div>
            </div>
            <div className="w-96 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h2 className="text-sm font-bold text-gray-900">Document Details</h2>
                <button 
                  onClick={() => setSelectedDocument(null)} 
                  className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1">Overall Status</label>
                   <select 
                     value={selectedDocument.doc.status || "review"}
                     onChange={(e) => handleDocumentUpdate("status", e.target.value)}
                     className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#0c5e5b] focus:ring-1 focus:ring-[#0c5e5b] capitalize"
                   >
                     <option value="review">Review</option>
                     <option value="normal">Normal</option>
                     <option value="abnormal">Abnormal</option>
                     <option value="critical">Critical</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1">Summary</label>
                   <textarea
                     value={selectedDocument.doc.summary || ""}
                     onChange={(e) => handleDocumentUpdate("summary", e.target.value)}
                     rows={10}
                     className="w-full resize-none rounded-lg border border-gray-200 bg-[#f9fbfa] px-3 py-2 text-sm leading-6 text-gray-800 shadow-sm outline-none transition focus:border-[#0c5e5b] focus:ring-1 focus:ring-[#0c5e5b]"
                     placeholder="Enter document summary..."
                   />
                 </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 p-4">
                <button 
                  onClick={() => setSelectedDocument(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDocument}
                  className="flex items-center gap-2 rounded-lg bg-[#0c5e5b] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#094845] cursor-pointer"
                >
                  <Save className="size-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DoctorPatientRecords;
