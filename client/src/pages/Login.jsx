import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiHeartPulseLine,
  RiStethoscopeLine,
  RiUserLine,
} from "@remixicon/react";

import { AppShell } from "../components/AppShell";
import { TranslatedText } from "../components/common/TranslatedText";
import { login as apiLogin, requestPatientOtp, verifyPatientOtp } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import {
  getRoleDefaultPath,
  getRoleDashboardPath,
  getSafeRedirectPath,
  ROLE_LABELS,
} from "../constants/roles";

export function Login({ go, onAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setSession } = useAuth();

  const handleNavigate = (to, options) => {
    if (typeof go === "function") {
      go(to);
    } else {
      navigate(to, options);
    }
  };

  const isDoctorRedirect =
    location.state?.from?.pathname?.startsWith("/doctor") ||
    location.state?.requiredRoles?.includes("doctor");

  const [mode, setMode] = useState(() => (isDoctorRedirect ? "doctor" : "patient"));
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError("");
    setOtpMessage("");
    setOtpRequested(false);
    setOtp("");
  };

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      setError("Please enter your 10-digit mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await requestPatientOtp(identifier);
      if (result.requiresRegistration) {
        handleNavigate(`/register?identifier=${encodeURIComponent(identifier)}`);
        return;
      }
      setOtpRequested(true);
      setOtpMessage("OTP sent! (Check backend terminal for 6-digit code)");
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      let result;
      if (mode === "patient") {
        // Patient can only log in with OTP
        if (!otpRequested) {
          await handleRequestOtp();
          return;
        }
        if (!otp || otp.length !== 6) {
          setError("Please enter the 6-digit verification code.");
          setBusy(false);
          return;
        }
        result = await verifyPatientOtp(identifier, otp);
      } else {
        // Doctor / staff password authentication
        result = await apiLogin({ identifier, password });
      }

      if (typeof onAuthenticated === "function") {
        onAuthenticated(result);
      }
      setSession(result);

      // Redirect to originally requested route ONLY if authorized for this role,
      // otherwise redirect to the role's canonical default dashboard
      const requestedPath = location.state?.from?.pathname;
      const targetPath = getSafeRedirectPath(requestedPath, result.role);
      handleNavigate(targetPath, { replace: true });
    } catch (reason) {
      setError(reason.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  const fillDemoDoctor = (email) => {
    setIdentifier(email);
    setPassword("Doctor@123");
    setError("");
  };

  return (
    <AppShell go={go}>
      <section className="grid grid-cols-1 items-center gap-12 py-6 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Hero Text */}
        <div>
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#0c5e5b] uppercase">
            <RiHeartPulseLine className="size-4" />
            <span>
              <TranslatedText text={mode === "patient" ? "PATIENT ACCESS" : "DOCTOR ACCESS"} />
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-[clamp(2.8rem,5.5vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-[#143337]">
            <TranslatedText text="Welcome" />
            <br />
            <TranslatedText text="back." />
          </h1>

          {/* Subtitle */}
          <p className="max-w-md text-base leading-relaxed text-[#5d7c80]">
            <TranslatedText text="Pick up where you left off. Your health profile is ready when you are." />
          </p>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="w-full max-w-[460px] rounded-[28px] border border-[#e8f1ed] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:ml-auto">
          {/* Back to Welcome Link */}
          <button
            type="button"
            className="group mb-5 inline-flex items-center gap-1 text-xs font-semibold text-[#0c5e5b] transition-colors hover:text-[#084341] cursor-pointer"
            onClick={() => handleNavigate("/")}
          >
            <RiArrowLeftSLine className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span><TranslatedText text="Back to welcome" /></span>
          </button>

          {/* Heading & Subtitle */}
          <h2 className="text-2xl font-bold tracking-tight text-[#143337]">
            <TranslatedText text="Sign in to MediKiosk" />
          </h2>
          <p className="mt-1.5 text-sm text-[#5d7c80]">
            <TranslatedText
              text={
                mode === "patient"
                  ? "Use the mobile number linked to your profile."
                  : "Use your authorized medical staff credentials."
              }
            />
          </p>

          {/* Role Mismatch Notice Banner */}
          {location.state?.roleMismatch && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
              <strong className="block font-bold text-amber-950">
                <TranslatedText text="Staff Authentication Required" />
              </strong>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                <TranslatedText
                  text={`The requested URL requires ${
                    location.state?.requiredRoles?.map((r) => ROLE_LABELS[r] || r).join(" or ") || "staff"
                  } privileges. Please sign in with your authorized credentials below.`}
                />
              </p>
              {user && (
                <button
                  type="button"
                  onClick={() => handleNavigate(getRoleDashboardPath(user.role))}
                  className="mt-2.5 inline-flex items-center gap-1 font-bold text-[#0c5e5b] hover:underline cursor-pointer"
                >
                  <span><TranslatedText text={`Return to your ${ROLE_LABELS[user.role] || user.role} Dashboard`} /></span>
                  <RiArrowRightLine className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Full-bleed Seamless Segmented Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#eef5f2] p-1 border border-[#d8e8e2]">
            <button
              type="button"
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "patient"
                  ? "bg-[#0c5e5b] text-white shadow-xs"
                  : "text-[#5d7c80] hover:text-[#0c5e5b]"
              }`}
              onClick={() => handleModeChange("patient")}
            >
              <RiUserLine className="size-4" />
              <TranslatedText text="Patient" />
            </button>
            <button
              type="button"
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "doctor"
                  ? "bg-[#0c5e5b] text-white shadow-xs"
                  : "text-[#5d7c80] hover:text-[#0c5e5b]"
              }`}
              onClick={() => handleModeChange("doctor")}
            >
              <RiStethoscopeLine className="size-4" />
              <TranslatedText text="Doctor" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              <TranslatedText text={error} />
            </div>
          )}

          {/* OTP Sent Message */}
          {otpMessage && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
              <TranslatedText text={otpMessage} />
            </div>
          )}

          <form className="mt-5" onSubmit={submit}>
            {/* Mobile Number for Patient / Identifier for Doctor */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-[#143337] mb-1.5"
              >
                <TranslatedText text={mode === "patient" ? "Mobile number" : "Doctor email or phone"} />{" "}
                <span className="text-[#e06a3b]">*</span>
              </label>
              <input
                id="identifier"
                name="identifier"
                required
                type="text"
                className="h-12 w-full rounded-xl border border-[#d1e2dc] bg-white px-4 text-sm text-[#143337] placeholder:text-[#94a9af] focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#0c5e5b]/20 outline-none transition-colors"
                placeholder={
                  mode === "patient"
                    ? "10-digit mobile number"
                    : "e.g. doctor.sharma@medikiosk.in"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            {/* Patient OTP Field (when requested) */}
            {mode === "patient" && otpRequested && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="otp" className="block text-xs font-semibold text-[#143337]">
                    <TranslatedText text="6-Digit OTP" /> <span className="text-[#e06a3b]">*</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#0c5e5b] hover:underline cursor-pointer"
                    onClick={handleRequestOtp}
                  >
                    <TranslatedText text="Resend code" />
                  </button>
                </div>
                <input
                  id="otp"
                  name="otp"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  className="h-12 w-full rounded-xl border border-[#d1e2dc] bg-white px-4 text-center font-mono text-lg font-bold tracking-[0.3em] text-[#143337] placeholder:text-[#94a9af] focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#0c5e5b]/20 outline-none transition-colors"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <p className="mt-1.5 text-[0.72rem] text-[#5d7c80]">
                  <TranslatedText text="Check backend terminal console for the 6-digit verification code." />
                </p>
              </div>
            )}

            {/* Doctor Password Field (Doctor only) */}
            {mode === "doctor" && (
              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#143337] mb-1.5"
                >
                  <TranslatedText text="Password" /> <span className="text-[#e06a3b]">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    required
                    type={showPassword ? "text" : "password"}
                    className="h-12 w-full rounded-xl border border-[#d1e2dc] bg-white px-4 pr-11 text-sm text-[#143337] placeholder:text-[#94a9af] focus:border-[#0c5e5b] focus:ring-2 focus:ring-[#0c5e5b]/20 outline-none transition-colors"
                    placeholder="Enter doctor password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 p-1 text-[#94a9af] hover:text-[#0c5e5b] transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <RiEyeOffLine className="size-5" />
                    ) : (
                      <RiEyeLine className="size-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Demo Doctor Quick Fill (Doctor only) */}
            {mode === "doctor" && (
              <div className="mt-3.5 rounded-xl border border-[#d8e8e2] bg-[#f8fcfb] p-3 text-xs text-[#5d7c80]">
                <span className="font-semibold text-[#143337]">
                  <TranslatedText text="Quick demo doctor (Password: Doctor@123):" />
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className="rounded-lg border border-[#d1e2dc] bg-white px-2.5 py-1 text-xs font-semibold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer transition-colors shadow-2xs"
                    onClick={() => fillDemoDoctor("doctor.sharma@medikiosk.in")}
                  >
                    Dr. Sharma
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#d1e2dc] bg-white px-2.5 py-1 text-xs font-semibold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer transition-colors shadow-2xs"
                    onClick={() => fillDemoDoctor("doctor.patel@medikiosk.in")}
                  >
                    Dr. Patel
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#d1e2dc] bg-white px-2.5 py-1 text-xs font-semibold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer transition-colors shadow-2xs"
                    onClick={() => fillDemoDoctor("doctor.reddy@medikiosk.in")}
                  >
                    Dr. Reddy
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0c5e5b] text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#084341] cursor-pointer disabled:opacity-60"
            >
              {busy ? (
                <TranslatedText text="Please wait..." />
              ) : mode === "patient" && !otpRequested ? (
                <>
                  <TranslatedText text="Send OTP" />
                  <RiArrowRightLine className="size-4" />
                </>
              ) : (
                <>
                  <TranslatedText text="Login" />
                  <RiArrowRightLine className="size-4" />
                </>
              )}
            </button>

            {/* Bottom Register Prompt */}
            <p className="mt-6 text-center text-xs text-[#5d7c80]">
              <TranslatedText text="New patient?" />{" "}
              <button
                type="button"
                className="font-bold text-[#0c5e5b] hover:underline cursor-pointer"
                onClick={() => handleNavigate("/register")}
              >
                <TranslatedText text="Register here" />
              </button>
            </p>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
