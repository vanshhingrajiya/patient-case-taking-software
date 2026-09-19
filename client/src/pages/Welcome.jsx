import { useNavigate } from "react-router-dom";
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiShieldCheckLine,
  RiStethoscopeLine,
  RiUserAddLine,
  RiUserLine,
} from "@remixicon/react";

import { AppShell } from "../components/AppShell";
import { TranslatedText } from "../components/common/TranslatedText";

export function Welcome({ go }) {
  const navigate = useNavigate();

  const handleNavigate = (to) => {
    if (typeof go === "function") {
      go(to);
    } else {
      navigate(to);
    }
  };

  return (
    <AppShell go={handleNavigate}>
      <section className="grid grid-cols-1 items-center gap-12 py-6 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Hero Text */}
        <div>
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#0c5e5b] uppercase">
            <RiStethoscopeLine className="size-4" />
            <span><TranslatedText text="YOUR HEALTH, YOUR WAY" /></span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-[clamp(2.8rem,5.5vw,4.6rem)] font-bold leading-[1.04] tracking-[-0.03em] text-[#143337]">
            <TranslatedText text="Healthcare that" />
            <br />
            <TranslatedText text="listens." />
          </h1>

          {/* Subtitle */}
          <p className="mb-2 text-xl font-bold text-[#143337]">
            <TranslatedText text="Your Smart Healthcare Assistant" />
          </p>

          {/* Description */}
          <p className="mb-8 max-w-md text-base leading-relaxed text-[#5d7c80]">
            <TranslatedText text="Get started with a simple and accessible healthcare experience, made for you." />
          </p>

          {/* Trust Checkmarks */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#143337]">
              <RiCheckboxCircleFill className="size-4 text-[#0c5e5b]" />
              <span><TranslatedText text="Simple to use" /></span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#143337]">
              <RiCheckboxCircleFill className="size-4 text-[#0c5e5b]" />
              <span><TranslatedText text="Your privacy matters" /></span>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Card */}
        <div className="w-full max-w-[460px] rounded-[28px] border border-[#e8f1ed] bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] sm:p-10 lg:ml-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#143337]">
              <TranslatedText text="How would you like to begin?" />
            </h2>
            <p className="mt-1.5 text-sm text-[#5d7c80]">
              <TranslatedText text="Choose an option to continue." />
            </p>
          </div>

          {/* Option 1: Login */}
          <button
            type="button"
            className="group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-[#0c5e5b] bg-white p-4 text-left transition-all duration-150 hover:bg-[#f8fcfb] hover:shadow-xs cursor-pointer"
            onClick={() => handleNavigate("/login")}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e3f3f0] text-[#0c5e5b]">
                <RiUserLine className="size-6" />
              </span>
              <div>
                <strong className="block text-base font-bold text-[#143337]">
                  <TranslatedText text="Login" />
                </strong>
                <span className="block text-xs text-[#5d7c80] mt-0.5">
                  <TranslatedText text="Sign in for patients and medical staff" />
                </span>
              </div>
            </div>
            <RiArrowRightLine className="size-5 shrink-0 text-[#0c5e5b] transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          {/* Option 2: Register Patient */}
          <button
            type="button"
            className="group mt-3.5 flex w-full items-center justify-between gap-4 rounded-2xl border border-[#dcebe5] bg-white p-4 text-left transition-all duration-150 hover:border-[#0c5e5b]/40 hover:bg-[#f8fcfb] hover:shadow-xs cursor-pointer"
            onClick={() => handleNavigate("/register")}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#fef1ec] text-[#e06a3b]">
                <RiUserAddLine className="size-6" />
              </span>
              <div>
                <strong className="block text-base font-bold text-[#143337]">
                  <TranslatedText text="Register patient" />
                </strong>
                <span className="block text-xs text-[#5d7c80] mt-0.5">
                  <TranslatedText text="Create your MediKiosk profile" />
                </span>
              </div>
            </div>
            <RiArrowRightLine className="size-5 shrink-0 text-[#0c5e5b] transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>

          {/* Bottom Security Note */}
          <div className="mt-8 flex items-start gap-3 border-t border-[#edf4f1] pt-6 text-left">
            <RiShieldCheckLine className="mt-0.5 size-4 shrink-0 text-[#0c5e5b]" />
            <div>
              <strong className="block text-xs font-bold text-[#143337]">
                <TranslatedText text="Your information stays private" />
              </strong>
              <span className="mt-0.5 block text-xs text-[#5d7c80]">
                <TranslatedText text="We only collect what helps us care for you." />
              </span>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default Welcome;
