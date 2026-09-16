"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ShieldCheck, Box } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_INFERENCE_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(3000) })
      .then((res) => {
        if (res.ok) setApiOnline(true);
        else setApiOnline(false);
      })
      .catch(() => setApiOnline(false));
  }, []);

  const navLinks = [
    { name: "3D Demo", href: "/demo" },
    { name: "Methodology", href: "/method" },
    { name: "Target Catalog", href: "/targets" },
    { name: "Validation & Ablations", href: "/validation" },
    { name: "Team", href: "/team" },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 text-text-main font-semibold text-lg tracking-tight hover:opacity-90">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-primary-dark">Surface2Anatomy</span>
              <span className="text-xs text-text-muted ml-2 font-mono px-1.5 py-0.5 rounded bg-background border border-border">
                v1.2-104T
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-background text-primary-dark font-semibold border border-border"
                      : "text-text-muted hover:text-text-main hover:bg-background/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full border border-border bg-background">
            <span
              className={`w-2 h-2 rounded-full ${
                apiOnline === true
                  ? "bg-accent-green animate-pulse"
                  : apiOnline === false
                  ? "bg-accent-red"
                  : "bg-gray-400"
              }`}
            />
            <span className="text-text-muted">
              {apiOnline === true ? "Inference GPU Online" : apiOnline === false ? "Local Backend Standby" : "Checking..."}
            </span>
          </div>

          <Link
            href="/demo"
            className="px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            Launch Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
