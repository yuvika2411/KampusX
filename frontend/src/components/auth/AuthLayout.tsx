import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden bg-page text-ink">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hero-glow pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dot-pattern pointer-events-none" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-4">
        <Link href="/" aria-label="KampusX home" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-indigo-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/20"><ShieldAlert size={21} /></span>
          <span className="text-xl font-extrabold tracking-tight">Kampus<span className="text-brand-gradient">X</span></span>
        </Link>
        <ThemeToggle />
      </header>
      <main id="main-content" className="mx-auto flex w-full max-w-md flex-col px-5 pb-12 pt-6 sm:pt-0">
        <Link href="/" className="mb-6 inline-flex w-fit items-center gap-2 rounded text-sm text-mute transition-colors hover:text-ink sm:mb-4"><ArrowLeft size={15} />Back to home</Link>
        <div className="rounded-3xl border border-line bg-card p-6 shadow-xl shadow-indigo-950/5 sm:p-8">{children}</div>
        <p className="mt-7 text-center text-xs text-mute">Your campus. Your voice. Real change.</p>
      </main>
    </div>
  );
}
