import { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine, RiCheckLine, RiQuestionAnswerLine } from "@remixicon/react";
import { useLanguage, SUPPORTED_LANGUAGES } from "../context/LanguageContext";

/**
 * Official Bhashini Logo Component
 */
function BhashiniLogo({ className = "h-4" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Tricolor leaf / flame motif */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 shrink-0"
      >
        {/* Saffron petal */}
        <path
          d="M12 2C12 2 15 5.5 15 8.5C15 10.2 13.7 11.5 12 11.5C10.3 11.5 9 10.2 9 8.5C9 5.5 12 2 12 2Z"
          fill="#FF9933"
        />
        {/* Blue center wheel */}
        <circle cx="12" cy="13.5" r="2" fill="#000080" />
        {/* Green petal */}
        <path
          d="M12 22C12 22 9 18.5 9 15.5C9 13.8 10.3 12.5 12 12.5C13.7 12.5 15 13.8 15 15.5C15 18.5 12 22 12 22Z"
          fill="#138808"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-black tracking-wider text-[#0c3974] uppercase">
          BHASHINI
        </span>
      </div>
    </div>
  );
}

export function LanguageSelector({ className = "" }) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const getDisplayName = (lang) => {
    if (lang.code === "en") return "English";
    return `${lang.name} (${lang.nativeName})`;
  };

  const handleSelectLanguage = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div
      className={`notranslate relative inline-block text-left ${className}`}
      data-notranslate="true"
      data-bhashini-skip="true"
      ref={dropdownRef}
    >
      {/* Top Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-2 rounded-xl border border-[#d1e2dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#143337] shadow-2xs transition-all hover:border-[#0c5e5b] hover:bg-[#f2f8f6] focus:outline-hidden focus:ring-2 focus:ring-[#0c5e5b]/20 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Bhashini Language Translation"
      >
        {/* Devanagari अ and English A Icon */}
        <span className="flex items-center gap-0.5 rounded-md bg-[#fff7ed] px-1.5 py-0.5 border border-[#fed7aa] text-[11px] font-bold">
          <span className="text-[#ea580c]">अ</span>
          <span className="text-gray-300">/</span>
          <span className="text-[#0c5e5b]">A</span>
        </span>

        {/* Selected Language Display (Instant update) */}
        <span className="font-semibold text-gray-800">
          {activeLang.code === "en" ? "English" : activeLang.nativeName || activeLang.name}
        </span>

        {/* Dropdown Chevron */}
        <RiArrowDownSLine
          className={`size-4 text-[#ea580c] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-68 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 focus:outline-hidden animate-fadeIn overflow-hidden">
          {/* Language Options List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1 scrollbar-thin">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#e2f2ef] font-bold text-[#0c5e5b]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#0c5e5b]"
                  }`}
                >
                  <span className="leading-snug">{getDisplayName(lang)}</span>
                  {isSelected && (
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-[#0c5e5b] text-white shrink-0 ml-2">
                      <RiCheckLine className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Official "Powered by BHASHINI" Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-[#fafcfb] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <RiQuestionAnswerLine className="size-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-800">
                Powered by
              </span>
            </div>
            <BhashiniLogo />
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;

