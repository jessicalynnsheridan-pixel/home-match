"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Settings, Sparkles, ClipboardList, HelpCircle, Flame, List, Building2, UserPlus, Mail, Plug, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import { createClient } from "@/lib/supabase/client";

const buyerFeatures = [
  {
    icon: Sparkles,
    label: "My Matches",
    sub: "Homes picked for you",
    href: "/results",
    color: "#f0ece6",
    iconColor: "#b8956a",
  },
  {
    icon: ClipboardList,
    label: "Build My Profile",
    sub: "Tell us how you want to live",
    href: "/questionnaire",
    color: "#e8edf4",
    iconColor: "#4a6f9c",
  },
  {
    icon: HelpCircle,
    label: "How It Works",
    sub: "See how matching works",
    href: "/#how-it-works",
    color: "#f5f0e8",
    iconColor: "#8c7a5a",
  },
];

const realtorFeatures = [
  {
    icon: Flame,
    label: "Today's Priorities",
    sub: "Hot leads & tasks due now",
    href: "/dashboard",
    color: "#fef3e8",
    iconColor: "#d97706",
  },
  {
    icon: List,
    label: "Lead Pipeline",
    sub: "All leads by stage",
    href: "/pipeline",
    color: "#eff6ff",
    iconColor: "#2563eb",
  },
  {
    icon: Mail,
    label: "Lead Pipeline",
    sub: "Outreach templates & stages",
    href: "/pipeline",
    color: "#f0fdf4",
    iconColor: "#16a34a",
  },
  {
    icon: Building2,
    label: "Your Listings",
    sub: "Active properties",
    href: "/listings",
    color: "#f5f0e8",
    iconColor: "#b8956a",
  },
];

const realtorUtility = [
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "For Realtors", href: "/for-realtors", icon: UserPlus },
];

