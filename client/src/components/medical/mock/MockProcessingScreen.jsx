import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { TranslatedText } from "../../../components/common/TranslatedText";

const steps = [
  { id: "upload", label: "Uploading documents..." },
  { id: "ocr", label: "Running multilingual OCR extraction..." },
  { id: "date", label: "Extracting temporal data..." },
  { id: "verify", label: "Cross-verifying medications..." },
  { id: "summary", label: "AI summarizing case..." },
];

export function MockProcessingScreen({ onProcessingComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let timeout;
    
    if (currentStepIndex < steps.length) {
      // Simulate realistic variable processing times for different AI steps
      let delay = 1000;
      if (currentStepIndex === 0) delay = 3500; // Uploading takes longer
      else if (currentStepIndex === 1) delay = 4500; // OCR takes the longest
      else if (currentStepIndex === 2) delay = 1200; // Date extraction is fast
      else if (currentStepIndex === 3) delay = 2000; // Verification takes a bit
      else if (currentStepIndex === 4) delay = 2500; // Summarization

      timeout = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, delay);
    } else {
      // Finished all steps
      timeout = setTimeout(() => {
        onProcessingComplete();
      }, 800);
    }

    return () => clearTimeout(timeout);
  }, [currentStepIndex, onProcessingComplete]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl bg-white px-6 py-16 shadow-2xs border border-gray-100">
      <div className="relative mb-8 flex size-24 items-center justify-center rounded-full bg-[#e2f2ef]">
        {currentStepIndex < steps.length ? (
          <Loader2 className="size-12 animate-spin text-[#0c5e5b]" />
        ) : (
          <CheckCircle2 className="size-12 text-[#0c5e5b]" />
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900">
        <TranslatedText text="Processing with AI" />
      </h3>
      <p className="mt-2 text-center text-sm text-gray-500">
        <TranslatedText text="Please wait while our system analyzes your uploaded documents." />
      </p>

      <div className="mt-10 w-full space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-[#0c5e5b] text-white"
                    : isActive
                    ? "border-2 border-[#0c5e5b] text-[#0c5e5b]"
                    : "border-2 border-gray-200 text-gray-300"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <span className="text-[10px] font-bold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCompleted
                    ? "text-gray-900"
                    : isActive
                    ? "text-[#0c5e5b]"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <span className="ml-auto">
                  <span className="flex size-2">
                    <span className="absolute inline-flex size-2 animate-ping rounded-full bg-[#0c5e5b] opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-[#0c5e5b]"></span>
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
