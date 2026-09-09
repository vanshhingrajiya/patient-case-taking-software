import { RiAddLine, RiCloseLine, RiFileTextLine } from "@remixicon/react";
import { Button } from "../ui/button";

export function DocumentUploadSection({ label, type, files, onAdd, onRemove }) {
  const inputId = `medical-documents-${type}`;

  return (
    <div className="rounded-2xl border border-[#d1e2dc] bg-[#f7fbf9] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#142a30]">{label}</h3>
          <p className="mt-1 text-xs text-[#556e72]">PDF, JPG, JPEG, or PNG</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#b8d5ce] bg-white px-3 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <RiAddLine className="size-4" />
          Add More
        </Button>
        <input
          id={inputId}
          className="hidden"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          multiple
          onChange={(event) => {
            onAdd(Array.from(event.target.files || []));
            event.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 grid gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#d1e2dc] bg-white px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-[#556e72]"><RiFileTextLine className="size-4 shrink-0 text-[#0c5e5b]" /><span className="truncate">{file.name}</span></span>
              <button type="button" aria-label={`Remove ${file.name}`} className="grid size-7 shrink-0 place-items-center rounded-full text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={() => onRemove(index)}><RiCloseLine className="size-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}