const DARK_PAGES: string[] = [];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { branding } = useBranding();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<"buyers" | "realtors" | "account" | null>(null);
  const [realtorUser, setRealtorUser] = useState<{ name: string; email: string; initials: string } | null>(null);

  const isDark = DARK_PAGES.some((p) => pathname.startsWith(p));

  const buyerPages = ["/portal", "/listings", "/questionnaire", "/results"];
  const showRealtorPill = buyerPages.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const first = user.user_metadata?.first_name ?? "";
        const last = user.user_metadata?.last_name ?? "";
        const name = [first, last].filter(Boolean).join(" ") || (user.email ?? "Realtor");
        const initials = [first.charAt(0), last.charAt(0)].filter(Boolean).join("").toUpperCase() || "R";
        setRealtorUser({ name, email: user.email ?? "", initials });
      } else {
        setRealtorUser(null);
      }
    });
  }, [pathname]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setRealtorUser(null);
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        isDark
          ? "bg-[#0e0c0a]/85 border-white/8"
          : "bg-[#faf9f7]/90 border-[#e8e4de]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="HomeMatch"
            height={32}
            style={{ height: 32, width: "auto", filter: isDark ? "brightness(0) invert(1)" : "none" }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">

          {/* Buyers dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen("buyers")}
            onMouseLeave={() => setDropdownOpen(null)}
          >
            <button
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                dropdownOpen === "buyers"
                  ? isDark ? "text-white" : "text-[#2c2825]"
                  : isDark ? "text-white/55 hover:text-white" : "text-[#8c8580] hover:text-[#2c2825]"
              }`}
            >
              For Buyers
            </button>
            {dropdownOpen === "buyers" && (
              <div className={`absolute top-full left-0 mt-1 border rounded-2xl shadow-xl p-2 w-72 animate-fade-in z-50 ${
                isDark ? "bg-[#1a1612] border-white/10" : "bg-white border-[#e8e4de]"
              }`}>
                {buyerFeatures.map((f) => {
                  const Icon = f.icon;
                  const active = isActive(f.href);
                  return (
                    <Link
                      key={f.href}
                      href={f.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        active
                          ? isDark ? "bg-white/8" : "bg-[#f5f3f0]"
                          : isDark ? "hover:bg-white/6" : "hover:bg-[#faf9f7]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.08)" : f.color }}>
                        <Icon size={15} style={{ color: isDark ? "rgba(255,255,255,0.5)" : f.iconColor }} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium leading-none mb-0.5 ${
                          active
                            ? isDark ? "text-white" : "text-[#2c2825]"
                            : isDark ? "text-white/80" : "text-[#2c2825]"
                        }`}>{f.label}</p>
                        <p className={`text-xs ${isDark ? "text-white/35" : "text-[#8c8580]"}`}>{f.sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Realtors dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen("realtors")}
            onMouseLeave={() => setDropdownOpen(null)}
          >
            <button
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                dropdownOpen === "realtors"
                  ? isDark ? "text-white" : "text-[#2c2825]"
                  : isDark ? "text-white/55 hover:text-white" : "text-[#8c8580] hover:text-[#2c2825]"
              }`}
            >
              For Realtors
            </button>
            {dropdownOpen === "realtors" && (
              <div className={`absolute top-full left-0 mt-1 border rounded-2xl shadow-xl p-2 w-72 animate-fade-in z-50 ${
                isDark ? "bg-[#1a1612] border-white/10" : "bg-white border-[#e8e4de]"
              }`}>
                {realtorFeatures.map((f) => {
                  const Icon = f.icon;
                  const active = isActive(f.href);
                  return (
                    <Link
                      key={f.label}
                      href={f.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        active
                          ? isDark ? "bg-white/8" : "bg-[#f5f3f0]"
                          : isDark ? "hover:bg-white/6" : "hover:bg-[#faf9f7]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.08)" : f.color }}>
                        <Icon size={15} style={{ color: isDark ? "rgba(255,255,255,0.5)" : f.iconColor }} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium leading-none mb-0.5 ${
                          active
                            ? isDark ? "text-white" : "text-[#2c2825]"
                            : isDark ? "text-white/80" : "text-[#2c2825]"
                        }`}>{f.label}</p>
                        <p className={`text-xs ${isDark ? "text-white/35" : "text-[#8c8580]"}`}>{f.sub}</p>
                      </div>
                    </Link>
                  );
                })}
                <div className={`mx-2 my-1 h-px ${isDark ? "bg-white/8" : "bg-[#e8e4de]"}`} />
                {realtorUtility.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${
                        isDark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-[#8c8580] hover:text-[#2c2825] hover:bg-[#faf9f7]"
                      }`}
                    >
                      <Icon size={13} /> {l.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {realtorUser ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-full border transition-colors ${
                  isActive("/dashboard")
                    ? "bg-[#2c2825] text-white border-[#2c2825]"
                    : isDark
                      ? "text-white/70 border-white/20 hover:text-white hover:border-white/40"
                      : "text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
                }`}
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>

              {/* Account dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen("account")}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-colors ${
                  isDark ? "border-white/15 hover:border-white/30" : "border-[#e8e4de] hover:border-[#2c2825]"
                }`}>
                  <div className="w-7 h-7 rounded-full bg-[#2c2825] flex items-center justify-center text-white text-xs font-bold">
                    {realtorUser.initials}
                  </div>
                  <span className={`text-sm font-medium ${isDark ? "text-white/80" : "text-[#2c2825]"}`}>
                    {realtorUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={12} className={isDark ? "text-white/40" : "text-[#8c8580]"} />
                </button>

                {dropdownOpen === "account" && (
                  <div className={`absolute top-full right-0 mt-1 border rounded-2xl shadow-xl p-2 w-52 animate-fade-in z-50 ${
                    isDark ? "bg-[#1a1612] border-white/10" : "bg-white border-[#e8e4de]"
                  }`}>
                    <div className={`px-3 py-2 mb-1 border-b ${isDark ? "border-white/8" : "border-[#f0ece6]"}`}>
                      <p className={`text-xs font-semibold truncate ${isDark ? "text-white/90" : "text-[#2c2825]"}`}>{realtorUser.name}</p>
                      <p className={`text-xs truncate ${isDark ? "text-white/35" : "text-[#8c8580]"}`}>{realtorUser.email}</p>
                    </div>
                    <Link href="/dashboard" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isDark ? "text-white/70 hover:bg-white/6 hover:text-white" : "text-[#2c2825] hover:bg-[#faf9f7]"}`}>
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link href="/admin" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isDark ? "text-white/70 hover:bg-white/6 hover:text-white" : "text-[#2c2825] hover:bg-[#faf9f7]"}`}>
                      <Settings size={14} /> Settings
                    </Link>
                    <button onClick={signOut} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${isDark ? "text-rose-400 hover:bg-white/6" : "text-rose-600 hover:bg-rose-50"}`}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {showRealtorPill && (
                <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 border ${
                  isDark ? "bg-white/8 border-white/12" : "bg-[#f5f3f0] border-[#e8e4de]"
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isDark ? "bg-[#c9a870] text-[#1a1512]" : "bg-[#2c2825] text-white"
                  }`}>
                    {branding.realtorName.charAt(0)}
                  </div>
                  <span className={`text-xs font-medium ${isDark ? "text-white/80" : "text-[#2c2825]"}`}>
                    {branding.realtorName.split(" ")[0]}
                  </span>
                  <span className={`text-xs ${isDark ? "text-white/35" : "text-[#8c8580]"}`}>· Your Advisor</span>
                </div>
              )}
              <Link href="/admin" className={`transition-colors ${isDark ? "text-white/35 hover:text-white/70" : "text-[#8c8580] hover:text-[#2c2825]"}`} title="Admin">
                <Settings size={18} />
              </Link>
              <Link href="/login" className={`text-sm px-4 py-2.5 rounded-full border transition-colors ${isDark ? "text-white/60 border-white/15 hover:text-white hover:border-white/35" : "text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"}`}>
                Sign In
              </Link>
              <Link href="/realtor-signup" className={`text-sm px-4 py-2.5 rounded-full border transition-colors ${isDark ? "text-white/60 border-white/15 hover:text-white hover:border-white/35" : "text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"}`}>
                Realtor Sign Up
              </Link>
              <Link href="/questionnaire" className="inline-flex items-center text-[#1a1512] font-semibold text-sm px-5 py-2.5 rounded-full transition-all btn-press" style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", boxShadow: "0 4px 16px rgba(201,168,112,0.30)" }}>
                Start Your Home Match
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-1 ${isDark ? "text-white/70" : "text-[#2c2825]"}`}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t px-5 py-5 flex flex-col gap-2 animate-fade-in ${
          isDark ? "border-white/10 bg-[#141210]" : "border-[#e8e4de] bg-[#faf9f7]"
        }`}>

          {/* Buyer features - card grid */}
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isDark ? "text-[#c9a870]/70" : "text-[#b8a88a]"}`}>
            For Buyers
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {buyerFeatures.map((f) => {
              const Icon = f.icon;
              const active = isActive(f.href);
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                    active
                      ? isDark
                        ? "bg-white/8 border-white/15"
                        : "bg-white border-[#d8d4ce]"
                      : isDark
                        ? "bg-white/4 border-white/8 hover:bg-white/8"
                        : "bg-white border-[#e8e4de] hover:border-[#d8d4ce]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.08)" : f.color }}>
                    <Icon size={14} style={{ color: isDark ? "rgba(255,255,255,0.5)" : f.iconColor }} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${isDark ? "text-white/90" : "text-[#2c2825]"}`}>{f.label}</p>
                    <p className={`text-[10px] leading-tight mt-0.5 ${isDark ? "text-white/30" : "text-[#8c8580]"}`}>{f.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className={`h-px my-1 ${isDark ? "bg-white/8" : "bg-[#e8e4de]"}`} />

          {/* Realtor features - card grid */}
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 mt-1 ${isDark ? "text-[#c9a870]/70" : "text-[#b8a88a]"}`}>
            For Realtors
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {realtorFeatures.map((f) => {
              const Icon = f.icon;
              const active = isActive(f.href);
              return (
                <Link
                  key={f.label}
                  href={f.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                    active
                      ? isDark
                        ? "bg-white/8 border-white/15"
                        : "bg-white border-[#d8d4ce]"
                      : isDark
                        ? "bg-white/4 border-white/8 hover:bg-white/8"
                        : "bg-white border-[#e8e4de] hover:border-[#d8d4ce]"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.08)" : f.color }}>
                    <Icon size={14} style={{ color: isDark ? "rgba(255,255,255,0.5)" : f.iconColor }} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${isDark ? "text-white/90" : "text-[#2c2825]"}`}>{f.label}</p>
                    <p className={`text-[10px] leading-tight mt-0.5 ${isDark ? "text-white/30" : "text-[#8c8580]"}`}>{f.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="flex gap-2 mb-3">
            {realtorUtility.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    isDark
                      ? "text-white/50 border-white/12 hover:text-white hover:border-white/25"
                      : "text-[#8c8580] border-[#e8e4de] hover:text-[#2c2825]"
                  }`}
                >
                  <Icon size={12} /> {l.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className={`h-px my-1 ${isDark ? "bg-white/8" : "bg-[#e8e4de]"}`} />

          {/* Bottom CTAs */}
          {realtorUser ? (
            <div className="space-y-2">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${isDark ? "border-white/10 bg-white/4" : "border-[#e8e4de] bg-white"}`}>
                <div className="w-8 h-8 rounded-full bg-[#2c2825] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {realtorUser.initials}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-[#2c2825]"}`}>{realtorUser.name}</p>
                  <p className={`text-xs truncate ${isDark ? "text-white/40" : "text-[#8c8580]"}`}>{realtorUser.email}</p>
                </div>
              </div>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full text-sm px-5 py-3 rounded-full bg-[#2c2825] text-white font-medium">
                <LayoutDashboard size={14} /> Go to Dashboard
              </Link>
              <button onClick={() => { setMobileOpen(false); signOut(); }} className="w-full text-sm px-5 py-3 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className={`flex-1 text-sm px-5 py-3 rounded-full text-center mt-1 border ${isDark ? "text-white/70 border-white/20" : "text-[#2c2825] border-[#e8e4de]"}`}>
                Sign In
              </Link>
              <Link href="/realtor-signup" onClick={() => setMobileOpen(false)} className={`flex-1 text-sm px-5 py-3 rounded-full text-center mt-1 border ${isDark ? "text-white/70 border-white/20" : "text-[#2c2825] border-[#2c2825]"}`}>
                Sign Up
              </Link>
            </div>
          )}
          <Link
            href="/questionnaire"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center text-white font-semibold text-sm px-5 py-3 rounded-full text-center mt-1 transition-all"
            style={{ background: "#1a1512" }}
          >
            Start Your Home Match
          </Link>
        </div>
      )}
    </header>
  );
}
