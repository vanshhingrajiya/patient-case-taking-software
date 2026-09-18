import { useState, useEffect, useMemo, useRef } from "react";
import { FileText, HeartPulse, Clock3, Stethoscope, PencilLine, Eye, X, Save, Activity, AlertTriangle, Pill, User, Users, History, Search, Calendar, ArrowDownUp } from "lucide-react";

const CustomSelect = ({ value, onChange, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative group z-20" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border pl-3 pr-8 py-2 shadow-xs transition-all cursor-pointer select-none ${
          isOpen
            ? "border-[#0c5e5b] bg-[#f7fcfb] ring-2 ring-[#0c5e5b]/20"
            : "border-gray-200 bg-white hover:border-[#0c5e5b]/40 hover:bg-[#f7fcfb]"
        }`}
      >
        {Icon && (
          <Icon
            className={`size-4 transition-colors ${
              isOpen ? "text-[#0c5e5b]" : "text-[#0c5e5b]/70 group-hover:text-[#0c5e5b]"
            }`}
          />
        )}
        <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
          {selectedOption.label}
        </span>
        <div
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0c5e5b]" : "text-gray-400 group-hover:text-[#0c5e5b]"
          }`}
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[140px] origin-top rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`cursor-pointer rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                value === option.value
                  ? "bg-[#e2f2ef] text-[#0c5e5b]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import { DashboardLayout } from "../../components/DashboardLayout";

function normalizeSummary(input) {
  let meta = null;
  let markdown = "";

  if (!input) return { meta: null, markdown: "" };

  if (typeof input === "object" && input !== null) {
    meta = input;
    markdown = typeof input.summary === "string" ? input.summary : (input.text || JSON.stringify(input));
  } else if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          meta = parsed;
          markdown = typeof parsed.summary === "string" ? parsed.summary : (parsed.text || trimmed);
        } else {
          markdown = trimmed;
        }
      } catch {
        markdown = trimmed;
      }
    } else {
      markdown = trimmed;
    }
  }

  if (markdown && markdown.includes("\\n") && !markdown.includes("\n")) {
    markdown = markdown.replace(/\\n/g, "\n");
  }

  return { meta, markdown };
}

function parseClinicalSummary(input) {
  const { markdown } = normalizeSummary(input);
  if (!markdown) return [];

  // Match Title (between ** and **) and Answer (everything after it until next ** or end of string)
  const regex = /\*\*([^*]+?)\*\*:?\s*([\s\S]*?)(?=(?:\*\*[^*]+?\*\*|$))/g;
  const sections = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    let rawTitle = (match[1] || "").trim().replace(/:+$/, "").trim();
    const rawAnswer = (match[2] || "").trim();

    if (!rawTitle && !rawAnswer) continue;

    const lines = rawAnswer
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const isList = lines.length > 0 && lines.every((l) => l.startsWith("-") || l.startsWith("*") || l.startsWith("•"));

    const listItems = isList
      ? lines.map((l) => {
        const clean = l.replace(/^[-*•]\s*/, "").trim();
        const colonIdx = clean.indexOf(":");
        if (colonIdx !== -1) {
          return {
            isKeyValue: true,
            key: clean.slice(0, colonIdx).trim(),
            value: clean.slice(colonIdx + 1).trim(),
            raw: clean,
          };
        }
        return {
          isKeyValue: false,
          key: "",
          value: clean,
          raw: clean,
        };
      })
      : [];

    const lowerAns = rawAnswer.toLowerCase();
    const isNoneOrNegative =
      lowerAns === "none" ||
      lowerAns === "none reported." ||
      lowerAns === "none reported" ||
      lowerAns === "nil" ||
      lowerAns.includes("no known drug allergies") ||
      lowerAns.includes("no significant");

    sections.push({
      title: rawTitle,
      answer: rawAnswer,
      isList,
      listItems,
      isNoneOrNegative,
    });
  }

  if (sections.length === 0 && markdown.trim()) {
    sections.push({
      title: "Clinical Summary",
      answer: markdown.trim(),
      isList: false,
      listItems: [],
      isNoneOrNegative: false,
    });
  }

  return sections;
}
export function DoctorPatientRecords() {
  const [records, setRecords] = useState([]);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [previewSummary, setPreviewSummary] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("medikiosk_case_history");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        const historyArray = Array.isArray(parsedHistory) ? parsedHistory : [parsedHistory];

        const dynamicRecords = historyArray.map((caseItem) => {
          const summary = caseItem.summary || caseItem.markdown || "No summary available.";
          return {
            id: caseItem.id || `CAS-${Math.floor(Math.random() * 10000)}`,
            timestamp: caseItem.timestamp || Date.now(),
            initials: "PT",
            name: `Patient (${caseItem.id || "Unknown"})`,
            details: `Recorded: ${caseItem.displayDate || caseItem.dateFormatted || "N/A"}`,
            status: caseItem.status || "Completed",
            summary: summary,
            sections: parseClinicalSummary(summary),
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
          };
        });

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
        record.id === recordId ? { ...record, summary: value, sections: parseClinicalSummary(value) } : record,
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

  const getSectionIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("chief complaint")) return <Stethoscope className="size-4 text-[#0c5e5b]" />;
    if (lower.includes("present illness") || lower.includes("hpi")) return <Activity className="size-4 text-emerald-600" />;
    if (lower.includes("allergy") || lower.includes("allergies")) return <AlertTriangle className="size-4 text-amber-600" />;
    if (lower.includes("medication")) return <Pill className="size-4 text-purple-600" />;
    if (lower.includes("social")) return <User className="size-4 text-teal-600" />;
    if (lower.includes("family")) return <Users className="size-4 text-blue-600" />;
    if (lower.includes("history") || lower.includes("pmh") || lower.includes("psh")) return <History className="size-4 text-indigo-600" />;
    return <FileText className="size-4 text-gray-600" />;
  };

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.name.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q)
      );
    }

    if (urgencyFilter !== "all") {
      result = result.filter(r => r.documents.some(d => d.status === urgencyFilter));
    }

    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter(r => {
        if (!r.timestamp) return true;
        const recordDate = new Date(r.timestamp);
        if (dateFilter === "today") {
          return recordDate.toDateString() === now.toDateString();
        } else if (dateFilter === "last7") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return recordDate >= sevenDaysAgo;
        }
        return true;
      });
    }

    if (sortBy === "oldest") {
      result.reverse();
    } else if (sortBy === "urgency") {
      const severityScores = { "critical": 4, "abnormal": 3, "review": 2, "normal": 1, "Completed": 0 };
      result.sort((a, b) => {
        const getScore = (record) => Math.max(0, ...record.documents.map(d => severityScores[d.status] || 0));
        return getScore(b) - getScore(a);
      });
    }

    return result;
  }, [records, searchQuery, urgencyFilter, dateFilter, sortBy]);

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

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Patient ID, Name, or Chief Complaint..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-[#0c5e5b] focus:bg-white focus:ring-1 focus:ring-[#0c5e5b]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
              <CustomSelect
                icon={AlertTriangle}
                value={urgencyFilter}
                onChange={setUrgencyFilter}
                options={[
                  { value: "all", label: "All Urgency" },
                  { value: "critical", label: "Critical" },
                  { value: "abnormal", label: "Abnormal" },
                  { value: "review", label: "Needs Review" },
                ]}
              />

              <CustomSelect
                icon={Calendar}
                value={dateFilter}
                onChange={setDateFilter}
                options={[
                  { value: "all", label: "All Dates" },
                  { value: "today", label: "Today" },
                  { value: "last7", label: "Last 7 Days" },
                ]}
              />

              <CustomSelect
                icon={ArrowDownUp}
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "urgency", label: "Highest Urgency" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {filteredRecords.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-2xs">
              <p className="text-sm font-medium text-gray-500">No records found matching your criteria.</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
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

                  <div className="mt-4 flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Chief Complaint Highlight */}
                    {(record.sections || parseClinicalSummary(record.summary))?.find((s) => s.title.toLowerCase().includes("chief complaint")) && (
                      <div className="rounded-2xl border-2 border-[#0c5e5b]/30 bg-gradient-to-r from-[#eef7f5] via-[#f7fcfb] to-[#eef7f5] p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-2 text-[#0c5e5b] font-bold text-xs uppercase tracking-wider mb-1.5">
                          <Stethoscope className="size-4" />
                          <span>Chief Complaint</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                          {(record.sections || parseClinicalSummary(record.summary)).find((s) => s.title.toLowerCase().includes("chief complaint"))?.answer}
                        </p>
                      </div>
                    )}

                    {/* HPI Card */}
                    {(record.sections || parseClinicalSummary(record.summary))?.find((s) => s.title.toLowerCase().includes("present illness") || s.title.toLowerCase().includes("hpi")) && (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                          <Activity className="size-4" />
                          <span>History of Present Illness (HPI)</span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-gray-800 font-normal">
                          {(record.sections || parseClinicalSummary(record.summary)).find((s) => s.title.toLowerCase().includes("present illness") || s.title.toLowerCase().includes("hpi"))?.answer}
                        </p>
                      </div>
                    )}

                    {/* Remaining Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(record.sections || parseClinicalSummary(record.summary))
                        .filter(
                          (s) =>
                            !s.title.toLowerCase().includes("chief complaint") &&
                            !s.title.toLowerCase().includes("present illness") &&
                            !s.title.toLowerCase().includes("hpi")
                        )
                        .map((sec, idx) => (
                          <div
                            key={idx}
                            className={`rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs flex flex-col justify-between ${sec.isList ? "md:col-span-2" : ""
                              }`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="grid size-6 place-items-center rounded-lg bg-gray-100 shrink-0">
                                  {getSectionIcon(sec.title)}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800">
                                  {sec.title}
                                </h4>
                              </div>

                              {sec.isList ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                  {sec.listItems.map((item, i) => {
                                    if (item.isKeyValue) {
                                      const valLower = item.value.toLowerCase();
                                      const isNeg =
                                        valLower === "no" ||
                                        valLower === "never" ||
                                        valLower === "none" ||
                                        valLower.includes("no significant");

                                      return (
                                        <div
                                          key={i}
                                          className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200/80 px-3 py-2 text-xs"
                                        >
                                          <span className="font-semibold text-gray-700">{item.key}</span>
                                          <span
                                            className={`rounded-md px-2 py-0.5 font-bold text-[11px] ${isNeg
                                              ? "bg-gray-200/80 text-gray-600"
                                              : "bg-[#e2f2ef] text-[#0c5e5b]"
                                              }`}
                                          >
                                            {item.value}
                                          </span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200/80 px-3 py-2 text-xs font-medium text-gray-800"
                                      >
                                        <span className="size-1.5 rounded-full bg-[#0c5e5b] shrink-0" />
                                        <span>{item.raw}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : sec.isNoneOrNegative ? (
                                <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                  <span className="size-2 rounded-full bg-gray-400" />
                                  <span>{sec.answer}</span>
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed text-gray-800 font-medium whitespace-pre-wrap">
                                  {sec.answer}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

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
                            className={`relative z-10 mt-0.5 flex size-4 shrink-0 rounded-full border-2 border-white shadow-sm ${idx === 0 ? "bg-[#0c5e5b] shadow-[0_0_0_4px_rgba(12,94,91,0.12)]" : "bg-[#51a9a1]"
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
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium capitalize ${document.status === "critical" ? "bg-red-100 text-red-700" :
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
          )))}
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
