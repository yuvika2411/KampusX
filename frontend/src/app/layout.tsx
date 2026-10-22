import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "KampusX | Campus Issue Reporting & Resolution for KIET Students",
  description:
    "Empowering KIET students with a transparent, community-backed campus issue reporting and resolution portal. Report concerns, upvote priorities, and track real-time fixes.",
  keywords: [
    "KIET",
    "KampusX",
    "Campus Issue Reporting",
    "KIET Group of Institutions",
    "Student Grievance",
    "Campus Resolution Platform",
    "Hostel Maintenance",
    "College Infrastructure",
  ],
  authors: [{ name: "KampusX KIET Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('kampusx-theme');
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else if (stored === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-page text-ink selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

