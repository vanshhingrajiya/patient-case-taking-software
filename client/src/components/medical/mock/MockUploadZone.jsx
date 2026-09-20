import { useState } from "react";
import { RiUploadCloud2Line, RiFileTextLine } from "@remixicon/react";
import { TranslatedText } from "../../../components/common/TranslatedText";

export function MockUploadZone({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    // In a real app, we'd process e.dataTransfer.files
    // For this mock, we'll just simulate getting some files
    simulateFilesAdded();
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateFilesAdded();
    }
  };

  const simulateFilesAdded = () => {
    setSelectedFiles([
      { name: "prescription_dr_gupta.jpg", size: "0.2 MB" },
      { name: "apollo_pharmacy_bill.pdf", size: "0.2 MB" },
      { name: "blood_test_report.pdf", size: "1.3 MB" }
    ]);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          <TranslatedText text="Upload Medical Records" />
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          <TranslatedText text="Upload prescriptions, lab reports, and pharmacy bills all at once. Our AI will automatically sort, date, and digitize them." />
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative mt-8 grid place-items-center rounded-3xl border-2 border-dashed p-12 transition-all ${isDragging
          ? "border-[#0c5e5b] bg-[#e2f2ef]"
          : "border-gray-300 bg-gray-50 hover:border-[#0c5e5b] hover:bg-gray-50/50"
          }`}
      >
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-900/5">
            <RiUploadCloud2Line className={`size-8 ${isDragging ? "text-[#0c5e5b]" : "text-gray-400"}`} />
          </div>
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="mock-file-upload"
              className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[#0c5e5b] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0c5e5b] focus-within:ring-offset-2 hover:text-[#084341]"
            >
              <span>Upload files</span>
              <input id="mock-file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileInput} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">PDF, PNG, JPG up to 10MB each</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Selected Files ({selectedFiles.length})</h3>
          <ul className="mt-4 divide-y divide-gray-100">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <RiFileTextLine className="size-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">{file.size}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onUploadComplete}
              className="rounded-xl bg-[#0c5e5b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#084341]"
            >
              <TranslatedText text="Process Documents with AI" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
