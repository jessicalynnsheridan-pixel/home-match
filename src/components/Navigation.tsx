"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Settings } from "lucide-react";

const buyerLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Start Questionnaire", href: "/questionnaire" },
  { label: "My Home Hub", href: "/portal" },
];

const realtorLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Listings", href: "/listings" },
  { label: "For Realtors", href: "/for-realtors" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<"buyers" | "realtors" | null>(null);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f7]/90 backdrop-blur-md border-b border-[#e8e4de]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-[#2c2825] font-semibold text-lg tracking-tight shrink-0">
          Home<span className="text-[#b8a88a]"> Match</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Buyers dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen("buyers")}
            onMouseLeave={() => setDropdownOpen(null)}
          >
            <button className={`text-sm px-3 py-2 rounded-lg transition-colors ${dropdownOpen === "buyers" ? "text-[#2c2825]" : "text-[#8c8580] hover:text-[#2c2825]"}`}>
              For Buyers
            </button>
            {dropdownOpen === "buyers" && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#e8e4de] rounded-xl shadow-lg py-1.5 min-w-44 animate-fade-in z-50">
                {buyerLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block px-4 py-2 text-sm transition-colors ${isActive(l.href) ? "text-[#2c2825] font-medium" : "text-[#8c8580] hover:text-[#2c2825] hover:bg-[#faf9f7]"}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Realtors dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen("realtors")}
            onMouseLeave={() => setDropdownOpen(null)}
          >
            <button className={`text-sm px-3 py-2 rounded-lg transition-colors ${dropdownOpen === "realtors" ? "text-[#2c2825]" : "text-[#8c8580] hover:text-[#2c2825]"}`}>
              For Realtors
            </button>
            {dropdownOpen === "realtors" && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#e8e4de] rounded-xl shadow-lg py-1.5 min-w-44 animate-fade-in z-50">
                {realtorLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block px-4 py-2 text-sm transition-colors ${isActive(l.href) ? "text-[#2c2825] font-medium" : "text-[#8c8580] hover:text-[#2c2825] hover:bg-[#faf9f7]"}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className="text-[#8c8580] hover:text-[#2c2825] transition-colors"
            title="Admin & Branding"
          >
            <Settings size={18} />
          </Link>
          <Link
            href="/questionnaire"
            className="bg-[#2c2825] text-white text-sm px-5 py-2.5 rounded-full hover:bg-[#1a1714] transition-colors"
          >
            Start Your Home Match
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#2c2825] p-1"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e8e4de] bg-[#faf9f7] px-6 py-4 flex flex-col gap-1 animate-fade-in">
          <p className="text-[#b8a88a] text-xs font-medium uppercase tracking-widest mb-2">For Buyers</p>
          {buyerLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-[#2c2825] text-sm py-2">
              {l.label}
            </Link>
          ))}
          <p className="text-[#b8a88a] text-xs font-medium uppercase tracking-widest mt-4 mb-2">For Realtors</p>
          {realtorLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-[#2c2825] text-sm py-2">
              {l.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-[#8c8580] text-sm py-2">
            Admin & Branding
          </Link>
          <Link
            href="/questionnaire"
            onClick={() => setMobileOpen(false)}
            className="bg-[#2c2825] text-white text-sm px-5 py-3 rounded-full text-center mt-3"
          >
            Start Your Home Match
          </Link>
        </div>
      )}
    </header>
  );
}
