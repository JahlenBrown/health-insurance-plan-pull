import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Health Insurance Plan Pull",
  description:
    "Audits health plan websites against their governing plan documents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">
              Health Insurance Plan Pull
            </a>
            <nav className="flex items-center gap-5">
              <a
                href="/ask"
                className="text-sm text-black/60 dark:text-white/60 hover:underline"
              >
                Ask About Coverage
              </a>
              <a
                href="https://github.com/JahlenBrown/health-insurance-plan-pull"
                className="text-sm text-black/60 dark:text-white/60 hover:underline"
              >
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-black/10 dark:border-white/10 py-6">
          <div className="mx-auto max-w-5xl px-6 text-xs text-black/50 dark:text-white/50">
            Sibling project to call-center-audit -- shared plan-data
            contract, no shared code. This tool never authenticates to any
            member portal.
          </div>
        </footer>
      </body>
    </html>
  );
}
