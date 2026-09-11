import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  Stethoscope,
  Users,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";

const metrics = [
  {
    label: "Patients today",
    value: "24",
    detail: "+4 vs yesterday",
    icon: Users,
  },
  {
    label: "Awaiting review",
    value: "08",
    detail: "2 high priority",
    icon: ClipboardList,
  },
  {
    label: "Follow-ups",
    value: "12",
    detail: "3 need callback",
    icon: CalendarDays,
  },
  {
    label: "Clinical notes",
    value: "18",
    detail: "3 pending approval",
    icon: FileText,
  },
];

const queue = [
  { name: "Aarav Sharma", time: "09:10 AM", status: "Pre-consultation complete" },
  { name: "Meera Patel", time: "09:25 AM", status: "Vitals recorded" },
  { name: "Rohan Kumar", time: "09:40 AM", status: "Document upload complete" },
  { name: "Sana Khan", time: "10:05 AM", status: "Waiting in queue" },
];

const focusAreas = [
  "Review submitted history summaries before consultation.",
  "Check recent prescriptions and ongoing follow-ups.",
  "Confirm patient documents are uploaded in the correct order.",
];

export function DoctorDashboard() {
  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-2xs sm:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0c5e5b]">
                Clinical overview
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Good morning, Dr. Mehta</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e2f2ef] px-3 py-2 text-sm font-medium text-[#0c5e5b]">
              <Activity className="size-4" />
              7 consultations scheduled
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#e2f2ef] text-[#0c5e5b]">
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="mt-5 text-3xl font-bold text-gray-900">{value}</div>
              <p className="mt-2 text-xs text-gray-500">{detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs sm:p-6">
            <div className="flex items-center gap-2">
              <Stethoscope className="size-4 text-[#0c5e5b]" />
              <h2 className="text-base font-bold text-gray-900">Consultation queue</h2>
            </div>

            <div className="mt-4 space-y-3">
              {queue.map((patient) => (
                <div
                  key={patient.name}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-[#f9fbfa] px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.time}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[0.68rem] font-semibold text-[#0c5e5b]">
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs sm:p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-[#0c5e5b]" />
              <h2 className="text-base font-bold text-gray-900">Today's focus</h2>
            </div>

            <ul className="mt-4 space-y-3">
              {focusAreas.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-gray-600">
                  <span className="mt-1.5 size-2 rounded-full bg-[#0c5e5b]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DoctorDashboard;
