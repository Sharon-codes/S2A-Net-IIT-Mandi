import type { Metadata } from "next";
import "./globals.css";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Surface2Anatomy | 3D Internal Anatomy Localization",
  description: "Real-time 3D localization of 104 internal anatomical targets directly from external patient body geometry using deep cross-attention transformer decoders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-background text-text-main antialiased selection:bg-primary/20 selection:text-primary-dark">
        <Header />
        <main className="flex-grow">{children}</main>
        <footer className="border-t border-border bg-white py-8 mt-12 text-sm text-text-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-main">Surface2Anatomy Research Project</span>
              <span className="text-xs">
                Deep multi-scale point cloud cross-attention with frozen canonical alignment.
              </span>
            </div>
            <div className="text-xs text-center md:text-right text-text-muted max-w-md">
              Universal Disclaimer: This software is an experimental scientific research prototype and is not FDA/CE cleared or intended for clinical diagnosis, surgery, or procedural execution.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
