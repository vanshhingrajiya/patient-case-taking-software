import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiUserAddLine,
} from "@remixicon/react";

import { AppShell } from "../components/AppShell";
import { TranslatedText } from "../components/common/TranslatedText";
import {
  registerPatient,
  registerPatientProfile,
  requestPatientOtp,
  validatePatientRegistration,
} from "../services";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const initialForm = {
  abhaNumber: "",
  abhaAddress: "",
  aadhaarLastFour: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  mobileNumber: "",
  email: "",
  villageOrCity: "",
  district: "",
  state: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  otp: "",
  consent: false,
};

const states = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const genderOptions = [
  ["male", "Male"],
  ["female", "Female"],
  ["other", "Other"],
  ["prefer_not_to_say", "Prefer not to say"],
];

const relationshipOptions = [
  "Parent",
  "Spouse",
  "Sibling",
  "Child",
  "Relative",
  "Friend",
  "Other",
];

const FIELD_ORDER = [
  "abhaNumber",
  "abhaAddress",
  "aadhaarLastFour",
  "fullName",
  "dateOfBirth",
  "mobileNumber",
  "email",
  "gender",
  "villageOrCity",
  "district",
  "state",
  "pincode",
  "emergencyContactName",
  "emergencyContactRelationship",
  "emergencyContactPhone",
  "consent",
  "otp",
];

function scrollToFirstError(errorsObj) {
  if (!errorsObj || typeof errorsObj !== "object") return;
  const errorKeys = Object.keys(errorsObj);
  if (errorKeys.length === 0) return;

  const firstKey = FIELD_ORDER.find((key) => errorsObj[key]) || errorKeys[0];
  setTimeout(() => {
    const element =
      document.getElementById(firstKey) ||
      document.getElementById(`field-container-${firstKey}`) ||
      document.getElementById(`${firstKey}-error`);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof element.focus === "function") {
        element.focus();
      }
    }
  }, 60);
}

function validateLocalForm(form) {
  const errors = {};

  // 1. Mandatory Identity & Demographics
  if (!form.fullName || !form.fullName.trim()) {
    errors.fullName = "Full name is mandatory.";
  }

  if (!form.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is mandatory.";
  } else {
    const dob = new Date(form.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    } else if (dob > new Date()) {
      errors.dateOfBirth = "Date of birth cannot be in the future.";
    }
  }

  if (!form.gender) {
    errors.gender = "Please select a gender.";
  }

  // 2. Mobile validation
  const mobileDigits = (form.mobileNumber || "").replace(/\D/g, "");
  if (!mobileDigits) {
    errors.mobileNumber = "10-digit mobile number is mandatory.";
  } else if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
    errors.mobileNumber = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
  }

  // 3. Email validation (optional)
  if (form.email && form.email.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
  }

  // 4. Address (all mandatory)
  if (!form.villageOrCity || !form.villageOrCity.trim()) {
    errors.villageOrCity = "Village or city is mandatory.";
  }

  if (!form.district || !form.district.trim()) {
    errors.district = "District is mandatory.";
  }

  if (!form.state || !form.state.trim()) {
    errors.state = "Please select a state.";
  }

  const pincodeDigits = (form.pincode || "").replace(/\D/g, "");
  if (!pincodeDigits) {
    errors.pincode = "PIN code is mandatory.";
  } else if (!/^\d{6}$/.test(pincodeDigits)) {
    errors.pincode = "Enter a valid 6-digit PIN code.";
  }

  // 5. Emergency Contact (all mandatory)
  if (!form.emergencyContactName || !form.emergencyContactName.trim()) {
    errors.emergencyContactName = "Emergency contact name is mandatory.";
  }

  if (!form.emergencyContactRelationship || !form.emergencyContactRelationship.trim()) {
    errors.emergencyContactRelationship = "Please select a relationship.";
  }

  const emergencyPhoneDigits = (form.emergencyContactPhone || "").replace(/\D/g, "");
  if (!emergencyPhoneDigits) {
    errors.emergencyContactPhone = "Emergency contact phone is mandatory.";
  } else if (!/^[6-9]\d{9}$/.test(emergencyPhoneDigits)) {
    errors.emergencyContactPhone = "Enter a valid 10-digit emergency contact phone.";
  }

  // 6. Optional Aadhaar check
  if (form.aadhaarLastFour && form.aadhaarLastFour.trim()) {
    const aadhaarDigits = form.aadhaarLastFour.trim();
    if (!/^\d{4}$/.test(aadhaarDigits)) {
      errors.aadhaarLastFour = "Enter exactly 4 digits.";
    }
  }

  // 7. Consent
  if (!form.consent) {
    errors.consent = "You must accept the ABDM consent to proceed.";
  }

  return errors;
}

