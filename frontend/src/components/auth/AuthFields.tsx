"use client";

import { useRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";

export function Field({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  const password = props.type === "password";
  const id = props.id || props.name!;
  return <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">{label}</label>
    <div className="relative">
      <input {...props} id={id} type={password && visible ? "text" : props.type} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className={`auth-input ${password ? "pr-12" : ""}`} />
      {password && <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-mute hover:text-ink focus-visible:outline-2 focus-visible:outline-indigo-500">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
    </div>
    {error ? <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p> : hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-mute">{hint}</p> : null}
  </div>;
}

export function Submit({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 disabled:cursor-wait disabled:opacity-65">{busy ? <><LoaderCircle size={18} className="animate-spin" />Please wait…</> : <>{children}<ArrowRight size={17} /></>}</button>;
}

export function OtpInput({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  function update(index: number, text: string) {
    const clean = text.replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    if (!clean) next[index] = "";
    else clean.split("").forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
    // Spaces preserve digit positions when editing or deleting in the middle.
    onChange(next.map(d => d || " ").join(""));
    if (clean) refs.current[Math.min(index + clean.length, 5)]?.focus();
  }
  return <fieldset aria-describedby={error ? "otp-error" : "otp-hint"}>
    <legend className="mb-2 text-sm font-semibold">Verification code</legend>
    <div className="flex gap-1.5 sm:gap-2" onPaste={e => { e.preventDefault(); update(0, e.clipboardData.getData("text")); }}>
      {digits.map((digit, i) => <input key={i} ref={el => { refs.current[i] = el; }} value={digit.trim()} onChange={e => update(i, e.target.value)} onFocus={e => e.target.select()} onKeyDown={e => {
        if (e.key === "Backspace" && !digit.trim() && i > 0) { e.preventDefault(); update(i - 1, ""); refs.current[i - 1]?.focus(); }
        if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); refs.current[i - 1]?.focus(); }
        if (e.key === "ArrowRight" && i < 5) { e.preventDefault(); refs.current[i + 1]?.focus(); }
      }} type="text" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={6} aria-label={`Digit ${i + 1} of 6`} aria-invalid={!!error} className="auth-input min-w-0 flex-1 px-0 text-center text-xl font-semibold tabular-nums" />)}
    </div>
    {error ? <p id="otp-error" className="mt-2 text-xs text-red-600">{error}</p> : <p id="otp-hint" className="mt-2 text-xs text-mute">Enter the 6-digit code from your email.</p>}
  </fieldset>;
}
