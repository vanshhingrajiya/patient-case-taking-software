import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderClock,
  PlusCircle,
  Search,
  Calendar,
  User,
  Users,
  Stethoscope,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Pill,
  History,
  Eye,
  Copy,
  Check,
  Trash2,
  Languages,
  X,
  Clipboard,
  UploadCloud,
  LoaderCircle,
  FileSearch,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { summarizeCaseReport } from "../../services";

const LANGUAGE_NAMES = {
  "en-IN": "English",
  "hi-IN": "Hindi (हिन्दी)",
  "mr-IN": "Marathi (मराठी)",
  "ta-IN": "Tamil (தமிழ்)",
  "te-IN": "Telugu (తెలుగు)",
  "gu-IN": "Gujarati (ગુજરાતી)",
  "kn-IN": "Kannada (ಕನ್ನಡ)",
  "ml-IN": "Malayalam (മലയാളം)",
  "pa-IN": "Punjabi (ਪੰਜਾਬੀ)",
  "od-IN": "Odia (ଓଡ଼ିଆ)",
};

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

export function CaseHistory() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [modalViewMode, setModalViewMode] = useState("structured"); // "structured" | "raw"
  const [uploadingCaseId, setUploadingCaseId] = useState(null);
  const [reportError, setReportError] = useState("");

  // Load cases from localStorage on mount
  useEffect(() => {
    try {
      const rawStored = localStorage.getItem("medikiosk_case_history");
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCases(parsed);
          return;
        }
      }

      // Check single latest summary if history array is empty
      const singleRaw = localStorage.getItem("medikiosk_latest_summary");
      if (singleRaw) {
        const parsedSingle = JSON.parse(singleRaw);
        if (parsedSingle && parsedSingle.id) {
          setCases([parsedSingle]);
          return;
        }
      }

      setCases([]);
    } catch (e) {
      console.error("Error reading medikiosk_case_history:", e);
      setCases([]);
    }
  }, []);

  const handleCopySummary = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteCase = (caseId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this case from your local history?")) {
      return;
    }
    const updated = cases.filter((c) => c.id !== caseId);
    setCases(updated);
    try {
      localStorage.setItem("medikiosk_case_history", JSON.stringify(updated));
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error("Failed to update localStorage:", err);
    }
  };

  const handleClearAll = () => {
    if (!window.confirm("Are you sure you want to clear all stored patient case history?")) {
      return;
    }
    setCases([]);
    localStorage.removeItem("medikiosk_case_history");
    localStorage.removeItem("medikiosk_latest_summary");
    localStorage.removeItem("medikiosk_latest_summary_raw");
    setSelectedCase(null);
  };

  const handleReportUpload = async (event, caseItem) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setReportError("Choose a PDF, JPG, or PNG medical report.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setReportError("The report must be smaller than 10 MB.");
      return;
    }

    setReportError("");
    setUploadingCaseId(caseItem.id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseSummary", caseItem.markdown || caseItem.summary || "");
      const result = await summarizeCaseReport(formData);
      const report = { ...result.report, id: `${Date.now()}-${file.name}`, uploadedAt: new Date().toISOString() };
      const updatedCase = {
        ...caseItem,
        reportSummaries: [report, ...(caseItem.reportSummaries || [])],
      };
      const updatedCases = cases.map((item) => (item.id === caseItem.id ? updatedCase : item));
      setCases(updatedCases);
      setSelectedCase(updatedCase);
      localStorage.setItem("medikiosk_case_history", JSON.stringify(updatedCases));
    } catch (error) {
      setReportError(error.message || "Unable to analyze this report right now.");
    } finally {
      setUploadingCaseId(null);
    }
  };

  // Helper to extract case details for card preview
  const enhancedCases = useMemo(() => {
    return cases.map((item) => {
      const { markdown } = normalizeSummary(item);
      const sections = parseClinicalSummary(markdown);

      const ccSec = sections.find((s) => s.title.toLowerCase().includes("chief complaint"));
      const hpiSec = sections.find((s) => s.title.toLowerCase().includes("present illness") || s.title.toLowerCase().includes("hpi"));

      const chiefComplaint = ccSec?.answer || item.chiefComplaint || "Clinical Consultation";
      const hpiPreview = hpiSec?.answer || "";

      return {
        ...item,
        markdown,
        sections,
        chiefComplaint,
        hpiPreview,
        displayDate: item.dateFormatted || (item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN") : "Recent"),
        languageLabel: LANGUAGE_NAMES[item.language] || item.language || "English",
      };
    });
  }, [cases]);

  const filteredCases = enhancedCases.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (c.id && c.id.toLowerCase().includes(query)) ||
      (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(query)) ||
      (c.hpiPreview && c.hpiPreview.toLowerCase().includes(query)) ||
      (c.languageLabel && c.languageLabel.toLowerCase().includes(query)) ||
      (c.markdown && c.markdown.toLowerCase().includes(query))
    );
  });

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

  return (
    <DashboardLayout title="Case History">
      <div className="space-y-6">
        {/* Header Intro Banner */}
        <div className="rounded-3xl border border-[#bcded7] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e2f2ef] text-[#0c5e5b] shadow-xs shrink-0">
                <FolderClock className="size-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Case & Consultation History
                  </h1>
                  <span className="rounded-full bg-[#eef7f5] border border-[#bcded7] px-3 py-0.5 text-xs font-bold text-[#0c5e5b]">
                    {cases.length} {cases.length === 1 ? "Record" : "Records"}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Review your clinical intake summaries, symptom reports, and physician handoff records saved in local storage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {cases.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100/70 transition cursor-pointer"
                  title="Clear all saved cases"
                >
                  <Trash2 className="size-4" />
                  <span className="hidden sm:inline">Clear History</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/patient/new-case")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0c5e5b] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#084341] active:scale-95 transition cursor-pointer"
              >
                <PlusCircle className="size-4" />
                Start New Case
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past cases by ID, Chief Complaint, symptoms, or language…"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-[#0c5e5b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0c5e5b]/20 transition"
            />
          </div>
        </div>

        {/* Case List Table / Cards */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredCases.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#eef7f5] text-[#0c5e5b] mb-4">
                  <Clipboard className="size-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  {cases.length === 0 ? "No Case History Saved" : "No Matching Cases Found"}
                </h3>
                <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
                  {cases.length === 0
                    ? "Complete an intake session in 'Start New Case' to automatically generate and save structured clinical records here."
                    : "Try adjusting your search terms or clear the search filter to view your case records."}
                </p>
                {cases.length === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/patient/new-case")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0c5e5b] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#084341] cursor-pointer"
                  >
                    <PlusCircle className="size-4" />
                    Begin Intake Session
                  </button>
                )}
              </div>
            ) : (
              filteredCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="flex flex-col gap-4 p-5 sm:p-6 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0c5e5b] bg-[#eef7f5] border border-[#bcded7] rounded-md px-2 py-0.5">
                        {caseItem.id}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="size-3.5 text-gray-400" />
                        {caseItem.displayDate}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 border border-teal-200/80 rounded-md px-2 py-0.5 font-medium">
                        <Languages className="size-3 text-teal-600" />
                        {caseItem.languageLabel}
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {caseItem.status || "Completed"}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {caseItem.chiefComplaint}
                      </h2>
                      {caseItem.hpiPreview && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {caseItem.hpiPreview}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySummary(caseItem.id, caseItem.markdown);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition cursor-pointer"
                      title="Copy Clinical Summary"
                    >
                      {copiedId === caseItem.id ? (
                        <>
                          <Check className="size-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCase(caseItem)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0c5e5b] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#084341] active:scale-95 transition cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCase(caseItem.id, e)}
                      className="grid size-8 place-items-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Case Detail Modal */}
        {selectedCase && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto animate-fade-in"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden my-auto border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#bcded7] bg-gradient-to-r from-[#0c5e5b] to-[#084341] px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur shadow-inner shrink-0">
                    <Clipboard className="size-6 text-[#5eead4]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                        Clinical Intake Record
                      </h3>
                      <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-xs font-mono font-bold text-white tracking-wider">
                        {selectedCase.id}
                      </span>
                      <span className="rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                        <CheckCircle2 className="size-3 inline mr-1" />
                        {selectedCase.status || "Completed"}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mt-1">
                      {selectedCase.displayDate} • {selectedCase.languageLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-black/20 p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setModalViewMode("structured")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        modalViewMode === "structured"
                          ? "bg-white text-[#0c5e5b] shadow-xs"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Structured
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalViewMode("raw")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                        modalViewMode === "raw"
                          ? "bg-white text-[#0c5e5b] shadow-xs"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      Raw Text
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySummary(selectedCase.id, selectedCase.markdown)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#0c5e5b] shadow-sm hover:bg-[#e2f2ef] active:scale-95 transition cursor-pointer"
                  >
                    {copiedId === selectedCase.id ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCase(null)}
                    className="grid size-8 place-items-center rounded-xl bg-white/15 text-white hover:bg-white/25 transition cursor-pointer ml-1"
                    aria-label="Close modal"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-5 sm:p-7 flex-1">
                <section className="mb-5 rounded-2xl border border-[#bcded7] bg-[#f7fcfb] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0c5e5b]">
                        <FileSearch className="size-4" /> Report analysis
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">Upload a PDF or image report to extract its text and create a case-aware summary.</p>
                    </div>
                    <label className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0c5e5b] px-3.5 py-2.5 text-xs font-bold text-white transition ${uploadingCaseId === selectedCase.id ? "cursor-wait opacity-70" : "cursor-pointer hover:bg-[#084341]"}`}>
                      {uploadingCaseId === selectedCase.id ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                      {uploadingCaseId === selectedCase.id ? "Reading report…" : "Upload report"}
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        className="sr-only"
                        disabled={uploadingCaseId === selectedCase.id}
                        onChange={(event) => handleReportUpload(event, selectedCase)}
                      />
                    </label>
                  </div>
                  {reportError && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{reportError}</p>}
                  {selectedCase.reportSummaries?.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {selectedCase.reportSummaries.map((report) => (
                        <article key={report.id} className="rounded-xl border border-gray-200 bg-white p-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="flex items-center gap-2 text-xs font-bold text-gray-900"><FileText className="size-4 text-[#0c5e5b]" />{report.fileName}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${report.analysis?.overall_status === "critical" ? "bg-red-100 text-red-700" : report.analysis?.overall_status === "abnormal" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{report.analysis?.overall_status || "review"}</span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-gray-800">{report.analysis?.clinical_summary || "Report summary unavailable."}</p>
                          {report.analysis?.key_findings?.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-700">{report.analysis.key_findings.map((finding) => <li key={finding}>{finding}</li>)}</ul>}
                          <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-600"><span className="font-bold text-[#0c5e5b]">Case relevance:</span> {report.analysis?.case_relevance || "No direct relationship documented."}</p>
                          {report.analysis?.requires_review && <p className="mt-2 text-xs font-semibold text-amber-700">Some extracted information needs clinical verification.</p>}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
                {modalViewMode === "raw" ? (
                  <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-gray-800 bg-gray-50 border border-gray-200 rounded-2xl p-5 overflow-x-auto">
                    {selectedCase.markdown}
                  </pre>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Chief Complaint Highlight */}
                    {selectedCase.sections.find((s) => s.title.toLowerCase().includes("chief complaint")) && (
                      <div className="rounded-2xl border-2 border-[#0c5e5b]/30 bg-gradient-to-r from-[#eef7f5] via-[#f7fcfb] to-[#eef7f5] p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-2 text-[#0c5e5b] font-bold text-xs uppercase tracking-wider mb-1.5">
                          <Stethoscope className="size-4" />
                          <span>Chief Complaint</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                          {selectedCase.sections.find((s) => s.title.toLowerCase().includes("chief complaint"))?.answer}
                        </p>
                      </div>
                    )}

                    {/* HPI Card */}
                    {selectedCase.sections.find((s) => s.title.toLowerCase().includes("present illness") || s.title.toLowerCase().includes("hpi")) && (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
                          <Activity className="size-4" />
                          <span>History of Present Illness (HPI)</span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-gray-800 font-normal">
                          {selectedCase.sections.find((s) => s.title.toLowerCase().includes("present illness") || s.title.toLowerCase().includes("hpi"))?.answer}
                        </p>
                      </div>
                    )}

                    {/* Remaining Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCase.sections
                        .filter(
                          (s) =>
                            !s.title.toLowerCase().includes("chief complaint") &&
                            !s.title.toLowerCase().includes("present illness") &&
                            !s.title.toLowerCase().includes("hpi")
                        )
                        .map((sec, idx) => (
                          <div
                            key={idx}
                            className={`rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs flex flex-col justify-between ${
                              sec.isList ? "md:col-span-2" : ""
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
                                            className={`rounded-md px-2 py-0.5 font-bold text-[11px] ${
                                              isNeg
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
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                <span className="text-xs text-gray-500">
                  Thread ID: <code className="font-mono">{selectedCase.threadId || "N/A"}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="rounded-xl bg-[#0c5e5b] px-4 py-2 text-xs font-bold text-white hover:bg-[#084341] transition cursor-pointer"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CaseHistory;
