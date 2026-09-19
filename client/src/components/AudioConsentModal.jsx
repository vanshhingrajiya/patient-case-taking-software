import { useState, useEffect, useRef } from "react";
import { RiMicFill, RiMicOffFill, RiCheckLine, RiCloseLine, RiVolumeUpFill } from "@remixicon/react";
import { generateBhashiniAudio, processBhashiniVoiceConsent } from "../services/auth.service";
import toast from "react-hot-toast";

export function AudioConsentModal({ isOpen, onClose, onConsent, language = "en" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const consentText =
    "Do you consent to sharing your personal and health information for receiving MediKiosk healthcare services under Ayushman Bharat Digital Mission guidelines?";

  useEffect(() => {
    if (isOpen) {
      playAudioPrompt();
    } else {
      stopAll();
    }
    return stopAll;
  }, [isOpen]);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setTranscript("");
  };

  const playAudioPrompt = async () => {
    try {
      setIsPlaying(true);
      const res = await generateBhashiniAudio(consentText, language);
      if (res.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${res.audioBase64}`;
        if (!audioRef.current) {
          audioRef.current = new Audio(audioSrc);
        } else {
          audioRef.current.src = audioSrc;
        }
        audioRef.current.onended = () => setIsPlaying(false);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Failed to play audio prompt", error);
      setIsPlaying(false);
      // Fallback: Just let them read the text if audio fails
    }
  };

  const startRecording = async () => {
    try {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleVoiceProcessing(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript("");
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Microphone access is required for voice consent.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleVoiceProcessing = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const base64Audio = await convertBlobToBase64(audioBlob);
      const res = await processBhashiniVoiceConsent(base64Audio, language);

      setTranscript(res.transcribedText || "");

      if (res.consentGranted) {
        toast.success("Voice consent accepted!");
        setTimeout(() => onConsent(true), 1500);
      } else {
        toast.error(`Consent not detected. You said: "${res.transcribedText}". Please try again or use buttons.`);
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      toast.error("Failed to process voice. Please tap 'I Agree' manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4 relative overflow-hidden">
        {/* Animated background element for recording state */}
        {isRecording && (
          <div className="absolute inset-0 bg-red-50/50 animate-pulse pointer-events-none" />
        )}

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#143337]">Patient Consent Required</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <RiCloseLine className="size-5" />
            </button>
          </div>

          <div className="mb-6 rounded-xl bg-blue-50/50 p-4 border border-blue-100 relative">
            <p className="text-sm leading-relaxed text-[#143337] font-medium">{consentText}</p>
            {isPlaying && (
              <div className="absolute top-2 right-2">
                <RiVolumeUpFill className="size-5 text-blue-500 animate-pulse" />
              </div>
            )}
          </div>

          <div className="mb-6 flex flex-col items-center justify-center gap-3 border-y border-gray-100 py-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`group relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${isRecording
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {isRecording && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              )}
              {isRecording ? <RiMicOffFill className="size-8 relative z-10" /> : <RiMicFill className="size-8 relative z-10" />}
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#143337]">
                {isRecording ? "Listening... Tap to stop" : isProcessing ? "Processing voice..." : "Tap to speak your answer"}
              </p>
              <p className="text-xs text-gray-500 mt-1">(e.g., "Yes", "I Agree")</p>
            </div>
            {transcript && (
              <p className="mt-2 text-xs italic text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                You said: "{transcript}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onConsent(false)}
              disabled={isRecording || isProcessing}
              className="flex-1 rounded-xl border-2 border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              I Disagree
            </button>
            <button
              onClick={() => onConsent(true)}
              disabled={isRecording || isProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0c5e5b] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#084341] disabled:opacity-50 cursor-pointer"
            >
              <RiCheckLine className="size-4" />
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
