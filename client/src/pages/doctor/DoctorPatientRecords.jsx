import { useState, useEffect } from "react";
import { FileText, HeartPulse, Clock3, Stethoscope, PencilLine, Eye, X, Save } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";

export function DoctorPatientRecords() {
  const [records, setRecords] = useState([]);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [previewSummary, setPreviewSummary] = useState("");

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
                time: caseItem.displayDate?.split(',')[1]?.trim() || "00:00",
                title: doc.fileName || `Uploaded Document ${idx + 1}`,
                description: doc.mimeType === "application/pdf" ? "PDF Document" : "Medical File"
              }))
            : [
                {
                  time: caseItem.displayDate?.split(',')[1]?.trim() || "00:00",
                  title: "Pre-consultation form",
                  description: "Symptoms and general history submitted"
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

                <div className="mt-5 rounded-xl border border-teal-100 bg-[#f8faf9] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#0c5e5b]">
                      <Stethoscope className="size-3.5" />
                      Editable summary
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreview(record)}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[0.65rem] font-medium text-[#0c5e5b] transition hover:bg-teal-100 cursor-pointer"
                        title="Preview & Edit"
                      >
                        <Eye className="size-3" />
                        Preview
                      </button>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[0.65rem] font-medium text-[#0c5e5b] ring-1 ring-teal-100">
                        <PencilLine className="size-3" />
                        Draft
                      </span>
                    </div>
                  </div>

                  <textarea
                    value={record.summary}
                    onChange={(event) => handleSummaryChange(record.id, event.target.value)}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-700 shadow-sm outline-none transition focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#d9efeb]"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">{record.notes}</p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
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
                          className={`relative z-10 mt-1.5 flex size-4 shrink-0 rounded-full border-2 border-white shadow-sm ${
                            idx === 0 ? "bg-[#0c5e5b] shadow-[0_0_0_4px_rgba(12,94,91,0.12)]" : "bg-[#51a9a1]"
                          }`}
                        />

                        <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#f9fbfa] p-3">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <strong className="text-xs font-semibold text-gray-800">{document.title}</strong>
                            <span className="inline-flex items-center gap-1 text-[0.68rem] text-gray-400">
                              <Clock3 className="size-3" />
                              {document.time}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{document.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {previewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
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
    </DashboardLayout>
  );
}

export default DoctorPatientRecords;
