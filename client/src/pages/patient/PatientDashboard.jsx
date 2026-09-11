import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  ArrowRight,
  Stethoscope,
  Phone,
  ShieldCheck,
  User,
  Activity,
  PlusCircle,
  FileHeart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";

const languageNames = {
  hi: "Hindi",
  en: "English",
  mr: "Marathi",
  te: "Telugu",
  ta: "Tamil",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
};

export function PatientDashboard({ session: propSession }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const session = propSession || authUser;

  // Extract active patient details from session
  const patient =
    session?.patient ||
    session?.profiles?.[0] ||
    session?.user ||
    {};

  const emergencyContact =
    patient?.demographics?.emergencyContact ||
    patient?.emergencyContact ||
    {};

  const medicalProfile = patient?.medicalProfile || {};

  const fullName =
    patient?.fullName ||
    session?.user?.fullName ||
    "Patient";

  const age = patient?.age ? `${patient.age} Years` : "Not added";

  const gender = patient?.gender
    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).replace("_", " ")
    : "Not specified";

  const languageCode =
    patient?.preferredLanguage ||
    patient?.preferences?.preferredLanguage ||
    "hi";
  const language = languageNames[languageCode] || languageCode;

  const abhaStatus =
    patient?.abhaStatus ||
    (patient?.identity?.isAbhaVerified ? "Verified" : "Not Verified");

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6">
        {/* Top Dark Patient Banner */}
        <div className="w-full rounded-2xl bg-[#143840] px-6 py-5 shadow-sm text-white sm:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 items-center">
            {/* Column 1: Patient Name */}
            <div>
              <span className="block text-[0.68rem] font-bold tracking-[0.14em] text-[#789d9e] uppercase">
                PATIENT NAME
              </span>
              <strong className="mt-1 block text-base font-bold text-white truncate">
                {fullName}
              </strong>
            </div>

            {/* Column 2: Age */}
            <div>
              <span className="block text-[0.68rem] font-bold tracking-[0.14em] text-[#789d9e] uppercase">
                AGE
              </span>
              <strong className="mt-1 block text-base font-bold text-white">
                {age}
              </strong>
            </div>

            {/* Column 3: Gender */}
            <div>
              <span className="block text-[0.68rem] font-bold tracking-[0.14em] text-[#789d9e] uppercase">
                GENDER
              </span>
              <strong className="mt-1 block text-base font-bold text-white">
                {gender}
              </strong>
            </div>

            {/* Column 4: Language */}
            <div>
              <span className="block text-[0.68rem] font-bold tracking-[0.14em] text-[#789d9e] uppercase">
                LANGUAGE
              </span>
              <strong className="mt-1 block text-base font-bold text-white">
                {language}
              </strong>
            </div>

            {/* Column 5: ABHA Status */}
            <div>
              <span className="block text-[0.68rem] font-bold tracking-[0.14em] text-[#789d9e] uppercase">
                ABHA STATUS
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[#4fd1c5]">
                <ShieldCheck className="size-4" />
                {abhaStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card 1: Start AI Health Consultation (New Case) */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#d2e7e2] bg-[#e3f3f0] p-7 shadow-2xs sm:p-8">
            <div>
              {/* Icon */}
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#0c5e5b] text-white shadow-xs">
                <HeartPulse className="size-6" />
              </div>

              {/* Eyebrow */}
              <div className="mt-5 text-[0.72rem] font-bold tracking-[0.14em] text-[#0c5e5b] uppercase">
                YOUR NEXT STEP
              </div>

              {/* Title */}
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#143840]">
                Start AI Health
                <br />
                Consultation
              </h2>

              {/* Subtext */}
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#5d7c80]">
                Tell us about your symptoms using your voice or by touching the screen. Quick intake for faster clinical care.
              </p>
            </div>

            {/* Action Row */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#143840] px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0c252b] cursor-pointer"
                onClick={() => navigate("/patient/new-case")}
              >
                <span>Start New Case</span>
                <ArrowRight className="size-4" />
              </button>
              <span className="text-xs text-[#5d7c80]">
                Voice or touch input available
              </span>
            </div>
          </div>

          {/* Card 2: My Health Profile */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e8f1ed] bg-white p-7 shadow-2xs sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#e2f2ef] text-[#0c5e5b]">
                    <User className="size-4.5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#143840]">
                    My Health Profile
                  </h3>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0c5e5b] hover:underline cursor-pointer"
                  onClick={() => navigate("/patient/profile")}
                >
                  <span>Full Profile</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>

              {/* 2x2 Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-gray-100">
                  <span className="block text-xs font-medium text-gray-500">
                    Height
                  </span>
                  <span className="mt-1 block text-sm font-bold text-[#143840]">
                    {medicalProfile?.heightCm ? `${medicalProfile.heightCm} cm` : "Not added"}
                  </span>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-gray-100">
                  <span className="block text-xs font-medium text-gray-500">
                    Weight
                  </span>
                  <span className="mt-1 block text-sm font-bold text-[#143840]">
                    {medicalProfile?.weightKg ? `${medicalProfile.weightKg} kg` : "Not added"}
                  </span>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-gray-100">
                  <span className="block text-xs font-medium text-gray-500">
                    Blood Group
                  </span>
                  <span className="mt-1 block text-sm font-bold text-[#143840]">
                    {medicalProfile?.bloodGroup || "Not added"}
                  </span>
                </div>

                <div className="rounded-xl bg-[#f8faf9] p-3.5 border border-gray-100">
                  <span className="block text-xs font-medium text-gray-500">
                    Conditions
                  </span>
                  <span className="mt-1 block text-sm font-bold text-[#143840] truncate">
                    {medicalProfile?.chronicConditions?.length
                      ? medicalProfile.chronicConditions.join(", ")
                      : "None recorded"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>ABHA ID: {patient?.identity?.abhaId || patient?.abhaId || "Not Linked"}</span>
              <button
                type="button"
                onClick={() => navigate("/patient/medical-history")}
                className="text-[#0c5e5b] font-semibold hover:underline"
              >
                View Medical History &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Previous Consultations */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e8f1ed] bg-white p-7 shadow-2xs sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#e2f2ef] text-[#0c5e5b]">
                    <Stethoscope className="size-4.5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#143840]">
                    Previous Consultations
                  </h3>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0c5e5b] hover:underline cursor-pointer"
                  onClick={() => navigate("/patient/case-history")}
                >
                  <span>All Cases</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>

              <div className="mt-5 border-b border-gray-100" />

              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#f4f9f7] text-[#0c5e5b] mb-3">
                  <Stethoscope className="size-6" />
                </div>
                <strong className="block text-sm font-semibold text-[#143840]">
                  No Previous Consultations
                </strong>
                <p className="mt-1 max-w-xs text-xs text-gray-500">
                  Your completed consultation history, diagnoses, and digital prescriptions will be recorded here.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/patient/new-case")}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#0c5e5b]/20 bg-[#e2f2ef]/50 py-2.5 text-xs font-semibold text-[#0c5e5b] hover:bg-[#e2f2ef] transition-colors cursor-pointer"
            >
              <PlusCircle className="size-4" />
              Book or Start New Consultation
            </button>
          </div>

          {/* Card 4: Emergency Information */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e8f1ed] bg-white p-7 shadow-2xs sm:p-8">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Phone className="size-4.5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#143840]">
                    Emergency Contact
                  </h3>
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[0.68rem] font-bold text-red-700 uppercase">
                  24/7 Priority
                </span>
              </div>

              <div className="mt-5 border-b border-gray-100" />

              <div className="py-5">
                <div className="rounded-xl bg-[#fff8f8] border border-red-100 p-4">
                  <strong className="block text-sm font-bold text-gray-900">
                    {emergencyContact?.name || "No Emergency Contact Added"}
                  </strong>
                  <span className="mt-0.5 block text-xs text-gray-600">
                    Relationship: {emergencyContact?.relationship || "Relative / Guardian"}
                  </span>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-700">
                    <Phone className="size-3.5" />
                    <span>{emergencyContact?.phone || "Phone number not registered"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>Hospital Emergency: <strong className="text-gray-800">108 / 112</strong></span>
              <button
                type="button"
                onClick={() => navigate("/patient/profile")}
                className="text-[#0c5e5b] font-semibold hover:underline"
              >
                Update Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PatientDashboard;
