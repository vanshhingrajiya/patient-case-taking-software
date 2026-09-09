import { useState } from "react";
import { RiCloseLine, RiFileEditLine } from "@remixicon/react";
import { Button } from "../ui/button";
import { updateMedicalBundle } from "../../services";

const bundleTypes = ["surgery", "hospitalization", "disease", "treatment", "injury", "other"];

export function MedicalBundleEditDialog({ bundle, onClose, onUpdated }) {
  const [values, setValues] = useState({ title: bundle.title, description: bundle.description || "", bundleType: bundle.bundleType, eventDate: new Date(bundle.eventDate).toISOString().slice(0, 10) });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await updateMedicalBundle(bundle._id, values);
      onUpdated(result.bundle);
    } catch (reason) {
      setError(reason.message || "Unable to update the bundle.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#143337]/35 px-4 py-8 backdrop-blur-sm"><div className="mx-auto max-w-lg rounded-3xl border border-[#d1e2dc] bg-white p-6 shadow-[0_20px_60px_rgba(12,94,91,.2)] sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 text-[0.7rem] font-black tracking-[0.15em] text-[#0c5e5b] uppercase"><RiFileEditLine className="size-4" /> Medical records</span><h2 className="mt-2 text-xl font-bold text-[#142a30]">Update bundle</h2></div><button type="button" aria-label="Close" className="grid size-9 place-items-center rounded-full text-[#556e72] hover:bg-[#e2f2ef] hover:text-[#0c5e5b] cursor-pointer" onClick={onClose}><RiCloseLine className="size-5" /></button></div>{error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</div>}<form className="mt-6 grid gap-4" onSubmit={submit}><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Title<input required value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} className="rounded-xl border border-[#d1e2dc] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0c5e5b]" /></label><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Description<textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} rows="3" className="resize-y rounded-xl border border-[#d1e2dc] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0c5e5b]" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Bundle Type<select value={values.bundleType} onChange={(event) => setValues({ ...values, bundleType: event.target.value })} className="rounded-xl border border-[#d1e2dc] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0c5e5b]">{bundleTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label className="grid gap-1.5 text-xs font-bold text-[#142a30]">Event Date<input required type="date" value={values.eventDate} onChange={(event) => setValues({ ...values, eventDate: event.target.value })} className="rounded-xl border border-[#d1e2dc] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0c5e5b]" /></label></div><div className="mt-2 flex justify-end gap-3"><Button type="button" variant="outline" className="rounded-lg border border-[#d1e2dc] px-5 py-2 text-xs font-bold text-[#0c5e5b] hover:bg-[#e2f2ef] cursor-pointer" onClick={onClose}>Cancel</Button><Button disabled={busy} type="submit" className="rounded-lg bg-[#0c5e5b] px-5 py-2 text-xs font-bold text-white hover:bg-[#084341] cursor-pointer">{busy ? "Saving..." : "Save changes"}</Button></div></form></div></div>;
}
