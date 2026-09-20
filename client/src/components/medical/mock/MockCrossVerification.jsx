import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { TranslatedText } from "../../../components/common/TranslatedText";
import precImage from "../../../assets/prec.jpeg";

export function MockCrossVerification({ onVerificationComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => setStage(1), 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <TranslatedText text="Handwriting Cross-Verification" />
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <TranslatedText text="Comparing handwritten prescription with pharmacy bill to ensure 100% accuracy." />
          </p>
        </div>
        {stage === 1 && (
          <button
            onClick={onVerificationComplete}
            className="rounded-xl bg-[#0c5e5b] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#084341]"
          >
            <TranslatedText text="Confirm & Continue" />
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Source 1: Prescription */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Source 1: Handwritten Prescription</h3>
          </div>
          <div className="p-6 bg-gray-50 flex-1 flex flex-col items-center justify-center">
            {/* Mock handwritten snippet visual */}
            <div className="w-full max-w-xs -rotate-1">
              <img src={precImage} alt="Handwritten Prescription" className="w-full rounded shadow-sm border border-gray-200" />
            </div>
            
            <div className="mt-8 w-full">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Initial OCR Reading</h4>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 relative">
                <AlertTriangle className="absolute top-4 right-4 size-5 text-red-400" />
                <p className="text-sm font-medium text-red-900 line-through decoration-red-400">Amoxcillin 62mg</p>
                <p className="mt-1 text-xs text-red-700">Low confidence reading due to cursive writing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source 2: Pharmacy Bill */}
        <div className="rounded-2xl border border-[#d1e2dc] bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#e2f2ef] px-4 py-3 border-b border-[#d1e2dc] flex justify-between items-center">
            <h3 className="text-sm font-semibold text-[#0c5e5b]">Source 2: Pharmacy Bill</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-white text-[#0c5e5b] rounded-full">High Confidence</span>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center">
             {/* Mock printed bill visual */}
             <div className="w-full max-w-xs p-4 bg-white rounded shadow-sm border border-gray-200 font-mono text-sm text-gray-800">
              <p className="border-b border-dashed border-gray-300 pb-2 mb-2 text-center">APOLLO PHARMACY</p>
              <div className="flex justify-between"><span>AMOXYCLAV 625MG</span><span>QTY: 15</span></div>
              <div className="flex justify-between mt-1"><span>PARACETAMOL 500</span><span>QTY: 10</span></div>
            </div>

            <div className="mt-8 w-full transition-all duration-1000 ease-in-out">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verification Result</h4>
              {stage === 0 ? (
                <div className="flex items-center justify-center py-6 text-gray-400 animate-pulse">
                  <ShieldCheck className="size-6 mr-2" />
                  <span className="text-sm font-medium">Cross-referencing sources...</span>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 relative animate-in fade-in slide-in-from-bottom-4">
                  <CheckCircle2 className="absolute top-4 right-4 size-5 text-green-600" />
                  <p className="text-sm font-bold text-green-900 flex items-center gap-2">
                    Amoxyclav 625mg
                    <span className="text-xs font-normal bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Auto-corrected</span>
                  </p>
                  <p className="mt-1 text-xs text-green-700">Matched successfully against printed bill.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
