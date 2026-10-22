"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Mail, KeyRound, UserRound, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { authService, emailError, safeNext } from "@/lib/auth";
import { Field, OtpInput, Submit } from "./AuthFields";

type Mode = "login" | "register" | "register-otp" | "login-otp" | "forgot" | "reset";
type Values = { email: string; password: string; confirmPassword: string; name: string; otp: string };
type Errors = Partial<Record<keyof Values, string>>;
const copy: Record<Mode, { title: string; subtitle: string }> = {
  login: { title: "Welcome back", subtitle: "Sign in to continue to KampusX" },
  register: { title: "Join KampusX", subtitle: "Make your campus voice count" },
  "register-otp": { title: "Verify your email", subtitle: "One step closer to joining your campus community" },
  "login-otp": { title: "Check your inbox", subtitle: "Enter your code to finish signing in" },
  forgot: { title: "Forgot your password?", subtitle: "Let’s help you get back to your campus" },
  reset: { title: "Choose a new password", subtitle: "Enter your email code and a new password" },
};

export default function AuthFlow({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));
  const [values, setValues] = useState<Values>({ email: params.get("email") || "", password: "", confirmPassword: "", name: "", otp: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const notice = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const isOtp = mode === "register-otp" || mode === "login-otp";
  const complete = mode === "register-otp" && verified;
  const passwordFields = mode === "login" || mode === "reset" || complete;
  const confirmation = mode === "reset" || complete;
  const normalizedEmail = values.email.trim().toLowerCase();
  const loginHref = `/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
  const registerHref = `/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
  function path(route: string) { return `${route}?${new URLSearchParams({ email: normalizedEmail, next })}`; }
  function change(key: keyof Values, value: string) {
    setValues(v => ({ ...v, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
    setMessage(""); setSuccess("");
  }

  useEffect(() => {
    if (!retryAt) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick(); const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [retryAt]);

  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setMessage(""); setSuccess("");
    try { await action(); }
    catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      requestAnimationFrame(() => notice.current?.focus());
    } finally { pending.current = false; setBusy(false); }
  }

  function validate() {
    const result: Errors = {};
    const invalidEmail = emailError(values.email);
    if (invalidEmail) result.email = invalidEmail;
    if (passwordFields && !values.password) result.password = "Enter your password.";
    else if (confirmation && values.password.length < 8) result.password = "Use at least 8 characters.";
    if (confirmation && values.confirmPassword !== values.password) result.confirmPassword = "Passwords do not match.";
    else if (confirmation && !values.confirmPassword) result.confirmPassword = "Confirm your password.";
    if (complete && !values.name.trim()) result.name = "Enter your full name.";
    if (((isOtp && !complete) || mode === "reset") && !/^\d{6}$/.test(values.otp)) result.otp = "Enter all 6 digits of your code.";
    setErrors(result);
    if (Object.keys(result).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus());
      return false;
    }
    return true;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    await run(async () => {
      if (mode === "login") {
        await authService.requestLoginCode({ email: normalizedEmail, password: values.password });
        setValues(v => ({ ...v, password: "" }));
        router.push(path("/login/verify-otp"));
      } else if (mode === "register") {
        await authService.requestRegistrationCode(normalizedEmail);
        router.push(path("/verify-otp"));
      } else if (complete) {
        await authService.completeRegistration({ name: values.name.trim(), email: normalizedEmail, password: values.password, confirmPassword: values.confirmPassword });
        setValues(v => ({ ...v, password: "", confirmPassword: "" }));
        setSuccess("Your account is ready. You can now sign in.");
      } else if (mode === "register-otp") {
        await authService.verifyRegistrationCode({ email: normalizedEmail, otp: values.otp });
        setVerified(true); setSuccess("Email verified. Complete your account below.");
      } else if (mode === "login-otp") {
        await authService.verifyLoginCode({ email: normalizedEmail, otp: values.otp });
        // Session establishment belongs to the API integration task.
        setSuccess("Your code has been verified.");
      } else if (mode === "forgot") {
        await authService.requestPasswordCode(normalizedEmail);
        router.push(path("/reset-password"));
      } else {
        await authService.resetPassword({ email: normalizedEmail, otp: values.otp, newPassword: values.password, confirmPassword: values.confirmPassword });
        setValues(v => ({ ...v, password: "", confirmPassword: "", otp: "" }));
        setSuccess("Your password has been updated. You can now sign in.");
      }
    });
  }

  async function resend() {
    const invalidEmail = emailError(values.email);
    if (invalidEmail) { setErrors({ email: invalidEmail }); form.current?.querySelector<HTMLInputElement>('[name="email"]')?.focus(); return; }
    await run(async () => {
      if (mode === "login-otp") {
        // Login code requests require the password. Never retain it across routes.
        router.push(loginHref);
        return;
      }
      if (mode === "reset") await authService.requestPasswordCode(normalizedEmail);
      else await authService.requestRegistrationCode(normalizedEmail);
      setRetryAt(Date.now() + 60_000); setRemaining(60);
      setSuccess("A new code has been requested. Check your inbox.");
    });
  }

  const Icon = complete ? UserRound : isOtp || mode === "reset" ? Mail : mode === "forgot" ? KeyRound : UserRound;
  const title = complete ? "Make it yours" : copy[mode].title;
  const subtitle = complete ? "Add your details to complete your account" : copy[mode].subtitle;
  const button = complete ? "Create account" : mode === "register" ? "Send verification code" : mode === "forgot" ? "Send reset code" : mode === "reset" ? "Reset password" : isOtp ? "Verify code" : "Continue";
  return <>
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-soft text-indigo-500"><Icon size={23} strokeWidth={1.7} /></div>
    <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
    <p className="mt-2 text-sm leading-relaxed text-mute">{subtitle}</p>
    {isOtp && !complete && normalizedEmail && <p className="mt-3 break-all text-sm font-medium text-ink">Verifying {normalizedEmail}</p>}
    <div className="mt-7">
      {message && <div ref={notice} tabIndex={-1} role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/5 p-3 text-sm text-ink outline-none"><CircleAlert size={17} className="mt-0.5 shrink-0 text-red-500" /><span>{message}</span></div>}
      {success && <div role="status" className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm"><CircleCheck size={17} className="mt-0.5 shrink-0 text-emerald-500" /><span>{success}</span></div>}
      <form ref={form} onSubmit={submit} noValidate className="space-y-5" aria-busy={busy}>
        {complete && <Field label="Full name" name="name" autoComplete="name" placeholder="Your full name" value={values.name} onChange={e => change("name", e.target.value)} error={errors.name} required maxLength={100} />}
        <Field label="Institutional email" name="email" type="email" autoComplete="email" placeholder="you@kiet.edu" value={values.email} onChange={e => change("email", e.target.value)} error={errors.email} readOnly={complete} hint={mode === "register" ? "Use your KIET institutional email address." : undefined} required />
        {((isOtp && !complete) || mode === "reset") && <OtpInput value={values.otp} onChange={v => change("otp", v)} error={errors.otp} />}
        {passwordFields && <Field label={mode === "reset" ? "New password" : "Password"} name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={confirmation ? "At least 8 characters" : "Enter your password"} value={values.password} onChange={e => change("password", e.target.value)} error={errors.password} hint={confirmation ? "Use at least 8 characters." : undefined} required />}
        {confirmation && <Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={values.confirmPassword} onChange={e => change("confirmPassword", e.target.value)} error={errors.confirmPassword} required />}
        {mode === "login" && <div className="text-right"><Link href="/forgot-password" className="auth-link text-xs">Forgot password?</Link></div>}
        <Submit busy={busy}>{button}</Submit>
      </form>
      {((isOtp && !complete) || mode === "reset") && <div className="mt-5 text-center text-xs text-mute">
        <p>Didn’t receive a code?</p>
        <button type="button" disabled={busy || remaining > 0} onClick={resend} className="auth-link mt-2 inline-flex min-h-8 items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle size={13} className="animate-spin" /> : null}{remaining > 0 ? `Resend in ${remaining}s` : mode === "login-otp" ? "Sign in again to resend code" : "Resend code"}</button>
      </div>}
      {(mode === "register" || mode === "login" || mode === "forgot") && <div className="mt-5 text-center text-xs"><Link href={mode === "register" ? path("/verify-otp") : mode === "login" ? path("/login/verify-otp") : path("/reset-password")} className="text-mute underline decoration-line underline-offset-4 hover:text-ink">Already have a code? {mode === "forgot" ? "Reset password" : "Enter code"}</Link></div>}
    </div>
    <div className="mt-7 border-t border-line pt-6 text-center text-sm text-mute">
      {mode === "login" ? <>New to KampusX? <Link href={registerHref} className="auth-link">Create an account</Link></> : mode === "register" || complete ? <>Already have an account? <Link href={loginHref} className="auth-link">Sign in</Link></> : <Link href={mode === "register-otp" ? registerHref : loginHref} className="inline-flex items-center gap-1.5 hover:text-ink"><ArrowLeft size={14} />{mode === "register-otp" ? "Back to registration" : "Back to sign in"}</Link>}
    </div>
  </>;
}
