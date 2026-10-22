import type { Metadata } from "next";
import { Suspense } from "react";
import AuthFlow from "@/components/auth/AuthFlow";
export const metadata: Metadata = { title: "Reset password | KampusX" };
export default function Page() {
  return <Suspense fallback={<p role="status" className="py-12 text-center text-sm text-mute">Loading…</p>}><AuthFlow mode="reset" /></Suspense>;
}
