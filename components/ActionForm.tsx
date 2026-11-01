"use client";
import { useFormState, useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";
export interface Field { name: string; label: string; type?: string; autoComplete?: string; defaultValue?: string; required?: boolean }
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">{pending ? "กำลังดำเนินการ…" : label}</button>;
}
export default function ActionForm({ action, fields, submitLabel, hidden = {} }: { action: (s: FormState, f: FormData) => Promise<FormState>; fields: Field[]; submitLabel: string; hidden?: Record<string, string> }) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => (
        <label key={f.name} className="block text-sm"><span className="mb-1 block font-medium">{f.label}</span>
          <input name={f.name} type={f.type ?? "text"} autoComplete={f.autoComplete} defaultValue={f.defaultValue} required={f.required ?? true} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5" />
        </label>
      ))}
      <div aria-live="polite">
        {state.error && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        {state.message && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">{state.message}</p>}
      </div>
      <Submit label={submitLabel} />
    </form>
  );
}