function Field({
  label,
  name,
  form,
  setForm,
  errors = {},
  setErrors,
  required = false,
  type = "text",
  options,
  disabled = false,
  ...props
}) {
  const error = errors[name];

  const updateField = (event) => {
    const { name: fieldName, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
    if (setErrors && errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  return (
    <div className="mt-4" id={`field-container-${name}`}>
      <label className="block text-xs font-semibold text-[#143337] mb-1.5" htmlFor={name}>
        <TranslatedText text={label} />
        {required && <span className="text-[#e06a3b]"> *</span>}
      </label>

      {options ? (
        <select
          id={name}
          name={name}
          disabled={disabled}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#143337] outline-none transition-colors focus:ring-2 disabled:bg-[#f2f6f4] disabled:text-[#7f999d] ${
            error
              ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
              : "border-[#d1e2dc] focus:border-[#0c5e5b] focus:ring-[#0c5e5b]/20"
          }`}
          required={required}
          value={form[name] || ""}
          onChange={updateField}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((option) => {
            const value = Array.isArray(option) ? option[0] : option;
            const text = Array.isArray(option) ? option[1] : option;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          disabled={disabled}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#143337] placeholder:text-[#94a9af] outline-none transition-colors focus:ring-2 disabled:bg-[#f2f6f4] disabled:text-[#7f999d] ${
            error
              ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
              : "border-[#d1e2dc] focus:border-[#0c5e5b] focus:ring-[#0c5e5b]/20"
          }`}
          type={type}
          required={required}
          value={form[name] || ""}
          onChange={updateField}
          {...props}
        />
      )}

      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          <TranslatedText text={error} />
        </p>
      )}
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="mt-6 rounded-[22px] border border-[#e8f1ed] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
      <div className="flex items-baseline justify-between gap-4 border-b border-[#edf4f1] pb-3.5 max-sm:block">
        <h2 className="text-base font-bold text-[#143337]">
          <TranslatedText text={title} />
        </h2>
        {description && (
          <p className="text-xs text-[#5d7c80] max-sm:mt-1">
            <TranslatedText text={description} />
          </p>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function Register({ session: propSession, go, onAuthenticated }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser, setSession } = useAuth();
  const { currentLanguage } = useLanguage();
  const session = propSession || authUser;

  const handleNavigate = (to) => {
    if (typeof go === "function") {
      go(to);
    } else {
      navigate(to);
    }
  };

  const isAddingProfile = searchParams.get("add") === "1";
  const paramIdentifier = searchParams.get("identifier") || "";

  const [form, setForm] = useState(() => {
    let initialMobile = session?.user?.phone || "";
    let initialEmail = session?.user?.email || "";
    if (paramIdentifier) {
      if (paramIdentifier.includes("@")) {
        initialEmail = paramIdentifier;
      } else {
        initialMobile = paramIdentifier.replace(/\D/g, "").slice(-10);
      }
    }
    return {
      ...initialForm,
      mobileNumber: initialMobile,
      email: initialEmail,
    };
  });

  const [errors, setErrors] = useState({});
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loadingAction, setLoadingAction] = useState(""); // "checking" | "sending_otp" | "resending_otp" | "registering" | ""

  const isBusy = Boolean(loadingAction);

  const fieldProps = {
    form,
    setForm,
    errors,
    setErrors,
    disabled: isBusy,
  };

  const handleResendOtp = async () => {
    const contactValue = form.mobileNumber || form.email;
    if (!contactValue) {
      const err = { mobileNumber: "Please enter your mobile number." };
      setErrors(err);
      scrollToFirstError(err);
      return;
    }

    setLoadingAction("resending_otp");
    setGeneralError("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.otp;
      return next;
    });

    try {
      await requestPatientOtp(contactValue, isAddingProfile ? "profile_add" : "registration");
      setOtpMessage("OTP resent successfully! Check the backend server console for the 6-digit code.");
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors);
        scrollToFirstError(err.errors);
      } else {
        setErrors({ otp: err.message || "Failed to resend OTP." });
      }
    } finally {
      setLoadingAction("");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setGeneralError("");

    if (!otpRequested) {
      // 1. Client-side validation of all mandatory fields & formats
      const localErrors = validateLocalForm(form);
      if (Object.keys(localErrors).length > 0) {
        setErrors(localErrors);
        scrollToFirstError(localErrors);
        return;
      }

      // 2. Server-side validation and uniqueness check (mobile, email, ABHA, Aadhaar)
      setLoadingAction("checking");
      try {
        await validatePatientRegistration({
          ...form,
          preferredLanguage: currentLanguage || "en",
          isAddingProfile,
        });
      } catch (err) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setErrors(err.errors);
          scrollToFirstError(err.errors);
          return;
        }
        setGeneralError(err.message || "Failed to validate registration details. Please try again.");
        return;
      } finally {
        setLoadingAction("");
      }

      // 3. All fields are valid and do not exist already! Send OTP
      const contactValue = form.mobileNumber || form.email;
      setLoadingAction("sending_otp");
      try {
        await requestPatientOtp(contactValue, isAddingProfile ? "profile_add" : "registration");
        setOtpRequested(true);
        setOtpMessage("OTP sent successfully! Check the backend server console for the 6-digit verification code.");
        setErrors({});
        setTimeout(() => {
          const otpInput = document.getElementById("otp");
          if (otpInput) {
            otpInput.scrollIntoView({ behavior: "smooth", block: "center" });
            otpInput.focus();
          }
        }, 120);
      } catch (err) {
        if (err.errors && Object.keys(err.errors).length > 0) {
          setErrors(err.errors);
          scrollToFirstError(err.errors);
        } else if (err.field) {
          const fieldErr = { [err.field]: err.message };
          setErrors(fieldErr);
          scrollToFirstError(fieldErr);
        } else {
          setGeneralError(err.message || "Failed to send OTP. Please try again.");
        }
      } finally {
        setLoadingAction("");
      }
      return;
    }

    // When otpRequested is true -> verify OTP and register patient
    if (!form.otp || form.otp.trim().length !== 6) {
      const otpErr = { otp: "Please enter the 6-digit verification code." };
      setErrors(otpErr);
      scrollToFirstError(otpErr);
      return;
    }

    const contactValue = form.mobileNumber || form.email;
    setLoadingAction("registering");
    try {
      const payload = {
        ...form,
        preferredLanguage: currentLanguage || "en",
        identifier: contactValue,
      };
      const result = isAddingProfile
        ? await registerPatientProfile(payload)
        : await registerPatient(payload);

      if (typeof onAuthenticated === "function") {
        onAuthenticated(result);
      }
      setSession(result);
      handleNavigate("/profiles");
    } catch (reason) {
      if (reason.errors && Object.keys(reason.errors).length > 0) {
        setErrors(reason.errors);
        scrollToFirstError(reason.errors);
      } else if (reason.message?.toLowerCase().includes("otp")) {
        const otpErr = { otp: reason.message };
        setErrors(otpErr);
        scrollToFirstError(otpErr);
      } else {
        setGeneralError(reason.message || "Failed to complete registration. Please verify your details.");
      }
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <AppShell go={handleNavigate}>
      <form noValidate className="mx-auto my-6 mb-20 max-w-[880px]" onSubmit={submit}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-[#0c5e5b] transition-colors hover:text-[#084341] cursor-pointer"
            onClick={() => handleNavigate("/")}
          >
            <RiArrowLeftSLine className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span><TranslatedText text="Back to welcome" /></span>
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-[#5d7c80] hover:text-[#0c5e5b] cursor-pointer"
            onClick={() => handleNavigate("/login")}
          >
            <TranslatedText text="Already have an account?" />{" "}
            <span className="font-bold text-[#0c5e5b] underline">
              <TranslatedText text="Sign in" />
            </span>
          </button>
        </div>

        <div className="mt-5 mb-8">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#0c5e5b] uppercase">
            <RiUserAddLine className="size-4" />
            <span><TranslatedText text="PATIENT REGISTRATION" /></span>
          </div>
          <h1 className="text-[clamp(2.4rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#143337]">
            <TranslatedText text="Patient Registration" />
          </h1>
          <p className="mt-2 text-base text-[#5d7c80]">
            <TranslatedText text="Create your digital patient profile to begin using MediKiosk and access OPD services." />
          </p>
        </div>

        {/* Generic server/system error banner (only shown if there are NO specific field errors) */}
        {generalError && Object.keys(errors).length === 0 && (
          <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
            <TranslatedText text={generalError} />
          </div>
        )}

        {otpMessage && (
          <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
            <TranslatedText text={otpMessage} />
          </div>
        )}

        {/* Identity Information */}
        <FormSection
          title="Identity information"
          description="Optional details help keep your medical records connected."
        >
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-3">
            <Field
              label="ABHA number"
              name="abhaNumber"
              placeholder="12-3456-7890-1234"
              {...fieldProps}
            />
            <Field
              label="ABHA address"
              name="abhaAddress"
              placeholder="name@abdm"
              {...fieldProps}
            />
            <Field
              label="Aadhaar last 4 digits"
              name="aadhaarLastFour"
              inputMode="numeric"
              maxLength="4"
              placeholder="e.g. 1234"
              {...fieldProps}
            />
          </div>
        </FormSection>

        {/* Personal Details */}
        <FormSection
          title="Personal details"
          description="Required information for your hospital patient record."
        >
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <Field
              label="Full name"
              name="fullName"
              required
              placeholder="Enter your full name"
              {...fieldProps}
            />
            <Field
              label="Date of birth"
              name="dateOfBirth"
              required
              type="date"
              {...fieldProps}
            />
            <Field
              label="Mobile number"
              name="mobileNumber"
              required
              inputMode="numeric"
              maxLength="10"
              placeholder="10-digit mobile number"
              {...fieldProps}
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              {...fieldProps}
            />
            <Field
              label="Gender"
              name="gender"
              required
              options={genderOptions}
              {...fieldProps}
            />
          </div>
        </FormSection>

        {/* Address */}
        <FormSection title="Address">
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <Field
              label="Village / City"
              name="villageOrCity"
              required
              placeholder="City or village"
              {...fieldProps}
            />
            <Field
              label="District"
              name="district"
              required
              placeholder="District"
              {...fieldProps}
            />
            <Field
              label="State"
              name="state"
              required
              options={states}
              {...fieldProps}
            />
            <Field
              label="PIN code"
              name="pincode"
              required
              inputMode="numeric"
              maxLength="6"
              placeholder="6-digit PIN code"
              {...fieldProps}
            />
          </div>
        </FormSection>

        {/* Emergency Contact */}
        <FormSection
          title="Emergency contact"
          description="Someone we can reach if you need extra support."
        >
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-3">
            <Field
              label="Contact name"
              name="emergencyContactName"
              required
              placeholder="Relative or friend name"
              {...fieldProps}
            />
            <Field
              label="Relationship"
              name="emergencyContactRelationship"
              required
              options={relationshipOptions}
              {...fieldProps}
            />
            <Field
              label="Phone number"
              name="emergencyContactPhone"
              required
              inputMode="numeric"
              maxLength="10"
              placeholder="10-digit phone"
              {...fieldProps}
            />
          </div>
        </FormSection>

        {/* Account Verification (Visible only after OTP is sent) */}
        {otpRequested && (
          <FormSection
            title="Verify your account"
            description="Check your backend server console for the 6-digit OTP code."
          >
            <div className="mt-4" id="field-container-otp">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#143337]" htmlFor="otp">
                  <TranslatedText text="Six-digit OTP" /> <span className="text-[#e06a3b]">*</span>
                </label>
                <button
                  type="button"
                  disabled={isBusy}
                  className="text-xs font-bold text-[#0c5e5b] hover:underline cursor-pointer disabled:opacity-50"
                  onClick={handleResendOtp}
                >
                  {loadingAction === "resending_otp" ? (
                    <TranslatedText text="Resending..." />
                  ) : (
                    <TranslatedText text="Resend code" />
                  )}
                </button>
              </div>
              <input
                id="otp"
                name="otp"
                disabled={isBusy}
                className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-mono tracking-widest text-[#143337] placeholder:text-[#94a9af] outline-none transition-colors focus:ring-2 disabled:bg-[#f2f6f4] ${
                  errors.otp
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-200"
                    : "border-[#d1e2dc] focus:border-[#0c5e5b] focus:ring-[#0c5e5b]/20"
                }`}
                type="text"
                required
                inputMode="numeric"
                maxLength="6"
                pattern="[0-9]{6}"
                placeholder="Enter 6-digit OTP"
                value={form.otp || ""}
                onChange={(event) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    otp: event.target.value.replace(/\D/g, ""),
                  }));
                  if (errors.otp) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.otp;
                      return next;
                    });
                  }
                }}
              />
              {errors.otp && (
                <p id="otp-error" className="mt-1.5 text-xs font-medium text-red-600">
                  <TranslatedText text={errors.otp} />
                </p>
              )}
            </div>
          </FormSection>
        )}

        {/* Consent Checkbox */}
        <div className="mt-6" id="field-container-consent">
          <label
            className={`flex items-start gap-3 rounded-2xl border p-4 text-xs leading-relaxed transition-colors cursor-pointer ${
              errors.consent
                ? "border-red-400 bg-red-50/20 text-[#143337]"
                : "border-[#d1e2dc] bg-white text-[#5d7c80]"
            }`}
          >
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 rounded border-[#d1e2dc] text-[#0c5e5b] accent-[#0c5e5b] cursor-pointer"
              checked={form.consent}
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  consent: event.target.checked,
                }));
                if (errors.consent) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.consent;
                    return next;
                  });
                }
              }}
            />
            <span>
              <TranslatedText text="I agree to the use of my personal and health information for receiving MediKiosk healthcare services under Ayushman Bharat Digital Mission (ABDM) guidelines." />
              <span className="text-[#e06a3b]"> *</span>
            </span>
          </label>
          {errors.consent && (
            <p id="consent-error" className="mt-1.5 text-xs font-medium text-red-600">
              <TranslatedText text={errors.consent} />
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isBusy}
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0c5e5b] px-8 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#084341] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingAction === "checking" ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                <span><TranslatedText text="Checking details..." /></span>
              </>
            ) : loadingAction === "sending_otp" ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                <span><TranslatedText text="Sending OTP..." /></span>
              </>
            ) : loadingAction === "registering" ? (
              <>
                <RiLoader4Line className="size-4 animate-spin" />
                <span><TranslatedText text="Completing Registration..." /></span>
              </>
            ) : otpRequested ? (
              <>
                <span><TranslatedText text="Complete Registration" /></span>
                <RiArrowRightLine className="size-4" />
              </>
            ) : (
              <>
                <span><TranslatedText text="Send OTP" /></span>
                <RiArrowRightLine className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
