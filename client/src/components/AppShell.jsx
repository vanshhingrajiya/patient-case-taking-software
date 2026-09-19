import { useNavigate } from "react-router-dom";
import { RiHeartPulseLine, RiShieldCheckLine } from "@remixicon/react";
import { LanguageSelector } from "./LanguageSelector";
import { TranslatedText } from "./common/TranslatedText";

export function AppShell({ children, go }) {
  const navigate = useNavigate();

  const handleHome = () => {
    if (typeof go === "function") {
      go("/");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f9f7] text-[#143337] antialiased">
      {/* Top Header */}
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-7">
        <button
          type="button"
          className="group inline-flex items-center gap-2.5 bg-transparent text-left transition hover:opacity-90 cursor-pointer"
          onClick={handleHome}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#0c5e5b] text-white shadow-xs transition-transform group-hover:scale-105">
            <RiHeartPulseLine className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#0c5e5b]">
            MediKiosk
          </span>
        </button>

        <div className="flex items-center gap-3.5">
          <LanguageSelector />
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#5d7c80]">
            <RiShieldCheckLine className="size-4 text-[#0c5e5b]" />
            <span><TranslatedText text="Private & secure" /></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col justify-center px-6 pb-12">
        {children}
      </main>
    </div>
  );
}

export default AppShell;