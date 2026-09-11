import { useEffect, useRef, useState } from "react";
import { Select } from "@base-ui/react/select";
import {
  Activity,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Copy,
  FileText,
  History,
  Loader2,
  Mic,
  Pill,
  RotateCcw,
  Send,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { BodyMap } from "../../components/medical/BodyMap";
const API = (import.meta.env.VITE_INTAKE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const CONVERSATION_LANGUAGES = [
  ["hi-IN", "हिन्दी"],
  ["en-IN", "English"],
  ["mr-IN", "मराठी"],
  ["ta-IN", "தமிழ்"],
  ["te-IN", "తెలుగు"],
  ["gu-IN", "ગુજરાતી"],
  ["kn-IN", "ಕನ್ನಡ"],
  ["ml-IN", "മലയാളം"],
  ["pa-IN", "ਪੰਜਾਬੀ"],
  ["od-IN", "ଓଡ଼ିଆ"],
];
const CONTEXT_TO_SARVAM_LANGUAGE = {
  en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN",
  te: "te-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN", or: "od-IN",
  as: "en-IN",
};

// Rotating accent set so option cards stay visually distinct at a glance —
// important for patients who can't rely on reading the label alone.
const CARD_ACCENTS = [
  { bg: "#eef7f5", border: "#bcded7", ink: "#0c5e5b" },
  { bg: "#fdf2e9", border: "#f3cfa1", ink: "#9a5b12" },
  { bg: "#eef2fb", border: "#c7d2f4", ink: "#3b4ea8" },
  { bg: "#fdeef1", border: "#f3c3cf", ink: "#a83b56" },
];

const BODY_MAP_TRIGGER_TEXTS = {
  en: {
    title: "Select where you feel the problem",
    subtitle: "Click to open interactive visual body map",
    badge: "Open Map",
  },
  hi: {
    title: "शरीर में समस्या की जगह चुनें (Body Map)",
    subtitle: "इंटरैक्टिव बॉडी मैप खोलने के लिए क्लिक करें",
    badge: "मैप खोलें",
  },
  bn: {
    title: "শরীরে সমস্যার স্থান নির্বাচন করুন (Body Map)",
    subtitle: "ইন্টারেক্টিভ বডি ম্যাপ খুলতে ক্লিক করুন",
    badge: "ম্যাপ খুলুন",
  },
  mr: {
    title: "शरीरावरील त्रासाची जागा निवडा (Body Map)",
    subtitle: "व्हिज्युअल बॉडी मॅप उघडण्यासाठी क्लिक करा",
    badge: "मॅप उघडा",
  },
  ta: {
    title: "உடலில் பிரச்சனை உள்ள இடத்தைத் தேர்ந்தெடுக்கவும் (Body Map)",
    subtitle: "உடல் வரைபடத்தைத் திறக்க கிளிக் செய்க",
    badge: "வரைபடம்",
  },
  te: {
    title: "శరీరంలో సమస్య ఉన్న భాగాన్ని ఎంచుకోండి (Body Map)",
    subtitle: "బాడీ మ్యాప్ తెరవడానికి క్లిక్ చేయండి",
    badge: "మ్యాప్ తెరవండి",
  },
  gu: {
    title: "શરીરમાં તકલીફવાળો ભાગ પસંદ કરો (Body Map)",
    subtitle: "બોડી મેપ ખોલવા માટે ક્લિક કરો",
    badge: "મેપ ખોલો",
  },
  kn: {
    title: "ದೇಹದಲ್ಲಿ ತೊಂದರೆ ಇರುವ ಜಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Body Map)",
    subtitle: "ದೇಹದ ನಕ್ಷೆ ತೆರೆಯಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    badge: "ನಕ್ಷೆ ತೆರೆಯಿರಿ",
  },
  ml: {
    title: "ശരീരത്തിൽ പ്രശ്നമുള്ള സ്ഥലം തിരഞ്ഞെടുക്കുക (Body Map)",
    subtitle: "ബോഡി മാപ്പ് തുറക്കാൻ ക്ലിക്ക് ചെയ്യുക",
    badge: "മാപ്പ് തുറക്കുക",
  },
  pa: {
    title: "ਸਰੀਰ ਵਿੱਚ ਤਕਲੀਫ਼ ਵਾਲੀ ਥਾਂ ਚੁਣੋ (Body Map)",
    subtitle: "ਬਾਡੀ ਮੈਪ ਖੋਲ੍ਹਣ ਲਈ ਕਲਿੱਕ ਕਰੋ",
    badge: "ਮੈਪ ਖੋਲ੍ਹੋ",
  },
  od: {
    title: "ଶରୀରରେ ସମସ୍ୟା ଥିବା ସ୍ଥାନ ବାଛନ୍ତୁ (Body Map)",
    subtitle: "ବଡି ମ୍ୟାପ୍ ଖୋଲିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ",
    badge: "ମ୍ୟାପ୍ ଖୋଲନ୍ତୁ",
  },
};

const ANALYZING_TEXTS = {
  en: { title: "Analyzing your response…", subtitle: "Reviewing symptoms and preparing your next clinical question" },
  hi: { title: "आपके उत्तर का विश्लेषण किया जा रहा है…", subtitle: "लक्षणों की समीक्षा और अगला प्रश्न तैयार किया जा रहा है" },
  mr: { title: "तुमच्या उत्तराचे विश्लेषण केले जात आहे…", subtitle: "लक्षणांचे पुनरावलोकन आणि पुढील प्रश्न तयार केला जात आहे" },
  ta: { title: "உங்கள் பதில் பகுப்பாய்வு செய்யப்படுகிறது…", subtitle: "அறிகுறிகள் மதிப்பாய்வு செய்யப்படுகின்றன" },
  te: { title: "మీ సమాధానాన్ని విశ్లేషిస్తున్నాము…", subtitle: "లక్షణాలను పరిశీలించి తదుపరి ప్రశ్నను సిద్ధం చేస్తున్నాము" },
  gu: { title: "તમારા જવાબનું વિશ્લેષણ થઈ રહ્યું છે…", subtitle: "લક્ષણોની સમીક્ષા અને આગામી પ્રશ્ન તૈયાર થઈ રહ્યો છે" },
  kn: { title: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…", subtitle: "ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮುಂದಿನ ಪ್ರಶ್ನೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ" },
  ml: { title: "നിങ്ങളുടെ ഉത്തരം വിശകലനം ചെയ്യുന്നു…", subtitle: "ലക്ഷണങ്ങൾ പരിശോധിച്ച് അടുത്ത ചോദ്യം തയ്യാറാക്കുന്നു" },
  pa: { title: "ਤੁਹਾਡੇ ਜਵਾਬ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…", subtitle: "ਲੱਛਣਾਂ ਦੀ ਸਮੀਖਿਆ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ" },
  od: { title: "ଆପଣଙ୍କ ଉତ୍ତରର ବିଶ୍ଳେଷଣ ଚାଲିଛି…", subtitle: "ଲକ୍ଷଣଗୁଡ଼ିକର ସମୀକ୍ଷା ଚାଲିଛି" },
};

function VoiceWave({ active }) {
  if (!active) return null;
  return (
    <span className="voicewave" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((bar) => <i key={bar} style={{ animationDelay: `${bar * 0.12}s` }} />)}
    </span>
  );
}

function parseSse(raw) {
  const lines = raw.split(/\r?\n/);
  const event = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
  const payload = lines.filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
  if (!event || !payload) return null;
  try { return { event, data: JSON.parse(payload) }; } catch { return { event, data: payload }; }
}

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

  // Handle escaped newlines if present
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
    let rawTitle = (match[1] || "").trim();
    // Strip any trailing colons that were inside the ** **
    rawTitle = rawTitle.replace(/:+$/, "").trim();
    const rawAnswer = (match[2] || "").trim();

    if (!rawTitle && !rawAnswer) continue;

    // Check if the answer consists of list/bullet items (e.g. - Tobacco: Never)
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

  // Fallback if no **Title** markdown pattern matched
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

function saveSummaryToStorage(summaryInput, currentThreadId, lang) {
  if (!summaryInput) return;
  try {
    const { meta, markdown } = normalizeSummary(summaryInput);
    const summaryData = {
      id: meta?.id || `CAS-${Date.now().toString().slice(-6)}`,
      threadId: meta?.threadId || currentThreadId || `TH-${Date.now()}`,
      timestamp: meta?.timestamp || new Date().toISOString(),
      dateFormatted: meta?.dateFormatted || new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      language: meta?.language || lang || "en-IN",
      summary: markdown,
      status: meta?.status || "Completed",
    };
    // 1. Save latest summary directly
    localStorage.setItem("medikiosk_latest_summary", JSON.stringify(summaryData));
    localStorage.setItem("medikiosk_latest_summary_raw", markdown);

    // 2. Append/update in patient case history
    const existing = JSON.parse(localStorage.getItem("medikiosk_case_history") || "[]");
    const updated = [summaryData, ...existing.filter((item) => item.threadId !== summaryData.threadId && item.id !== summaryData.id)];
    localStorage.setItem("medikiosk_case_history", JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.error("Failed to save clinical summary to localStorage:", err);
  }
}

function ClinicalSummaryCard({ summary, copied, onCopy }) {
  const [viewMode, setViewMode] = useState("structured"); // "structured" | "raw"
  const { meta, markdown } = normalizeSummary(summary);
  const sections = parseClinicalSummary(markdown);

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

  // Extract Chief Complaint and HPI separately if present for top highlighted presentation
  const chiefComplaintSec = sections.find((s) => s.title.toLowerCase().includes("chief complaint"));
  const hpiSec = sections.find((s) => s.title.toLowerCase().includes("present illness") || s.title.toLowerCase().includes("hpi"));

  // Categorize remaining sections
  const otherSections = sections.filter(
    (s) => s !== chiefComplaintSec && s !== hpiSec
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-[#bcded7] bg-white shadow-xl transition-all animate-fade-in">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#bcded7] bg-gradient-to-r from-[#0c5e5b] to-[#084341] px-6 py-5 text-white">
        <div className="flex items-center gap-3.5">
          <div className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur shadow-inner shrink-0">
            <Clipboard className="size-6 text-[#5eead4]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                Clinical Intake Summary
              </h3>
              {meta?.id && (
                <span className="rounded-lg bg-white/20 px-2.5 py-0.5 text-xs font-mono font-bold text-white tracking-wider">
                  {meta.id}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                <CheckCircle2 className="size-3" /> Saved Locally
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1">
              {meta?.dateFormatted ? `Completed on ${meta.dateFormatted}` : "Structured clinical report ready for physician review"}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl bg-black/20 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("structured")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${viewMode === "structured"
                  ? "bg-white text-[#0c5e5b] shadow-xs"
                  : "text-white/80 hover:text-white"
                }`}
            >
              Structured
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${viewMode === "raw"
                  ? "bg-white text-[#0c5e5b] shadow-xs"
                  : "text-white/80 hover:text-white"
                }`}
            >
              Raw Text
            </button>
          </div>

          <button
            type="button"
            onClick={() => onCopy(markdown)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#0c5e5b] shadow-sm hover:bg-[#e2f2ef] active:scale-95 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Content Body */}
      {viewMode === "raw" ? (
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-gray-800 bg-gray-50 border border-gray-200 rounded-2xl p-5 overflow-x-auto">
            {markdown}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col p-5 sm:p-7 gap-5">
          {/* A. Prominent Chief Complaint Card */}
          {chiefComplaintSec && (
            <div className="rounded-2xl border-2 border-[#0c5e5b]/30 bg-gradient-to-r from-[#eef7f5] via-[#f7fcfb] to-[#eef7f5] p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#0c5e5b] font-bold text-xs uppercase tracking-wider mb-1.5">
                <Stethoscope className="size-4" />
                <span>{chiefComplaintSec.title}</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {chiefComplaintSec.answer}
              </p>
            </div>
          )}

          {/* B. History of Present Illness (HPI) Card */}
          {hpiSec && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2.5">
                <Activity className="size-4" />
                <span>{hpiSec.title}</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-gray-800 font-normal">
                {hpiSec.answer}
              </p>
            </div>
          )}

          {/* C. Other Sections (Grid / List presentation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherSections.map((sec, idx) => {
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between ${sec.isList ? "md:col-span-2" : ""
                    }`}
                >
                  <div>
                    {/* Section Header (Title bw ** **) */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="grid size-7 place-items-center rounded-lg bg-gray-100 shrink-0">
                        {getSectionIcon(sec.title)}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800">
                        {sec.title}
                      </h4>
                    </div>

                    {/* Section Answer */}
                    {sec.isList ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
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
                                className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200/80 px-3.5 py-2.5 text-xs transition hover:bg-gray-100/70"
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
                              className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200/80 px-3.5 py-2.5 text-xs font-medium text-gray-800"
                            >
                              <span className="size-1.5 rounded-full bg-[#0c5e5b] shrink-0" />
                              <span>{item.raw}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : sec.isNoneOrNegative ? (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600">
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function extractQuestion(buffer) {
  const match = buffer.match(/"question"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)/);
  return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\") : null;
}

function OptionIcon({ icon }) {
  if (!icon) return null;

  // Only render SVG strings
  if (typeof icon !== "string" || !icon.trim().startsWith("<svg")) {
    return null;
  }

  return (
    <span
      className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/70"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  );
}

export function NewCase() {
  const { currentLanguage } = useLanguage();
  const [conversationLanguage, setConversationLanguage] = useState(
    () => CONTEXT_TO_SARVAM_LANGUAGE[currentLanguage] || "hi-IN",
  );
  const [online, setOnline] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [threadId, setThreadId] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamText, setStreamText] = useState("");
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle"); // idle | recording | transcribing | ready
  const [showBodyMap, setShowBodyMap] = useState(false);
  const audioRef = useRef(null);
  const recorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamBufferRef = useRef("");
  const inputRef = useRef(null);

  const checkHealth = async () => {
    setOnline(null);
    try { const response = await fetch(`${API}/`); setOnline(response.ok); } catch { setOnline(false); }
  };
  useEffect(() => { const timer = setTimeout(checkHealth, 0); return () => clearTimeout(timer); }, []);
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);
  useEffect(() => {
    if (threadId || streaming) return undefined;
    const timer = setTimeout(() => setConversationLanguage(CONTEXT_TO_SARVAM_LANGUAGE[currentLanguage] || "hi-IN"), 0);
    return () => clearTimeout(timer);
  }, [currentLanguage, streaming, threadId]);

  const speak = async (text, languageCode = conversationLanguage) => {
    if (!autoSpeak || !text?.trim()) return;
    try {
      const response = await fetch(`${API}/api/sarvam/tts`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), target_language_code: languageCode, speaker: "ritu", model: "bulbul:v3" }),
      });
      if (!response.ok) return;
      if (audioRef.current) audioRef.current.pause();
      const url = URL.createObjectURL(await response.blob());
      const player = new Audio(url);
      player.onended = () => URL.revokeObjectURL(url);
      audioRef.current = player;
      await player.play();
    } catch { /* Voice playback is optional to the clinical intake. */ }
  };

  const handleEvent = ({ event, data }) => {
    if (event === "session") setThreadId(data.thread_id);
    if (event === "token") {
      const token = String(data);
      streamBufferRef.current += token;
      const question = extractQuestion(streamBufferRef.current);
      if (question !== null) setStreamText(question);
      else if (!streamBufferRef.current.trim().startsWith("{") && !streamBufferRef.current.trim().startsWith("```")) setStreamText(streamBufferRef.current);
    }
    if (event === "question") {
      const question = data.question || "Please answer the next question.";
      const questionLanguageCode = conversationLanguage;
      setMessages((previous) => [...previous, { role: "doctor", text: question, field: data.field, languageCode: questionLanguageCode }]);
      setActiveQuestion({ ...data, languageCode: questionLanguageCode });
      setStreamText("");
      speak(question, questionLanguageCode);
    }
    if (event === "summary") {
      const summaryText = typeof data === "string" ? data : JSON.stringify(data);
      setSummary(summaryText);
      setShowSummary(true);
      setStreamText("");
      saveSummaryToStorage(summaryText, data?.thread_id || threadId, conversationLanguage);
    }
    if (event === "complete") { setActiveQuestion(null); setMessages((previous) => [...previous, { role: "system", text: "Intake completed. Your summary is ready below." }]); }
    if (event === "error") throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  };

  const readStream = async (path, body) => {
    setStreaming(true); setError(""); streamBufferRef.current = "";
    try {
      const response = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok || !response.body) { const detail = await response.json().catch(() => ({})); throw new Error(detail.detail || `Server returned ${response.status}`); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const frames = buffer.split("\n\n"); buffer = frames.pop();
        frames.forEach((frame) => { const parsed = parseSse(frame); if (parsed) handleEvent(parsed); });
        if (done) break;
      }
      if (buffer.trim()) { const parsed = parseSse(buffer); if (parsed) handleEvent(parsed); }
    } catch (requestError) { setError(requestError.message || "Unable to communicate with the intake service."); }
    finally { setStreaming(false); }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch { /* ignore */ }
    }
  };

  const startIntake = () => {
    stopSpeaking();
    setThreadId(null);
    const selectedLanguage = CONVERSATION_LANGUAGES.find(([code]) => code === conversationLanguage)?.[1] || "Hindi";
    setMessages([{ role: "system", text: `Starting clinical intake in ${selectedLanguage}.` }]);
    setActiveQuestion(null); setSummary(""); setShowSummary(false);
    readStream("/intake/start", { language: conversationLanguage });
  };

  const submitAnswer = (value, label = value) => {
    if (!threadId || !value?.trim() || streaming) return;
    stopSpeaking();
    setShowBodyMap(false);
    setMessages((previous) => [...previous, { role: "patient", text: label }]);
    setAnswer(""); setActiveQuestion(null); setStreamText("Analyzing answer...");
    setVoiceStatus("idle");
    readStream(`/intake/${threadId}/answer`, { answer: value, language: conversationLanguage });
  };

  const sendTranscription = async (blob) => {
    setStreaming(true); setError(""); setVoiceStatus("transcribing");
    try {
      const form = new FormData();
      form.append("file", blob, "patient_voice.wav");
      form.append("language_code", conversationLanguage);
      const response = await fetch(`${API}/api/sarvam/stt`, { method: "POST", body: form });
      const rawResponse = await response.text();
      if (!response.ok) {
        let errorMessage = "Voice transcription failed.";
        try { const errorData = JSON.parse(rawResponse); errorMessage = errorData?.detail || errorData?.error?.message || errorData?.message || errorMessage; }
        catch { if (rawResponse) errorMessage = rawResponse; }
        throw new Error(errorMessage);
      }
      const data = JSON.parse(rawResponse);
      const transcript = data?.transcript || "";
      if (!transcript.trim()) { setError("Could not recognize audio. Please try again or type your answer."); setVoiceStatus("idle"); return; }
      // Fill the answer box but do NOT auto-submit — the patient must confirm with Send.
      setAnswer(transcript.trim());
      setVoiceStatus("ready");
      inputRef.current?.focus();
    } catch (requestError) {
      setError(requestError?.message || "Voice transcription failed. Please try again.");
      setVoiceStatus("idle");
    } finally { setStreaming(false); }
  };

  const toggleRecording = async () => {
    stopSpeaking();
    if (recording) { recorderRef.current?.stop(); return; }
    try {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia) { setError("Audio recording is not supported by this browser or origin. HTTPS or localhost is required."); return; }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(mediaStream);
      recorderRef.current = recorder; audioChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data?.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        mediaStream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        if (audioBlob.size === 0) { setError("No audio was recorded. Please try again."); setVoiceStatus("idle"); return; }
        await sendTranscription(audioBlob);
      };
      recorder.onerror = () => { mediaStream.getTracks().forEach((track) => track.stop()); setRecording(false); setVoiceStatus("idle"); setError("Unable to record audio."); };
      recorder.start(); setRecording(true); setVoiceStatus("recording");
    } catch (mediaError) {
      setError(mediaError?.name === "NotAllowedError" ? "Microphone permission was denied. Please allow microphone access." : mediaError?.message || "Microphone permission is required for voice input.");
    }
  };

  const reset = () => { stopSpeaking(); setThreadId(null); setMessages([]); setActiveQuestion(null); setAnswer(""); setStreamText(""); setSummary(""); setShowSummary(false); setError(""); setStreaming(false); setVoiceStatus("idle"); setShowBodyMap(false); };
  const copySummary = () => {
    if (!summary) return;
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentQuestionText = activeQuestion ? (messages.filter((m) => m.role === "doctor").at(-1)?.text || "") : "";
  const voiceHint = { idle: "Tap the mic and speak your answer", recording: "Listening… tap the mic again to stop", transcribing: "Converting your voice to text…", ready: "Check your answer, then tap Send" }[voiceStatus];
  const langKey = conversationLanguage ? conversationLanguage.split("-")[0].toLowerCase() : "en";
  const normalizedLangKey = langKey === "or" ? "od" : langKey;
  const triggerText = BODY_MAP_TRIGGER_TEXTS[normalizedLangKey] || BODY_MAP_TRIGGER_TEXTS.en;

  const isChiefComplaint =
    activeQuestion?.field === "chief_complaint" ||
    (!activeQuestion?.field &&
      activeQuestion?.options?.length > 0 &&
      messages.filter((m) => m.role === "doctor").length <= 1);

  const analyzingInfo = ANALYZING_TEXTS[normalizedLangKey] || ANALYZING_TEXTS.en;

  return (
    <div className="notranslate min-h-screen flex flex-col bg-gradient-to-b from-[#f2f9f7] to-white" translate="no">
      <style>{`
        @keyframes voicewave-bar { 0%, 100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }
        @keyframes mic-pulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.45); } 70% { box-shadow: 0 0 0 20px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }
        @keyframes send-pulse { 0% { box-shadow: 0 0 0 0 rgba(12,94,91,0.5); } 70% { box-shadow: 0 0 0 14px rgba(12,94,91,0); } 100% { box-shadow: 0 0 0 0 rgba(12,94,91,0); } }
        @keyframes shimmer-slide { 0% { transform: translateX(-150%); } 100% { transform: translateX(250%); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .voicewave { display: inline-flex; align-items: center; gap: 3px; height: 18px; }
        .voicewave i { width: 3px; height: 100%; background: currentColor; border-radius: 2px; animation: voicewave-bar 0.9s ease-in-out infinite; transform-origin: center; }
        .mic-active { animation: mic-pulse 1.6s ease-out infinite; }
        .send-ready { animation: send-pulse 1.4s ease-out infinite; }
        .animate-shimmer { animation: shimmer-slide 1.8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>

      {/* 1. Full-Width Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 px-4 py-3.5 shadow-xs backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#0c5e5b] text-white shadow-sm">
              <Bot className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">MediKiosk Intake</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${online === true ? "text-emerald-600" : online === false ? "text-red-600" : "text-amber-600"}`}>
                <i className={`size-1.5 rounded-full ${online === true ? "bg-emerald-500" : online === false ? "bg-red-500" : "bg-amber-500"}`} />
                {online === true ? "Connected" : online === false ? "Offline" : "Checking"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={autoSpeak ? "Turn voice off" : "Turn voice on"}
              onClick={() => {
                setAutoSpeak((enabled) => !enabled);
                stopSpeaking();
              }}
              className={`grid size-10 place-items-center rounded-lg border transition cursor-pointer ${autoSpeak ? "border-[#0c5e5b] bg-[#e2f2ef] text-[#0c5e5b]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {autoSpeak ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </button>
            <button
              type="button"
              aria-label="Show conversation history"
              onClick={() => setShowHistory((open) => !open)}
              className={`grid size-10 place-items-center rounded-lg border transition cursor-pointer ${showHistory ? "border-[#0c5e5b] bg-[#e2f2ef] text-[#0c5e5b]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              <History className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Reset session"
              onClick={reset}
              className="grid size-10 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 transition cursor-pointer"
            >
              <RotateCcw className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Broad Main Content Container */}
      <main className={`mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 ${activeQuestion ? "pb-36 sm:pb-40" : "pb-12"}`}>
        {showHistory && messages.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Conversation</span>
              <span className="text-xs text-gray-400">{messages.length} messages</span>
            </div>
            <div className="max-h-64 flex flex-col gap-5 overflow-y-auto p-4 my-2">
              {messages.map((message, index) => {
                if (message.role === "system") {
                  return (
                    <p key={`${message.role}-${index}`} className="rounded-full bg-sky-50 px-3 py-1.5 text-center text-xs font-medium text-sky-700">
                      {message.text}
                    </p>
                  );
                }
                const isPatient = message.role === "patient";
                return (
                  <div key={`${message.role}-${index}`} className={`flex items-end gap-2 ${isPatient ? "flex-row-reverse" : ""}`}>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full ${isPatient ? "bg-[#0c5e5b] text-white" : "bg-[#e2f2ef] text-[#0c5e5b]"}`}>
                      {isPatient ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                    </span>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${isPatient ? "rounded-br-sm bg-[#0c5e5b] text-white" : "rounded-bl-sm bg-gray-100 text-gray-800"}`}>
                      {!isPatient && message.field && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0c5e5b]">{message.field}</p>}
                      {message.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start screen */}
        {!threadId && !streaming && messages.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <Bot className="mx-auto size-12 text-[#0c5e5b]" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Start your intake</h2>
            <p className="mt-1 text-sm text-gray-600">Your selected language will be used for the whole conversation.</p>
            <Select.Root
              items={CONVERSATION_LANGUAGES.map(([value, label]) => ({ value, label }))}
              value={conversationLanguage}
              onValueChange={setConversationLanguage}
            >
              <Select.Label className="mt-6 block text-left text-sm font-bold text-gray-800">Conversation language</Select.Label>
              <Select.Trigger className="mt-2 flex h-12 w-full items-center justify-between rounded-lg border border-[#bcded7] bg-[#eef7f5] px-4 text-left text-base font-semibold text-[#143840] outline-none transition hover:border-[#0c5e5b] focus-visible:ring-2 focus-visible:ring-[#0c5e5b]/25">
                <Select.Value />
                <Select.Icon><ChevronDown className="size-5 text-[#0c5e5b]" /></Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner sideOffset={6} className="notranslate z-50 min-w-[var(--anchor-width)] outline-none" translate="no">
                  <Select.Popup className="notranslate overflow-hidden rounded-lg border border-[#bcded7] bg-white p-1 shadow-xl" translate="no">
                    <Select.List className="max-h-64 overflow-y-auto">
                      {CONVERSATION_LANGUAGES.map(([value, label]) => (
                        <Select.Item key={value} value={value} className="grid cursor-pointer grid-cols-[1.25rem_1fr] items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 outline-none data-highlighted:bg-[#e2f2ef] data-highlighted:text-[#0c5e5b]">
                          <Select.ItemIndicator><Check className="size-4" /></Select.ItemIndicator>
                          <Select.ItemText>{label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
            <button type="button" onClick={startIntake} className="mt-6 w-full rounded-full bg-[#0c5e5b] py-4 text-base font-bold text-white shadow-md hover:bg-[#084341] cursor-pointer">
              Start New Case
            </button>
          </div>
        )}

        {/* 1. Question hero / AI Analyzing state, always on top */}
        {(activeQuestion || streaming) && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c5e5b] via-[#0d6864] to-[#07413f] p-6 sm:p-7 text-white shadow-xl transition-all">
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-10 size-40 rounded-full bg-[#2dd4bf]/15 blur-lg" />

            {streaming && !activeQuestion ? (
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 py-1 sm:py-2">
                {/* Glowing AI Icon Badge */}
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-emerald-300 opacity-70 blur-sm animate-pulse" />
                  <div className="relative grid size-14 sm:size-16 place-items-center rounded-2xl bg-white/15 border border-white/30 shadow-inner backdrop-blur-md">
                    <Sparkles className="size-7 sm:size-8 text-[#5eead4] animate-spin-slow" />
                  </div>
                </div>

                {/* Text & Dynamic Progress Section */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm border border-white/10 mb-2">
                    <span className="size-2 rounded-full bg-[#5eead4] animate-ping" />
                    <span>AI Clinical Assessment</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                    {streamText === "Analyzing answer..." ? analyzingInfo.title : streamText || analyzingInfo.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-white/80 leading-relaxed">
                    {analyzingInfo.subtitle}
                  </p>

                  {/* Animated Clinical Shimmer Progress Bar */}
                  <div className="relative mt-3.5 h-2 w-full max-w-md overflow-hidden rounded-full bg-black/25 border border-white/10">
                    <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#5eead4] to-white animate-shimmer" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">{activeQuestion?.field || "Question"}</span>
                <p className="mt-2 text-2xl sm:text-3xl font-bold leading-snug">{currentQuestionText}</p>
                <button type="button" aria-label="Play question again" onClick={() => speak(currentQuestionText, activeQuestion?.languageCode)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition cursor-pointer">
                  <Volume2 className="size-4" /> Hear again
                </button>
              </>
            )}
          </div>
        )}

        {/* Body Map Modal Trigger - Specifically for Chief Complaint */}
        {isChiefComplaint && activeQuestion && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={streaming}
              onClick={() => setShowBodyMap(true)}
              className="group flex min-h-[4.75rem] items-center justify-between gap-4 rounded-2xl border-2 border-[#0c5e5b] bg-[#eef7f5] px-5 py-4 text-left shadow-sm transition hover:bg-[#e2f2ef] hover:shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#0c5e5b] text-white shadow-sm text-2xl transition-transform group-hover:scale-105"
                  aria-hidden="true"
                >
                  🧍
                </span>
                <div>
                  <span className="block text-base font-bold text-gray-900 sm:text-lg leading-snug">
                    {triggerText.title}
                  </span>
                  <span className="block text-xs font-semibold text-[#0c5e5b]">
                    {triggerText.subtitle}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#0c5e5b] px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-[#084341]">
                {triggerText.badge}
              </span>
            </button>
          </div>
        )}

        {/* 2. Options as large, easy-to-read cards */}
        {activeQuestion?.options?.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeQuestion.options.map((option, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

              return (
                <button
                  key={`${option.label}-${option.value}`}
                  type="button"
                  disabled={streaming}
                  onClick={() => submitAnswer(option.value, option.label)}
                  style={{
                    backgroundColor: accent.bg,
                    borderColor: accent.border,
                    color: accent.ink,
                  }}
                  className="flex min-h-[5.5rem] items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {/* SVG icon from AI response */}
                  <OptionIcon icon={option.icon} />

                  {/* Label */}
                  <span className="min-w-0 flex-1 text-lg font-bold leading-snug">
                    {option.label}
                  </span>

                  {/* Speak option */}
                  <span
                    role="button"
                    aria-label={`Hear "${option.label}"`}
                    onClick={(event) => {
                      event.stopPropagation();
                      speak(option.label, activeQuestion?.languageCode);
                    }}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-white/70 cursor-pointer"
                  >
                    <Volume2 className="size-4" />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {summary && (
          <ClinicalSummaryCard
            summary={summary}
            copied={copied}
            onCopy={copySummary}
          />
        )}
      </main>

      {/* 3. Fixed Bottom Input Area */}
      {activeQuestion && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/90 bg-white/95 px-4 py-3 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto max-w-4xl">
            <p className={`mb-2 text-center text-xs sm:text-sm font-semibold truncate ${voiceStatus === "ready" ? "text-[#0c5e5b]" : voiceStatus === "recording" ? "text-red-600" : "text-gray-500"}`}>
              {voiceHint}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={streaming && voiceStatus !== "recording"}
                aria-label={recording ? "Stop recording" : "Speak your answer"}
                onClick={toggleRecording}
                className={`relative grid size-12 sm:size-14 shrink-0 place-items-center rounded-full transition-colors cursor-pointer disabled:opacity-40 ${recording ? "mic-active bg-red-600 text-white" : "bg-[#e2f2ef] text-[#0c5e5b] hover:bg-[#d3ece6]"}`}
              >
                {recording ? <VoiceWave active /> : voiceStatus === "transcribing" ? <Loader2 className="size-5 animate-spin" /> : <Mic className="size-5 sm:size-6" />}
              </button>
              <input
                ref={inputRef}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={streaming && voiceStatus !== "ready"}
                placeholder="Type your answer…"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitAnswer(answer);
                  }
                }}
                className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base outline-none focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#0c5e5b]/20 disabled:bg-gray-100 shadow-xs"
              />
              <button
                type="button"
                onClick={() => submitAnswer(answer)}
                disabled={streaming || !answer.trim()}
                aria-label="Send answer"
                className={`grid size-12 sm:size-14 shrink-0 place-items-center rounded-full text-white transition disabled:opacity-40 cursor-pointer ${voiceStatus === "ready" && answer.trim() ? "send-ready bg-[#0c5e5b]" : "bg-[#0c5e5b] hover:bg-[#084341]"}`}
              >
                {voiceStatus === "ready" ? <Check className="size-5 sm:size-6" /> : <Send className="size-4 sm:size-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable BodyMap Modal Component */}
      <BodyMap
        open={showBodyMap}
        onClose={() => setShowBodyMap(false)}
        onSelect={(part) => {
          setShowBodyMap(false);
          submitAnswer(part.value, part.label);
        }}
        language={conversationLanguage}
      />
    </div>
  );
}

export default NewCase;
