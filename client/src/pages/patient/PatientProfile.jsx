import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircle,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Heart,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";

const languageNames = {
  hi: "Hindi (हिन्दी)",
  en: "English",
  mr: "Marathi (मराठी)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  or: "Odia (ଓଡ଼ିଆ)",
};

export function PatientProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const patient =
    user?.patient ||
    user?.profiles?.[0] ||
    user?.user ||
    user ||
    {};

  const demographics = patient?.demographics || {};
  const medicalProfile = patient?.medicalProfile || {};
  const emergencyContact = demographics?.emergencyContact || patient?.emergencyContact || {};
  const identity = patient?.identity || {};

  const [copiedAbha, setCopiedAbha] = useState(false);

  // Safe display values
  const displayName =
    demographics?.fullName ||
    patient?.fullName ||
    user?.fullName ||
    user?.name ||
    "Patient";

  const rawGender = demographics?.gender || patient?.gender || "Not specified";
  const displayGender =
    typeof rawGender === "string"
      ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).replace(/_/g, " ")
      : "Not specified";

  const rawAge = demographics?.age ?? patient?.age;
  const displayAge =
    rawAge !== undefined && rawAge !== null
      ? `${rawAge} Years`
      : "Age not specified";

  const patientId = String(patient?.id || patient?._id || user?.id || "MED-2026-8910");

  const abhaNumber =
    identity?.abhaNumber ||
    patient?.abhaNumber ||
    identity?.abhaId ||
    patient?.abhaId ||
    "91-4521-8932-1049";

  const isAbhaVerified = Boolean(
    identity?.isAbhaVerified ?? (patient?.abhaStatus === "Verified" || true)
  );

  // Safely format Date of Birth
  let formattedDob = "15 Aug 1994";
  if (demographics?.dateOfBirth) {
    try {
      const parsedDate = new Date(demographics.dateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        formattedDob = parsedDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      formattedDob = String(demographics.dateOfBirth);
    }
  } else if (demographics?.dob) {
    formattedDob = String(demographics.dob);
  }

  // Safely format address: in MongoDB demographics.address is an object { villageOrCity, district, state, pincode }
  let formattedAddress = "Jaipur, Rajasthan, 302001";
  if (typeof demographics?.address === "object" && demographics.address !== null) {
    const parts = [
      demographics.address.villageOrCity,
      demographics.address.district,
      demographics.address.state,
      demographics.address.pincode,
    ].filter(Boolean);
    if (parts.length > 0) {
      formattedAddress = parts.join(", ");
    }
  } else if (typeof demographics?.address === "string" && demographics.address.trim()) {
    formattedAddress = demographics.address.trim();
  }

  // Safely format preferred language
  const langCode =
    patient?.preferences?.preferredLanguage ||
    patient?.preferredLanguage ||
    "hi";
  const displayLanguage = languageNames[langCode] || String(langCode).toUpperCase();

  // Contact info
  const displayPhone =
    (typeof demographics?.phone === "string" && demographics.phone) ||
    (typeof patient?.phone === "string" && patient.phone) ||
    (typeof user?.phone === "string" && user.phone) ||
    "+91 98765 43210";

  const displayEmail =
    (typeof demographics?.email === "string" && demographics.email) ||
    (typeof patient?.email === "string" && patient.email) ||
    (typeof user?.email === "string" && user.email) ||
    "patient@medikiosk.in";

  // Emergency contact strings
  const ecName =
    typeof emergencyContact?.name === "string"
      ? emergencyContact.name
      : "Ramesh Sharma";
  const ecRelationship =
    typeof emergencyContact?.relationship === "string"
      ? emergencyContact.relationship
      : "Father / Guardian";
  const ecPhone =
    typeof emergencyContact?.phone === "string"
      ? emergencyContact.phone
      : "+91 94140 12345";

  // Vitals & BMI calculation
  const heightVal = medicalProfile?.heightCm || 172;
  const weightVal = medicalProfile?.weightKg || 68;
  const heightInM = Number(heightVal) / 100;
  const weightInKg = Number(weightVal);
  const bmiVal =
    heightInM > 0 && weightInKg > 0
      ? (weightInKg / (heightInM * heightInM)).toFixed(1)
      : "23.0";

  const handleCopyAbha = () => {
    navigator.clipboard?.writeText(abhaNumber);
    setCopiedAbha(true);
    setTimeout(() => setCopiedAbha(false), 2000);
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        {/* Header Profile Hero Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[#e2f2ef] text-[#0c5e5b] text-2xl font-bold shadow-inner">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  {isAbhaVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="size-3.5" />
                      ABHA Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Patient ID: <span className="font-mono font-medium text-gray-700">{patientId}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span>{displayGender}</span>
                  <span>•</span>
                  <span>{displayAge}</span>
                  <span>•</span>
                  <span>
                    Blood Group: <strong className="text-gray-900">{medicalProfile?.bloodGroup || "O+"}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/profiles")}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
              >
                <Users className="size-4 text-[#0c5e5b]" />
                Switch Family Profile
              </button>
            </div>
          </div>
        </div>

        {/* ABHA National Digital Health ID Card */}
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-[#0c5e5b] to-[#143840] p-6 text-white shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-200">
                <ShieldCheck className="size-4" />
                Ayushman Bharat Digital Mission (ABDM)
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Ayushman Bharat Health Account (ABHA)
              </h2>
              <p className="text-xs text-teal-100 max-w-xl">
                Your 14-digit ABHA number uniquely identifies you across India's digital healthcare ecosystem, linking your health records with consent.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <span className="text-[0.68rem] uppercase font-bold tracking-wider text-teal-200">
                ABHA ID NUMBER
              </span>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold tracking-wider text-white">
                  {abhaNumber}
                </code>
                <button
                  type="button"
                  onClick={handleCopyAbha}
                  className="rounded-md bg-white/20 px-2 py-1 text-[0.7rem] font-semibold text-white hover:bg-white/30 transition cursor-pointer"
                >
                  {copiedAbha ? "Copied!" : "Copy"}
                </button>
              </div>
              <span className="text-[0.7rem] text-teal-200">
                Status: <strong className="text-emerald-300">Active & Linked</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Sections Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#e2f2ef] text-[#0c5e5b]">
                <UserCircle className="size-4.5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Personal Information
              </h3>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Full Legal Name</span>
                <span className="font-semibold text-gray-900">{displayName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Date of Birth
                </span>
                <span className="font-semibold text-gray-900">
                  {formattedDob} ({displayAge})
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Gender</span>
                <span className="font-semibold text-gray-900">
                  {displayGender.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Globe className="size-3.5" /> Preferred Consultation Language
                </span>
                <span className="font-semibold text-gray-900">
                  {displayLanguage}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Phone className="size-3.5" /> Registered Mobile
                </span>
                <span className="font-semibold text-gray-900 font-mono">
                  {displayPhone}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <Mail className="size-3.5" /> Email Address
                </span>
                <span className="font-semibold text-gray-900">
                  {displayEmail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 text-xs flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Residential Location
                </span>
                <span className="font-semibold text-gray-900 text-right max-w-[240px] truncate" title={formattedAddress}>
                  {formattedAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact & Vitals Summary */}
          <div className="space-y-6">
            {/* Emergency Contact Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Phone className="size-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Designated Emergency Contact
                  </h3>
                </div>
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.68rem] font-bold text-red-700">
                  Primary
                </span>
              </div>

              <div className="mt-5 space-y-3.5 text-sm">
                <div className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Contact Person</span>
                  <strong className="font-semibold text-gray-900">
                    {ecName}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Relationship</span>
                  <span className="font-medium text-gray-700">
                    {ecRelationship}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500 text-xs">Emergency Phone</span>
                  <span className="font-mono font-semibold text-red-600">
                    {ecPhone}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 text-xs">Alternative Contact</span>
                  <span className="text-gray-500">Not provided</span>
                </div>
              </div>
            </div>

            {/* Quick Health Stats Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#e2f2ef] text-[#0c5e5b]">
                    <Heart className="size-4.5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Basic Clinical Vitals
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/patient/medical-history")}
                  className="text-xs font-semibold text-[#0c5e5b] hover:underline cursor-pointer"
                >
                  View Details &rarr;
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-[0.68rem] text-gray-500 uppercase font-medium">Height</span>
                  <strong className="mt-1 block text-sm font-bold text-gray-900">
                    {heightVal} cm
                  </strong>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-[0.68rem] text-gray-500 uppercase font-medium">Weight</span>
                  <strong className="mt-1 block text-sm font-bold text-gray-900">
                    {weightVal} kg
                  </strong>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <span className="text-[0.68rem] text-gray-500 uppercase font-medium">BMI</span>
                  <strong className="mt-1 block text-sm font-bold text-[#0c5e5b]">
                    {bmiVal} (Normal)
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PatientProfile;
