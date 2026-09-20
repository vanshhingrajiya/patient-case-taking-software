import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { MockUploadZone } from "../../components/medical/mock/MockUploadZone";
import { MockProcessingScreen } from "../../components/medical/mock/MockProcessingScreen";
import { MockDateFallback } from "../../components/medical/mock/MockDateFallback";
import { MockCrossVerification } from "../../components/medical/mock/MockCrossVerification";
import { MockTimeline } from "../../components/medical/mock/MockTimeline";

const FLOW_STATES = {
  UPLOAD: "UPLOAD",
  PROCESSING: "PROCESSING",
  DATE_FALLBACK: "DATE_FALLBACK",
  CROSS_VERIFICATION: "CROSS_VERIFICATION",
  TIMELINE: "TIMELINE",
};

export function MedicalHistory() {
  const [currentState, setCurrentState] = useState(FLOW_STATES.UPLOAD);
  const [extractedDate, setExtractedDate] = useState(null);

  // Flow handlers
  const handleUploadComplete = () => {
    setCurrentState(FLOW_STATES.PROCESSING);
  };

  const handleProcessingComplete = () => {
    // Artificial pause before asking for date
    setCurrentState(FLOW_STATES.DATE_FALLBACK);
  };

  const handleDateConfirmed = (date) => {
    setExtractedDate(date);
    setCurrentState(FLOW_STATES.CROSS_VERIFICATION);
  };

  const handleVerificationComplete = () => {
    setCurrentState(FLOW_STATES.TIMELINE);
  };

  const handleReset = () => {
    setCurrentState(FLOW_STATES.UPLOAD);
    setExtractedDate(null);
  };

  return (
    <DashboardLayout title="Medical History">
      <div className="py-6 sm:py-8">
        {currentState === FLOW_STATES.UPLOAD && (
          <MockUploadZone onUploadComplete={handleUploadComplete} />
        )}
        
        {currentState === FLOW_STATES.PROCESSING && (
          <MockProcessingScreen onProcessingComplete={handleProcessingComplete} />
        )}

        {currentState === FLOW_STATES.DATE_FALLBACK && (
          <div className="flex min-h-[60vh] items-center justify-center">
             <MockDateFallback onDateConfirmed={handleDateConfirmed} />
          </div>
        )}

        {currentState === FLOW_STATES.CROSS_VERIFICATION && (
          <MockCrossVerification onVerificationComplete={handleVerificationComplete} />
        )}

        {currentState === FLOW_STATES.TIMELINE && (
          <MockTimeline onReset={handleReset} />
        )}
      </div>
    </DashboardLayout>
  );
}

export default MedicalHistory;
