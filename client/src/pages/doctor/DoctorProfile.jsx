import { Award, Building2, Mail, MapPin, Phone, Stethoscope, UserRound } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";

export function DoctorProfile() {
  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-[#e2f2ef] text-[#0c5e5b]"><UserRound className="size-10" /></div>
            <div><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-[#0c5e5b]">Demo profile</span><h1 className="mt-2 text-2xl font-bold text-gray-900">Dr. Ananya Mehta</h1><p className="mt-1 text-sm text-gray-500">General Medicine · Physician</p></div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs"><h2 className="text-base font-bold text-gray-900">Professional details</h2><div className="mt-5 space-y-4 text-sm text-gray-600"><p className="flex items-center gap-3"><Stethoscope className="size-4 text-[#0c5e5b]" />General Medicine</p><p className="flex items-center gap-3"><Award className="size-4 text-[#0c5e5b]" />MBBS, MD · Registration: DEMO-2026</p><p className="flex items-center gap-3"><Building2 className="size-4 text-[#0c5e5b]" />MediKiosk Community Clinic</p><p className="flex items-center gap-3"><MapPin className="size-4 text-[#0c5e5b]" />OPD Room 3</p></div></section>
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs"><h2 className="text-base font-bold text-gray-900">Contact information</h2><div className="mt-5 space-y-4 text-sm text-gray-600"><p className="flex items-center gap-3"><Mail className="size-4 text-[#0c5e5b]" />ananya.mehta@example.com</p><p className="flex items-center gap-3"><Phone className="size-4 text-[#0c5e5b]" />+91 90000 00000</p></div><p className="mt-6 rounded-xl bg-[#f8faf9] p-3 text-xs leading-5 text-gray-500">This is sample profile information for the doctor portal and is not connected to a live account.</p></section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DoctorProfile;
