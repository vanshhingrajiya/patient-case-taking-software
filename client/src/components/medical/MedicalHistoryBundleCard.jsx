import { RiDeleteBinLine, RiEditLine, RiEyeLine, RiFileTextLine } from "@remixicon/react";
import { Button } from "../ui/button";

const documentCategories = [["Prescription", "prescription"], ["Medical Report", "report"], ["Summary", "summary"]];

export function MedicalHistoryBundleCard({ bundle, onDeleteBundle, onUpdate, onViewBundle }) {
  return (
    <article className="flex h-[19rem] min-h-0 flex-col rounded-2xl border border-[#d1e2dc] bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="line-clamp-2 font-bold text-[#142a30]">{bundle.title}</h3>
          <p className="mt-1 text-xs font-medium text-[#0c5e5b]">{bundle.bundleType} · {new Date(bundle.eventDate).toLocaleDateString()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1"><span className="rounded-full bg-[#e2f2ef] px-2.5 py-1 text-[0.68rem] font-bold text-[#0c5e5b]">{(bundle.documents || []).length} {(bundle.documents || []).length === 1 ? "document" : "documents"}</span>{onUpdate && <Button type="button" variant="ghost" aria-label="Update bundle" className="grid size-7 place-items-center rounded-lg p-0 text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onUpdate(bundle)}><RiEditLine className="size-4" /></Button>}{onDeleteBundle && <Button type="button" variant="ghost" aria-label="Delete bundle" className="grid size-7 place-items-center rounded-lg p-0 text-[#8a5555] hover:bg-red-50 hover:text-red-700 cursor-pointer" onClick={() => onDeleteBundle(bundle._id)}><RiDeleteBinLine className="size-4" /></Button>}</div>
      </div>
      {bundle.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#556e72]">{bundle.description}</p>}
      <div className="mt-4 grid gap-2">
        {documentCategories.map(([label, type]) => {
          const count = (bundle.documents || []).filter((document) => document.documentType === type).length;
          return <div key={type} className="flex items-center justify-between rounded-xl border border-[#d1e2dc] bg-[#f7fbf9] px-3 py-2"><span className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#142a30]"><RiFileTextLine className="size-4 shrink-0 text-[#0c5e5b]" />{label}</span><span className="shrink-0 text-xs font-medium text-[#556e72]">{count} {count === 1 ? "document" : "documents"}</span></div>;
        })}
      </div>
      <Button type="button" variant="outline" className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#b8d5ce] bg-white px-3 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={() => onViewBundle(bundle)}><RiEyeLine className="size-4" /> View Documents</Button>
    </article>
  );
}