import { AlertCircle, FileText, Pill, Activity, Calendar } from "lucide-react";
import { TranslatedText } from "../../../components/common/TranslatedText";

const timelineEvents = [
  {
    id: 1,
    date: "August 2024",
    type: "prescription",
    title: "General Physician Visit",
    doctor: "Dr. Gupta",
    icon: Pill,
    items: [
      { name: "Amoxyclav 625mg", dose: "1 tab tid x 5 days", verified: true },
      { name: "Paracetamol 500mg", dose: "1 tab sos", verified: true }
    ],
    alerts: []
  },
  {
    id: 2,
    date: "August 12, 2024",
    type: "lab",
    title: "Complete Blood Count & Sugar",
    doctor: "Apollo Diagnostics",
    icon: Activity,
    items: [
      { name: "Hemoglobin", value: "14.2 g/dL", range: "13.8-17.2", abnormal: false },
      { name: "Fasting Blood Sugar", value: "126 mg/dL", range: "70-100", abnormal: true }
    ],
    alerts: ["High Fasting Blood Sugar detected. Recommend physician review."]
  }
];

export function MockTimeline({ onReset }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e2f2ef] text-[#0c5e5b]">
            <Calendar className="size-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              <TranslatedText text="Your Medical Timeline" />
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              <TranslatedText text="All documents successfully extracted, verified, and organized chronologically." />
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Upload More
        </button>
      </div>

      <div className="relative pl-4 sm:pl-6">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gray-200 sm:left-[35px]"></div>

        <div className="space-y-10">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative flex gap-6">
              {/* Node */}
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#e2f2ef] text-[#0c5e5b] shadow-sm sm:size-12">
                <event.icon className="size-5 sm:size-6" />
              </div>

              {/* Content Card */}
              <div className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.doctor} • {event.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${event.type === 'lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {event.type === 'lab' ? 'Lab Report' : 'Prescription'}
                  </span>
                </div>
                
                <div className="px-6 py-4">
                  {event.alerts.length > 0 && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 items-start">
                      <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-900">Abnormal Value Detected</h4>
                        <ul className="mt-1 list-disc pl-4 text-sm text-red-700">
                          {event.alerts.map((alert, i) => <li key={i}>{alert}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Extracted Data</h4>
                    {event.items.map((item, i) => (
                      <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${item.abnormal ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
                        <div>
                          <p className={`font-semibold ${item.abnormal ? 'text-red-900' : 'text-gray-900'}`}>{item.name}</p>
                          {item.verified && <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Verified with pharmacy bill</p>}
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-sm ${item.abnormal ? 'text-red-700 font-bold' : 'text-gray-700'}`}>{item.value || item.dose}</p>
                          {item.range && <p className="text-xs text-gray-500">Normal: {item.range}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
