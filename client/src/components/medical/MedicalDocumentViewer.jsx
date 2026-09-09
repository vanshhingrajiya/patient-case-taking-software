import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiFileTextLine } from "@remixicon/react";
import { Button } from "../ui/button";

export function MedicalDocumentViewer({ document, onDelete, onUpdate, onView }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#d1e2dc] bg-white px-3 py-2 text-xs">
      <button type="button" className="flex min-w-0 items-center gap-2 text-left text-[#0c5e5b] hover:underline cursor-pointer" onClick={() => onView(document)}>
        <RiFileTextLine className="size-4 shrink-0" />
        <span className="truncate">{document.originalFileName}</span>
      </button>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" aria-label={`View ${document.originalFileName}`} className="grid size-7 place-items-center rounded-lg p-0 text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onView(document)}><RiEyeLine className="size-4" /></Button>
        {onUpdate && <Button type="button" variant="ghost" aria-label={`Update ${document.originalFileName}`} className="grid size-7 place-items-center rounded-lg p-0 text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onUpdate(document)}><RiEditLine className="size-4" /></Button>}
        {onDelete && <Button type="button" variant="ghost" aria-label={`Delete ${document.originalFileName}`} className="grid size-7 place-items-center rounded-lg p-0 text-[#8a5555] hover:bg-red-50 hover:text-red-700 cursor-pointer" onClick={() => onDelete(document._id)}><RiDeleteBinLine className="size-4" /></Button>}
      </div>
    </div>
  );
}