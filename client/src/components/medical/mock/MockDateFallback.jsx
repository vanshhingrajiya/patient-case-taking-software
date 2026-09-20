import { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { TranslatedText } from "../../../components/common/TranslatedText";

export function MockDateFallback({ onDateConfirmed }) {
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDate) {
      onDateConfirmed(selectedDate);
    }
  };

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl">
      <div className="bg-orange-50 px-6 py-8 text-center sm:px-12 sm:py-10">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          <TranslatedText text="Undated Document Detected" />
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          <TranslatedText text="Our AI could not find a date on 'prescription_dr_gupta.jpg'. To place this accurately on your timeline, we need a little help." />
        </p>
      </div>

      <div className="px-6 py-8 sm:px-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              <TranslatedText text="Roughly when was this?" />
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="size-5 text-gray-400" />
              </div>
              <input
                type="month"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0c5e5b] sm:text-sm sm:leading-6"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">An approximate month and year is fine.</p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => onDateConfirmed("Unknown Date")}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Skip (Mark as Unknown)
            </button>
            <button
              type="submit"
              disabled={!selectedDate}
              className="flex-1 rounded-xl bg-[#0c5e5b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#084341] disabled:opacity-50"
            >
              Confirm Date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
