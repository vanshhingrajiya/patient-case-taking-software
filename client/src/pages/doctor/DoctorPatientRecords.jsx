import { useState } from "react";
import { FileText, HeartPulse, Clock3, Stethoscope, PencilLine } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";

const initialRecords = [
  {
    id: "AS-1042",
    initials: "AS",
    name: "Aarav Sharma",
    details: "34 years · Male · OPD-1042",
    status: "Pre-consultation complete",
    summary:
      "Persistent headache for three days, with intermittent light sensitivity. No emergency warning signs reported. Patient completed the pre-consultation questionnaire and is awaiting physician review.",
    notes: "No emergency warning signs reported. Patient has completed the pre-consultation questionnaire.",
    documents: [
      { time: "09:10 AM", title: "Pre-consultation form", description: "Symptoms and general history submitted" },
      { time: "09:14 AM", title: "Vitals record", description: "Blood pressure, pulse, and temperature recorded" },
      { time: "09:18 AM", title: "Uploaded document", description: "Previous clinic note attached" },
    ],
  },
  {
    id: "MP-1043",
    initials: "MP",
    name: "Meera Patel",
    details: "48 years · Female · OPD-1043",
    status: "Pre-consultation complete",
    summary:
      "Follow-up for fatigue and a recent change in sleep pattern. Symptoms are mild and stable. Patient provided a short symptom summary before arrival and requested a routine consultation.",
    notes: "Patient requested a routine consultation and uploaded a short symptom summary before arrival.",
    documents: [
      { time: "09:25 AM", title: "Pre-consultation form", description: "Lifestyle and symptom questionnaire completed" },
      { time: "09:29 AM", title: "Vitals record", description: "Initial observations recorded at reception" },
      { time: "09:34 AM", title: "Medical document", description: "Prior test summary attached" },
    ],
  },
  {
    id: "RK-1044",
    initials: "RK",
    name: "Rohan Kumar",
    details: "29 years · Male · OPD-1044",
    status: "Pre-consultation complete",
    summary:
      "Seasonal cough and throat discomfort since the weekend. No acute respiratory distress noted. Patient has shared earlier prescription details for review during the consultation.",
    notes: "Pre-consultation notes indicate no known urgent concerns. Awaiting physician review.",
    documents: [
      { time: "09:40 AM", title: "Pre-consultation form", description: "Presenting concern and duration recorded" },
      { time: "09:44 AM", title: "Vitals record", description: "Baseline measurements added" },
      { time: "09:48 AM", title: "Uploaded document", description: "Photo of an earlier prescription attached" },
    ],
  },
];

export function DoctorPatientRecords() {
  const [records, setRecords] = useState(initialRecords);

  const handleSummaryChange = (recordId, value) => {
    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === recordId ? { ...record, summary: value } : record,
      ),
    );
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[0.65rem] font-medium text-[#0c5e5b] ring-1 ring-teal-100">
                      <PencilLine className="size-3" />
                      Draft
                    </span>
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
    </DashboardLayout>
  );
}

export default DoctorPatientRecords;
