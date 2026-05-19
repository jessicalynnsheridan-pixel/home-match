"use client";

import React, { useState, useEffect, useCallback } from "react";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { PropertyRecommendation, QuestionnaireAnswers } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Heart, BedDouble, Bath, Ruler, CheckCircle, Circle,
  Lightbulb, BookOpen, MapPin, ShieldCheck, ChevronDown,
  ChevronUp, Info, ArrowRight, TrendingUp, MessageCircle,
  Sparkles, Star, Bell, Flame, CalendarDays, Phone, Mail,
  Calculator, Home, Zap, Check,
} from "lucide-react";
import { calcBuyerReadiness } from "@/lib/buyerMatch";
import { useBranding } from "@/context/BrandingContext";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";
import Link from "next/link";
import TiltCard from "@/components/ui/TiltCard";

const FALLBACK_LEAD = mockLeads.find((l) => l.id === "lead-001") ?? mockLeads[0];

// ─── Affordability math ───────────────────────────────────────────────────────
function calcMonthlyPayment(price: number, downPct = 0.2, annualRate = 0.055, years = 25) {
  const principal = price * (1 - downPct);
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function ontarioLTT(price: number): number {
  let tax = 0;
  if (price > 2_000_000) tax += (price - 2_000_000) * 0.025;
  if (price > 400_000) tax += (Math.min(price, 2_000_000) - 400_000) * 0.02;
  if (price > 250_000) tax += (Math.min(price, 400_000) - 250_000) * 0.015;
  if (price > 55_000) tax += (Math.min(price, 250_000) - 55_000) * 0.01;
  tax += Math.min(price, 55_000) * 0.005;
  return Math.round(tax);
}

// ─── Time-based greeting ─────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Neighbourhood lifestyle data ────────────────────────────────────────────
const NEIGHBOURHOOD_MATCHES = [
  {
    name: "Rosedale",
    city: "Toronto",
    vibes: ["Quiet & residential", "Tree-lined streets"],
    priceRange: "$1.4M to $3M+",
    highlights: ["Top-ranked schools", "Ravine trails", "Mature canopy streets", "Boutique village feel"],
    fit: 95,
  },
  {
    name: "Forest Hill",
    city: "Toronto",
    vibes: ["Quiet & residential", "Near schools"],
    priceRange: "$1.6M to $4M+",
    highlights: ["UCC & BSS school district", "Village shops", "Large lots", "Safe, walkable streets"],
    fit: 88,
  },
  {
    name: "Lawrence Park",
    city: "Toronto",
    vibes: ["Quiet & residential", "Near transit"],
    priceRange: "$1.2M to $2.5M",
    highlights: ["TTC access", "Alexander Muir Park", "Family-friendly", "Good value vs. Rosedale"],
    fit: 82,
  },
];

const CLOSING_STEPS = [
  { phase: "Offer Stage", items: ["Get pre-approval letter in hand", "Review offer conditions with your lawyer", "Submit offer with deposit cheque ready", "Negotiate conditions (inspection, financing)"] },
  { phase: "After Accepted Offer", items: ["Book home inspection within condition period", "Confirm financing with lender", "Review status certificate (condo) or title search", "Hire a real estate lawyer"] },
  { phase: "Closing Day Prep", items: ["Wire closing funds to lawyer in trust", "Confirm utilities transfer date", "Do a final walkthrough 24–48 hrs before close", "Arrange moving truck and storage if needed"] },
  { phase: "Keys in Hand", items: ["Pick up keys from lawyer or agent", "Change all locks immediately", "Set up home insurance (required on close)", "Register for property tax account with municipality"] },
];

const FTB_TIPS = [
  { title: "Get pre-approved, not just pre-qualified", body: "Pre-approval means a lender has verified your income and credit. It's a real number, not an estimate. Most sellers won't take your offer seriously without it." },
  { title: "Land Transfer Tax is real money", body: "In Ontario, expect to pay 1–2% of purchase price in land transfer tax. First-time buyers get a rebate up to $4,000, but anything above goes out of pocket on closing day." },
  { title: "The list price is rarely the final price", body: "In competitive markets, homes often sell above asking. Build a buffer into your max budget. Never use your full approval amount as your shopping price." },
  { title: "Freehold vs. condo: very different commitments", body: "Condo buyers share maintenance costs through monthly fees. Freehold owners handle everything themselves. Neither is better. It depends on your lifestyle and risk tolerance." },
  { title: "Your lawyer matters more than you think", body: "A real estate lawyer reviews the title, coordinates funds, and catches anything your agent might miss. Budget $1,500–$2,500 and find one before you make an offer." },
];

// ─── Saved homes hook (localStorage) ─────────────────────────────────────────
function useSavedHomes(fallbackIds: string[]) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem("homematch_saved_homes");
        if (raw) {
          setSavedIds(new Set(JSON.parse(raw)));
        } else {
          setSavedIds(new Set(fallbackIds));
        }
      } catch {
        setSavedIds(new Set(fallbackIds));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [fallbackIds]);

  function toggle(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try { localStorage.setItem("homematch_saved_homes", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  return { savedIds, toggle };
}

// ─── Realtor Banner ───────────────────────────────────────────────────────────
function RealtorBanner({ realtorName, realtorEmail, message }: { realtorName: string; realtorEmail: string; message: string }) {
  return (
    <div className="bg-white border border-[#b8a88a]/30 rounded-2xl p-4 flex items-center gap-4 glow-gold animate-fade-up">
      <div className="w-10 h-10 rounded-full bg-[#2c2825] flex items-center justify-center shrink-0 text-white font-semibold text-sm">
        {realtorName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#2c2825] text-sm font-medium truncate">
          {realtorName}
          <span className="text-[#8c8580] font-normal"> · Your Advisor</span>
        </p>
        <p className="text-[#8c8580] text-xs leading-relaxed mt-0.5">{message}</p>
      </div>
      <a
        href={`mailto:${realtorEmail}?subject=HomeMatch - Question for ${realtorName}`}
        className="shrink-0 flex items-center gap-1.5 bg-[#2c2825] text-white text-xs font-medium px-3 py-2 rounded-full hover:bg-[#1a1714] transition-colors btn-press"
      >
        <MessageCircle size={12} />
        Message
      </a>
    </div>
  );
}

// ─── Return trigger banner ────────────────────────────────────────────────────
function ReturnBanner({ count, streak, realtorName }: { count: number; streak: number; realtorName: string }) {
  const firstName = realtorName.split(" ")[0];
  if (count === 0 && streak < 2) return null;

  return (
    <div className="animate-fade-up">
      {count > 0 && (
        <div className="flex items-start gap-3 bg-gradient-to-r from-[#b8a88a]/12 to-[#faf9f7] border border-[#b8a88a]/25 rounded-2xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-[#b8a88a] flex items-center justify-center shrink-0 animate-pulse-soft">
            <Bell size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#2c2825] text-sm font-semibold">
              {count} new {count === 1 ? "home" : "homes"} match your vibe.
            </p>
            <p className="text-[#8c8580] text-xs mt-0.5">
              {firstName} has been keeping an eye on your neighbourhoods.
            </p>
          </div>
          <Link
            href="/listings"
            className="shrink-0 flex items-center gap-1 text-xs text-[#2c2825] font-medium border border-[#e8e4de] px-3 py-1.5 rounded-full hover:border-[#b8a88a] transition-colors"
          >
            See them
            <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {streak >= 2 && (
        <div className="flex items-center gap-2.5 mt-2 px-1">
          <span className="animate-flame text-base">🔥</span>
          <p className="text-[#8c8580] text-xs">
            <span className="text-[#2c2825] font-semibold">{streak}-day streak</span> · You&apos;re building momentum on your home search.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Vibe summary ─────────────────────────────────────────────────────────────
function VibeSummary({ answers }: { answers: QuestionnaireAnswers }) {
  const feelings = answers.homeFeeling?.slice(0, 3) || [];
  const style = answers.modernVsCozy || "";
  const hosting = answers.hostingVsPrivacy || "";
  const items = [...feelings, style, hosting].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 animate-fade-up card-hover">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-[#b8a88a]" />
        <p className="text-[#2c2825] font-semibold text-sm">Your Home Personality</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item) => (
          <span key={item} className="bg-[#faf9f7] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
      {answers.sundayMorning && (
        <p className="text-[#8c8580] text-xs italic border-t border-[#f0ece6] pt-3">
          Dream Sunday: &ldquo;{answers.sundayMorning}&rdquo;
        </p>
      )}
    </div>
  );
}

// ─── Today's Discoveries deck ─────────────────────────────────────────────────
function TodaysDiscoveries({
  properties,
  savedIds,
  onToggle,
}: {
  properties: PropertyRecommendation[];
  savedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (properties.length === 0) return null;

  const MATCH_SCORES = [96, 91, 87, 82, 78];

  return (
    <section className="animate-fade-up stagger-2">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles size={15} className="text-[#b8a88a]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#b8a88a] animate-dot-blink" />
          </div>
          <div>
            <h2 className="text-[#2c2825] font-semibold text-sm">Today&apos;s Discoveries</h2>
            <p className="text-[#8c8580] text-xs">Fresh picks curated for your profile</p>
          </div>
        </div>
        <Link
          href="/listings"
          className="shrink-0 flex items-center gap-1 text-xs text-[#2c2825] border border-[#e8e4de] px-3 py-1.5 rounded-full hover:border-[#b8a88a] transition-colors"
        >
          Explore all
          <ArrowRight size={11} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {properties.map((p, i) => {
          const score = MATCH_SCORES[i] ?? 75;
          const isTop = score >= 90;
          const saved = savedIds.has(p.id);

          return (
            <TiltCard
              key={p.id}
              className={`
                shrink-0 w-[260px] sm:w-[280px] rounded-2xl overflow-hidden
                snap-start
                ${isTop ? "shadow-gold" : "shadow-warm-sm"}
                animate-fade-up
              `}
              style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
            >
              <div className={`
                group bg-white rounded-2xl overflow-hidden
                ${isTop ? "border border-[#b8a88a]/40" : "border border-[#e8e4de]"}
              `}>
                {/* Cinematic image */}
                <div className="relative h-44 overflow-hidden">
                  <Image src={p.imageUrl} alt={p.address} fill className="object-cover img-zoom" unoptimized />
                  <div className="card-image-overlay absolute inset-0" />

                  {isTop ? (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-[#b8a88a] text-white text-[10px] font-semibold px-2 py-1 rounded-full animate-badge-pop">
                      <Sparkles size={9} />
                      Top match
                    </div>
                  ) : (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 text-[10px] font-semibold border px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#8c8580] border-[#e8e4de]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#b8a88a]" />
                      {score}% match
                    </div>
                  )}

                  <button
                    onClick={() => onToggle(p.id)}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow transition-all hover:scale-110 active:scale-90 ${
                      saved ? "bg-rose-500" : "bg-white/90 backdrop-blur-sm"
                    }`}
                  >
                    <Heart size={13} className={saved ? "fill-white text-white" : "text-[#8c8580]"} />
                  </button>

                  {/* Price overlay */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-white font-bold text-base drop-shadow">{formatCurrency(p.price)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[#2c2825] text-xs font-medium leading-snug mb-0.5 truncate">{p.address}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#8c8580] mb-3">
                    <span>{p.bedrooms} bed</span>
                    <span>·</span>
                    <span>{p.bathrooms} bath</span>
                    <span>·</span>
                    <span>{p.sqft.toLocaleString()} sqft</span>
                  </div>
                  <p className="text-[10px] text-[#8c8580] leading-relaxed line-clamp-2">{p.matchReason}</p>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuyerPortalPage() {
  const { branding } = useBranding();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<QuestionnaireAnswers>(FALLBACK_LEAD.answers);
  const [isRealUser, setIsRealUser] = useState(false);
  const [newMatchCount, setNewMatchCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [openTip, setOpenTip] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "homes" | "calculator" | "showings" | "journey">("overview");
  const [showingForm, setShowingForm] = useState<{
    dates: string; time: string; message: string; submitted: boolean; submitting: boolean;
  }>({ dates: "", time: "", message: "", submitted: false, submitting: false });

  const [calc, setCalc] = useState({ price: 0, downPct: 20, rate: 5.5, years: 25 });

  const OFFER_CHECKLIST = [
    { id: "preapproval", label: "Pre-approval letter ready", auto: (a: QuestionnaireAnswers) => a.preApprovalStatus === "Yes, fully approved" || a.preApprovalStatus === "Paying cash" },
    { id: "deposit",     label: "Deposit cheque prepared (1–5% of purchase price)", auto: () => false },
    { id: "lawyer",      label: "Real estate lawyer retained", auto: () => false },
    { id: "conditions",  label: "Conditions decided (inspection, financing)", auto: () => false },
    { id: "price",       label: "Target offer price discussed with realtor", auto: () => false },
  ];

  const [offerChecked, setOfferChecked] = useState<Set<string>>(new Set());
  const [offerNote, setOfferNote] = useState("");
  const [offerSent, setOfferSent] = useState(false);
  const [offerSending, setOfferSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("homematch_answers");
        if (raw) { setAnswers(JSON.parse(raw)); setIsRealUser(true); }
      } catch { /* ignore */ }
      try {
        const now = Date.now();
        const lastVisit = localStorage.getItem("homematch_last_portal_visit");
        const streakKey = localStorage.getItem("homematch_visit_streak");
        const currentStreak = parseInt(streakKey || "0");
        if (lastVisit) {
          const hoursSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
          if (hoursSince > 2) setNewMatchCount(Math.min(4, Math.floor(hoursSince / 6) + 1));
          const daysSince = hoursSince / 24;
          if (daysSince < 1.5) { setStreak(Math.min(currentStreak + 1, 30)); localStorage.setItem("homematch_visit_streak", String(Math.min(currentStreak + 1, 30))); }
          else if (daysSince > 2) { setStreak(1); localStorage.setItem("homematch_visit_streak", "1"); }
          else setStreak(currentStreak);
        } else { setStreak(1); localStorage.setItem("homematch_visit_streak", "1"); }
        localStorage.setItem("homematch_last_portal_visit", String(now));
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (newMatchCount === 0) return;
    const t = setTimeout(() => {
      toast(`${newMatchCount} new ${newMatchCount === 1 ? "home" : "homes"} match your vibe.`, { sub: "Check the Homes tab.", variant: "match" });
    }, 1200);
    return () => clearTimeout(t);
  }, [newMatchCount, toast]);

  const fallbackSavedIds = isRealUser ? [] : (FALLBACK_LEAD.savedHomeIds || []);
  const { savedIds, toggle: rawToggle } = useSavedHomes(fallbackSavedIds);

  const toggle = useCallback((id: string) => {
    const willSave = !savedIds.has(id);
    rawToggle(id);
    if (willSave) toast("Added to your Dream Collection.", { sub: "Saved homes live across all your devices.", variant: "save" });
  }, [savedIds, rawToggle, toast]);

  useEffect(() => {
    if (answers.preApprovalStatus === "Yes, fully approved" || answers.preApprovalStatus === "Paying cash") {
      setOfferChecked((prev) => new Set([...prev, "preapproval"]));
    }
  }, [answers.preApprovalStatus]);

  const recommendations = mockProperties.filter((p) => p.leadId === "lead-001");
  const readiness = calcBuyerReadiness(answers);
  const midPrice = ((answers.budgetMin ?? 0) + (answers.budgetMax ?? 0)) / 2;
  const calcPrice = calc.price > 0 ? calc.price : Math.round(midPrice) || 750000;
  const downPayment = midPrice * 0.2;
  const monthlyPayment = calcMonthlyPayment(midPrice);
  const ltt = ontarioLTT(midPrice);
  const closingCosts = Math.round(midPrice * 0.015);
  const totalHiddenCosts = ltt + closingCosts + 500 + 2000 + 3000;
  const isFirstTimeBuyer = answers.ownershipStatus === "First-time buyer";
  const firstName = answers.firstName || "";
  const realtorFirst = branding.realtorName.split(" ")[0];

  const realtorMessage = newMatchCount > 0
    ? `I found ${newMatchCount} new homes that match your profile. Let me know when you're ready to tour.`
    : "Your profile is looking great. I'm keeping an eye on your neighbourhoods.";

  const TABS = [
    { id: "overview",    label: "Overview",   icon: <Sparkles size={14} /> },
    { id: "homes",       label: "Homes",      icon: <Heart size={14} /> },
    { id: "calculator",  label: "Calculator", icon: <Calculator size={14} /> },
    { id: "showings",    label: "Showings",   icon: <CalendarDays size={14} /> },
    { id: "journey",     label: "Journey",    icon: <BookOpen size={14} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div className="bg-[#2c2825] px-6 pt-8 pb-6">
        <div className="max-w-5xl mx-auto">
          {/* Greeting + realtor online indicator */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[#b8a88a] text-xs font-semibold tracking-widest uppercase mb-1">Your Home Hub</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                {getGreeting()}{firstName ? `, ${firstName}` : ""}.
              </h1>
              <p className="text-white/50 text-sm mt-1">
                {isRealUser ? "Built around you. Your matches, your pace." : "Your personalised home search hub."}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium">{realtorFirst} is active</span>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Readiness", value: `${readiness.overall}/100`, sub: readiness.label, color: readiness.overall >= 70 ? "text-emerald-400" : "text-[#b8a88a]" },
              { label: "Budget", value: formatCurrency(answers.budgetMin ?? 0), sub: `to ${formatCurrency(answers.budgetMax ?? 0)}`, color: "text-white" },
              { label: "Timeline", value: answers.timeline || "Not set", sub: "buying horizon", color: "text-white" },
              { label: "Saved Homes", value: String(savedIds.size), sub: "in Dream Collection", color: savedIds.size > 0 ? "text-rose-400" : "text-white" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-4 py-3.5">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`font-bold text-base leading-tight ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky tab bar ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#e8e4de] shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#2c2825] text-white"
                    : "text-[#8c8580] hover:text-[#2c2825] hover:bg-[#faf9f7]"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "homes" && newMatchCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{newMatchCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        {/* ════ OVERVIEW ══════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* New matches / streak nudge */}
            {(newMatchCount > 0 || streak > 1) && (
              <ReturnBanner count={newMatchCount} streak={streak} realtorName={branding.realtorName} />
            )}

            {/* Realtor card */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Your Advisor · Available Now</p>
              </div>
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2c2825] to-[#5c4a3a] flex items-center justify-center shrink-0 text-white text-xl font-bold shadow-md">
                  {branding.realtorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[#2c2825] font-bold text-base leading-tight">{branding.realtorName}</h2>
                  <p className="text-[#b8a88a] text-sm font-medium">Personal Real Estate Advisor</p>
                  <p className="text-[#8c8580] text-sm mt-1.5 leading-relaxed">{realtorMessage}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`mailto:${branding.email}?subject=HomeMatch - Question for ${realtorFirst}`}
                  className="flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm font-semibold px-4 py-3 rounded-xl hover:bg-[#1a1714] transition-colors btn-press"
                >
                  <Mail size={14} /> Send an Email
                </a>
                <button
                  onClick={() => setActiveTab("showings")}
                  className="flex items-center justify-center gap-2 bg-[#b8a88a]/15 text-[#2c2825] text-sm font-semibold px-4 py-3 rounded-xl hover:bg-[#b8a88a]/25 transition-colors border border-[#b8a88a]/30 btn-press"
                >
                  <CalendarDays size={14} /> Book a Showing
                </button>
              </div>
            </section>

            {/* Home personality / vibe */}
            {answers.homeFeeling && answers.homeFeeling.length > 0 && (
              <VibeSummary answers={answers} />
            )}

            {/* Journey readiness */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#b8a88a]" />
                  <div>
                    <h2 className="text-[#2c2825] font-semibold">Journey Readiness</h2>
                    <p className="text-[#8c8580] text-sm mt-0.5">How prepared you are to move on the right home.</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-bold ${readiness.overall >= 80 ? "text-emerald-600" : readiness.overall >= 60 ? "text-[#b8a88a]" : "text-amber-500"}`}>
                    {readiness.overall}<span className="text-sm font-normal text-[#8c8580]">/100</span>
                  </p>
                  <p className="text-xs text-[#8c8580] mt-0.5">{readiness.label}</p>
                </div>
              </div>
              <div className="space-y-4 mb-5">
                {[readiness.financing, readiness.timeline, readiness.documentation, readiness.commitment].map((dim) => (
                  <div key={dim.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#2c2825] font-medium">{dim.label}</span>
                      <span className="text-[#8c8580]">{dim.detail}</span>
                    </div>
                    <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${dim.score >= 75 ? "bg-emerald-500" : dim.score >= 50 ? "bg-[#b8a88a]" : dim.score >= 30 ? "bg-amber-400" : "bg-slate-300"}`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {readiness.tip && (
                <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 flex gap-3 items-start">
                  <Info size={14} className="text-[#b8a88a] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#5c5550]">{readiness.tip}</p>
                    <p className="text-xs text-[#b8a88a] mt-1">{realtorFirst} can help you with this step.</p>
                  </div>
                </div>
              )}
            </section>

            {/* First-time buyer banner */}
            {isFirstTimeBuyer && (
              <div className="bg-[#b8a88a]/10 border border-[#b8a88a]/30 rounded-2xl p-5 flex gap-4 items-start animate-fade-up">
                <Info size={18} className="text-[#b8a88a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#2c2825] font-medium text-sm mb-1">First-time buyer? We&apos;ve got you.</p>
                  <p className="text-[#8c8580] text-sm">You qualify for the Ontario First-Time Home Buyer Land Transfer Tax Rebate (up to $4,000) and may be eligible for the FHSA and Home Buyers&apos; Plan. See your tips in the Journey tab.</p>
                </div>
              </div>
            )}

            {/* Quick action row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Browse Homes", icon: <Heart size={16} />, tab: "homes" as const, badge: newMatchCount > 0 ? `${newMatchCount} new` : null },
                { label: "Run Calculator", icon: <Calculator size={16} />, tab: "calculator" as const, badge: null },
                { label: "Book Showing", icon: <CalendarDays size={16} />, tab: "showings" as const, badge: null },
                { label: "Buying Guide", icon: <BookOpen size={16} />, tab: "journey" as const, badge: null },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setActiveTab(a.tab)}
                  className="relative bg-white border border-[#e8e4de] rounded-2xl px-4 py-5 flex flex-col items-center gap-2 hover:border-[#b8a88a] transition-all btn-press text-center"
                >
                  <div className="text-[#b8a88a]">{a.icon}</div>
                  <span className="text-xs font-medium text-[#2c2825]">{a.label}</span>
                  {a.badge && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">{a.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ════ HOMES ═════════════════════════════════════════════════════════ */}
        {activeTab === "homes" && (
          <>
            <TodaysDiscoveries properties={recommendations} savedIds={savedIds} onToggle={toggle} />

            {/* Dream Collection */}
            <section className="animate-fade-up">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Heart size={15} className="text-[#b8a88a]" />
                    <h2 className="text-[#2c2825] font-semibold">Your Dream Collection</h2>
                  </div>
                  <p className="text-[#8c8580] text-sm mt-0.5">Curated by {realtorFirst} to match your profile.</p>
                </div>
                <Link href="/listings" className="shrink-0 text-xs text-[#2c2825] border border-[#e8e4de] px-3 py-1.5 rounded-full hover:border-[#b8a88a] transition-colors">Browse all</Link>
              </div>
              {recommendations.length === 0 ? (
                <div className="bg-white border border-dashed border-[#d4cfc9] rounded-2xl p-10 text-center">
                  <Heart size={24} className="text-[#e8e4de] mx-auto mb-3" />
                  <p className="text-[#2c2825] font-medium mb-2">Your collection is waiting</p>
                  <p className="text-[#8c8580] text-sm">{realtorFirst} will add curated homes here. Or save ones you love while browsing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {recommendations.map((p) => (
                    <PortalPropertyCard key={p.id} property={p} saved={savedIds.has(p.id)} onToggle={() => toggle(p.id)} realtorName={branding.realtorName} />
                  ))}
                </div>
              )}
            </section>

            {/* Neighbourhood matches */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">Where Your Life Fits Best</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-1">Based on your vibe, here&apos;s how your areas score for your actual lifestyle.</p>
              <p className="text-[#b8a88a] text-xs mb-5 italic">{realtorFirst} is actively watching these neighbourhoods.</p>
              <div className="space-y-4">
                {NEIGHBOURHOOD_MATCHES.map((n) => (
                  <div key={n.name} className="border border-[#e8e4de] rounded-xl p-5 hover:border-[#b8a88a]/40 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-[#2c2825] font-semibold">{n.name}</p>
                        <p className="text-[#8c8580] text-xs">{n.city} · {n.priceRange}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={12} className={n.fit >= 90 ? "fill-emerald-500 text-emerald-500" : "fill-[#b8a88a] text-[#b8a88a]"} />
                        <span className={`text-sm font-bold ${n.fit >= 90 ? "text-emerald-600" : "text-[#b8a88a]"}`}>{n.fit}% fit</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden mb-4">
                      <div className={`h-full rounded-full transition-all duration-700 ${n.fit >= 90 ? "bg-emerald-500" : "bg-[#b8a88a]"}`} style={{ width: `${n.fit}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {n.highlights.map((h) => (
                        <span key={h} className="text-xs text-[#5c5550] bg-[#faf9f7] border border-[#e8e4de] rounded-full px-2.5 py-1">{h}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ════ CALCULATOR ════════════════════════════════════════════════════ */}
        {activeTab === "calculator" && (
          <>
            {/* Budget breakdown */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">What Your Budget Really Means</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-6">At {formatCurrency(midPrice)} (your midpoint), 20% down, 25-year amortization at 5.5%.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Monthly Payment", value: formatCurrency(Math.round(monthlyPayment)), note: "Principal & interest" },
                  { label: "Down Payment (20%)", value: formatCurrency(Math.round(downPayment)), note: "To skip CMHC insurance" },
                  { label: "Annual Property Tax", value: "~" + formatCurrency(Math.round(midPrice * 0.007)), note: "~0.7% of value" },
                  { label: "All-In Monthly Est.", value: formatCurrency(Math.round(monthlyPayment + (midPrice * 0.007) / 12 + 250)), note: "Payment + tax + upkeep" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl p-4">
                    <p className="text-[#8c8580] text-xs mb-2">{s.label}</p>
                    <p className="text-[#2c2825] font-semibold text-lg">{s.value}</p>
                    <p className="text-[#b8a88a] text-xs mt-1">{s.note}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl p-4">
                <p className="text-xs text-[#8c8580] mb-3 font-medium uppercase tracking-wider">What your budget gets you in {answers.preferredCity || "your area"}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    { range: formatCurrency(answers.budgetMin), label: "Entry point: townhomes or smaller detached with good bones" },
                    { range: formatCurrency(Math.round(midPrice)), label: "Mid-range: detached with space and the right neighbourhood" },
                    { range: formatCurrency(answers.budgetMax), label: "Top of range: larger lots, elevated finishes, less compromise" },
                  ].map((b) => (
                    <div key={b.range} className="flex items-start gap-2">
                      <span className="text-[#b8a88a] font-semibold shrink-0">{b.range}</span>
                      <span className="text-[#8c8580] text-xs leading-relaxed">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Interactive mortgage calculator */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <Calculator size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">Mortgage Calculator</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-6">Adjust any number and see your payment update instantly.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-[#8c8580] mb-1.5">Home Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8580] text-sm">$</span>
                    <input type="number" value={calcPrice} onChange={(e) => setCalc((p) => ({ ...p, price: Number(e.target.value) }))} className="w-full bg-[#faf9f7] border border-[#e8e4de] rounded-xl pl-7 pr-3 py-2.5 text-sm text-[#2c2825] focus:outline-none focus:border-[#b8a88a] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8c8580] mb-1.5">Down Payment ({calc.downPct}%)</label>
                  <input type="range" min={5} max={50} step={1} value={calc.downPct} onChange={(e) => setCalc((p) => ({ ...p, downPct: Number(e.target.value) }))} className="w-full accent-[#b8a88a] mt-2" />
                  <p className="text-xs text-[#b8a88a] mt-1">{formatCurrency(Math.round(calcPrice * calc.downPct / 100))}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8c8580] mb-1.5">Interest Rate</label>
                  <div className="relative">
                    <input type="number" step={0.1} min={0.1} max={15} value={calc.rate} onChange={(e) => setCalc((p) => ({ ...p, rate: Number(e.target.value) }))} className="w-full bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-3 pr-7 py-2.5 text-sm text-[#2c2825] focus:outline-none focus:border-[#b8a88a] transition-colors" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8580] text-sm">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8c8580] mb-1.5">Amortization</label>
                  <select value={calc.years} onChange={(e) => setCalc((p) => ({ ...p, years: Number(e.target.value) }))} className="w-full bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-3 py-2.5 text-sm text-[#2c2825] focus:outline-none focus:border-[#b8a88a] transition-colors">
                    {[15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} years</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-[#fdf8f0] border border-amber-200 rounded-2xl p-6 text-center mb-4">
                <p className="text-[#8c8580] text-xs font-semibold uppercase tracking-widest mb-2">Estimated Monthly Payment</p>
                <p className="text-4xl sm:text-5xl font-bold text-[#2c2825]">
                  {formatCurrency(Math.round(calcMonthlyPayment(calcPrice, calc.downPct / 100, calc.rate / 100, calc.years)))}
                </p>
                <p className="text-[#8c8580] text-xs mt-2">Principal & Interest · {calc.downPct}% down · {calc.rate}% rate · {calc.years}yr</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Loan Amount", value: formatCurrency(Math.round(calcPrice * (1 - calc.downPct / 100))) },
                  { label: "Down Payment", value: formatCurrency(Math.round(calcPrice * calc.downPct / 100)) },
                  { label: "Land Transfer Tax", value: formatCurrency(ontarioLTT(calcPrice)) },
                ].map((s) => (
                  <div key={s.label} className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-[#8c8580] mb-1">{s.label}</p>
                    <p className="text-sm font-semibold text-[#2c2825]">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* True cost of buying */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">The True Cost of Buying</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-6">Beyond the purchase price, what you need on closing day.</p>
              <div className="space-y-1 mb-5">
                {[
                  { label: "Ontario Land Transfer Tax", amount: ltt, note: isFirstTimeBuyer ? `Less $4,000 first-time buyer rebate = ${formatCurrency(Math.max(0, ltt - 4000))}` : "Paid on closing" },
                  { label: "Closing Costs (legal, title, admin)", amount: closingCosts, note: "~1.5% of purchase price" },
                  { label: "Home Inspection", amount: 500, note: "Strongly recommended · $450–$600" },
                  { label: "Real Estate Lawyer", amount: 2000, note: "$1,500–$2,500 estimated" },
                  { label: "Moving Costs", amount: 3000, note: "Local move estimate" },
                  { label: "First Year Maintenance Reserve", amount: Math.round(midPrice * 0.01), note: "~1% of purchase price annually" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-3 border-b border-[#f0ece6] last:border-0">
                    <div>
                      <p className="text-sm text-[#2c2825]">{row.label}</p>
                      <p className="text-xs text-[#8c8580] mt-0.5">{row.note}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#2c2825] shrink-0">{formatCurrency(row.amount)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-700 text-xs font-semibold uppercase tracking-wider mb-0.5">Budget beyond purchase price</p>
                  <p className="text-amber-600/70 text-xs">Excluding first year maintenance</p>
                </div>
                <p className="text-amber-800 font-bold text-xl">{formatCurrency(totalHiddenCosts)}</p>
              </div>
            </section>
          </>
        )}

        {/* ════ SHOWINGS ══════════════════════════════════════════════════════ */}
        {activeTab === "showings" && (
          <>
            {/* Request a showing */}
            <section id="showing-section" className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">Request a Showing</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-6">Pick a time and we&apos;ll make it happen.</p>
              {showingForm.submitted ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle size={22} className="text-emerald-500" />
                  </div>
                  <p className="text-[#2c2825] font-semibold text-center">Request sent!</p>
                  <p className="text-[#8c8580] text-sm text-center">Your realtor will confirm shortly.</p>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setShowingForm((prev) => ({ ...prev, submitting: true }));
                    let realtorId: string | null = null;
                    try { const raw = sessionStorage.getItem("homematch_answers"); if (raw) realtorId = JSON.parse(raw).realtorId ?? null; } catch { /* ignore */ }
                    if (!realtorId) realtorId = new URLSearchParams(window.location.search).get("r");
                    try {
                      const res = await fetch("/api/showings/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ realtorId, buyerName: answers.firstName || "", buyerEmail: answers.email || "", preferredDates: showingForm.dates, preferredTime: showingForm.time, message: showingForm.message }) });
                      if (res.ok || res.status === 404) setShowingForm((prev) => ({ ...prev, submitting: false, submitted: true }));
                      else throw new Error("failed");
                    } catch { setShowingForm((prev) => ({ ...prev, submitting: false })); toast("Something went wrong. Please message your realtor directly.", { variant: "save" }); }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#2c2825] mb-1.5">Preferred dates</label>
                    <input type="text" placeholder='e.g. "This weekend or next Tuesday"' value={showingForm.dates} onChange={(e) => setShowingForm((prev) => ({ ...prev, dates: e.target.value }))} required className="w-full bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#b8a88a]/60 focus:outline-none focus:border-[#b8a88a] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2c2825] mb-2">Preferred time</label>
                    <div className="flex gap-2 flex-wrap">
                      {["Morning", "Afternoon", "Evening"].map((slot) => (
                        <button key={slot} type="button" onClick={() => setShowingForm((prev) => ({ ...prev, time: prev.time === slot ? "" : slot }))} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all btn-press ${showingForm.time === slot ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-[#faf9f7] text-[#2c2825] border-[#e8e4de] hover:border-[#b8a88a]"}`}>{slot}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2c2825] mb-1.5">Anything to add? <span className="text-[#8c8580] font-normal">(optional)</span></label>
                    <textarea placeholder="Any specific homes you'd like to see, or notes for your realtor..." value={showingForm.message} onChange={(e) => setShowingForm((prev) => ({ ...prev, message: e.target.value }))} rows={3} className="w-full bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#b8a88a]/60 focus:outline-none focus:border-[#b8a88a] transition-colors resize-none" />
                  </div>
                  <button type="submit" disabled={showingForm.submitting || !showingForm.dates} className="inline-flex items-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#1a1714] transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed">
                    <CalendarDays size={14} />
                    {showingForm.submitting ? "Sending…" : "Request a Showing"}
                  </button>
                </form>
              )}
            </section>

            {/* Found the one? */}
            <section className="animate-fade-up">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Home size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">Found the one?</h2>
                  <p className="text-emerald-100 text-sm">Let&apos;s get you ready to move fast.</p>
                </div>
                {offerChecked.size > 0 && (
                  <div className="ml-auto bg-white/20 rounded-full px-3 py-1">
                    <p className="text-white text-xs font-bold">{offerChecked.size}/{OFFER_CHECKLIST.length} ready</p>
                  </div>
                )}
              </div>
              <div className="bg-white border border-emerald-200 border-t-0 rounded-b-2xl p-6">
                {offerSent ? (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center">
                      <Zap size={28} className="text-emerald-500" />
                    </div>
                    <p className="text-[#2c2825] font-bold text-lg">Your realtor has been alerted!</p>
                    <p className="text-[#8c8580] text-sm max-w-xs">{realtorFirst} has been notified with urgency and will be in touch very soon.</p>
                    <button onClick={() => setOfferSent(false)} className="mt-2 text-xs text-[#8c8580] underline">Start over</button>
                  </div>
                ) : (
                  <>
                    <p className="text-[#8c8580] text-sm mb-5">Check off everything below, then alert {realtorFirst}. They&apos;ll get an urgent notification the moment you hit send.</p>
                    <div className="mb-5">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#8c8580]">Offer readiness</span>
                        <span className={`font-semibold ${offerChecked.size === OFFER_CHECKLIST.length ? "text-emerald-600" : "text-[#2c2825]"}`}>{offerChecked.size} of {OFFER_CHECKLIST.length} complete</span>
                      </div>
                      <div className="h-2 bg-[#e8e4de] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(offerChecked.size / OFFER_CHECKLIST.length) * 100}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2.5 mb-6">
                      {OFFER_CHECKLIST.map((item) => {
                        const checked = offerChecked.has(item.id);
                        const isAuto = item.auto(answers);
                        return (
                          <button key={item.id} onClick={() => { if (isAuto) return; setOfferChecked((prev) => { const next = new Set(prev); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; }); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${checked ? "bg-emerald-50 border-emerald-300" : "bg-[#faf9f7] border-[#e8e4de] hover:border-emerald-300"} ${isAuto ? "cursor-default" : "cursor-pointer"}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "bg-emerald-500 border-emerald-500" : "border-[#d8d4ce]"}`}>
                              {checked && <Check size={11} className="text-white" />}
                            </div>
                            <span className={`text-sm flex-1 ${checked ? "text-emerald-800 font-medium" : "text-[#2c2825]"}`}>{item.label}</span>
                            {isAuto && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">Auto ✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-medium text-[#2c2825] mb-1.5">Which property? <span className="text-[#8c8580] font-normal">(optional)</span></label>
                      <input type="text" placeholder='e.g. "The one on Rosedale Valley Rd" or address' value={offerNote} onChange={(e) => setOfferNote(e.target.value)} className="w-full bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#b8a88a]/60 focus:outline-none focus:border-emerald-400 transition-colors" />
                    </div>
                    <button disabled={offerChecked.size === 0 || offerSending} onClick={async () => {
                      setOfferSending(true);
                      let realtorId: string | null = null;
                      try { const raw = sessionStorage.getItem("homematch_answers"); if (raw) realtorId = JSON.parse(raw).realtorId ?? null; } catch { /* ignore */ }
                      if (!realtorId) realtorId = new URLSearchParams(window.location.search).get("r");
                      try { await fetch("/api/offer-interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ realtorId, buyerName: answers.firstName || "Your buyer", buyerEmail: answers.email || "", propertyNote: offerNote, preApprovalStatus: answers.preApprovalStatus, checklistCompleted: offerChecked.size }) }); } catch { /* ignore */ }
                      setOfferSending(false); setOfferSent(true);
                    }} className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-4 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed btn-press">
                      <Zap size={16} />
                      {offerSending ? "Alerting your realtor…" : `Alert ${realtorFirst}: I'm ready to offer`}
                    </button>
                    {offerChecked.size === 0 && <p className="text-center text-xs text-[#b8b4b0] mt-2">Check at least one item to unlock</p>}
                  </>
                )}
              </div>
            </section>
          </>
        )}

        {/* ════ JOURNEY ═══════════════════════════════════════════════════════ */}
        {activeTab === "journey" && (
          <>
            {/* Closing roadmap */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">Your Closing Roadmap</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-5">From accepted offer to keys in hand, nothing surprises you.</p>
              <div className="space-y-2">
                {CLOSING_STEPS.map((phase) => (
                  <div key={phase.phase} className="border border-[#e8e4de] rounded-xl overflow-hidden">
                    <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#faf9f7] transition-colors" onClick={() => setOpenPhase(openPhase === phase.phase ? null : phase.phase)}>
                      <span className="text-sm font-medium text-[#2c2825]">{phase.phase}</span>
                      {openPhase === phase.phase ? <ChevronUp size={15} className="text-[#8c8580]" /> : <ChevronDown size={15} className="text-[#8c8580]" />}
                    </button>
                    {openPhase === phase.phase && (
                      <div className="px-5 pb-4 border-t border-[#f0ece6] animate-fade-in">
                        <ul className="space-y-2 mt-3">
                          {phase.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-[#5c5550]">
                              <Circle size={12} className="text-[#e8e4de] shrink-0 mt-1" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Mortgage readiness checklist */}
            {answers.mortgageChecklist.length > 0 && (
              <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
                <h2 className="text-[#2c2825] font-semibold mb-1">Mortgage Readiness Checklist</h2>
                <p className="text-[#8c8580] text-sm mb-5">Complete these before your lender appointment to speed up approval.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {answers.mortgageChecklist.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${item.completed ? "bg-emerald-50 border-emerald-200" : "bg-[#faf9f7] border-[#e8e4de]"}`}>
                      <CheckCircle size={16} className={item.completed ? "text-emerald-500" : "text-[#e8e4de]"} />
                      <p className={`text-sm ${item.completed ? "text-emerald-800 line-through" : "text-[#2c2825]"}`}>{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#8c8580]">Progress</span>
                  <span className="text-[#2c2825] font-medium">{answers.mortgageChecklist.filter((i) => i.completed).length} of {answers.mortgageChecklist.length} complete</span>
                </div>
                <div className="h-2 bg-[#e8e4de] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(answers.mortgageChecklist.filter((i) => i.completed).length / answers.mortgageChecklist.length) * 100}%` }} />
                </div>
              </section>
            )}

            {/* Things every buyer should know */}
            <section className="bg-white border border-[#e8e4de] rounded-2xl p-6 animate-fade-up">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={16} className="text-[#b8a88a]" />
                <h2 className="text-[#2c2825] font-semibold">Things Every Buyer Should Know</h2>
              </div>
              <p className="text-[#8c8580] text-sm mb-5">Plain-language answers to the questions most buyers are afraid to ask.</p>
              <div className="space-y-2">
                {FTB_TIPS.map((tip, i) => (
                  <div key={tip.title} className="border border-[#e8e4de] rounded-xl overflow-hidden">
                    <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#faf9f7] transition-colors" onClick={() => setOpenTip(openTip === i ? null : i)}>
                      <span className="text-sm font-medium text-[#2c2825]">{tip.title}</span>
                      {openTip === i ? <ChevronUp size={15} className="text-[#8c8580]" /> : <ChevronDown size={15} className="text-[#8c8580]" />}
                    </button>
                    {openTip === i && (
                      <div className="px-5 pb-4 border-t border-[#f0ece6] animate-fade-in">
                        <p className="text-sm text-[#5c5550] leading-relaxed mt-3">{tip.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Update profile CTA */}
            <section className="bg-[#2c2825] rounded-2xl p-8 animate-fade-up text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={20} className="text-[#b8a88a]" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">Keep your profile sharp.</h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                {branding.tagline || "The more we know about what you love, the better your matches get."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={`mailto:${branding.email}?subject=HomeMatch - Ready to connect`} className="inline-flex items-center justify-center gap-2 bg-[#b8a88a] text-[#1a1512] text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#c9b99b] transition-colors btn-press">
                  <MessageCircle size={14} /> Message {realtorFirst}
                </a>
                <Link href="/questionnaire" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white text-sm font-medium px-6 py-3 rounded-full hover:border-white/40 transition-colors">
                  Update My Profile <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </>
        )}

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ label, value, color = "amber" }: { label: string; value: string; color?: string }) {
  const styles: Record<string, string> = {
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div className={`${styles[color] ?? styles.amber} border rounded-xl px-4 py-3`}>
      <p className="text-[#8c8580] text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function PortalPropertyCard({
  property: p,
  saved,
  onToggle,
  realtorName,
}: {
  property: PropertyRecommendation;
  saved: boolean;
  onToggle: () => void;
  realtorName: string;
}) {
  return (
    <TiltCard className={`rounded-2xl overflow-hidden ${saved ? "shadow-gold" : "shadow-warm-md"}`}>
      <div className="group bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
        {/* Cinematic image */}
        <div className="relative h-52 overflow-hidden">
          <Image src={p.imageUrl} alt={p.address} fill className="object-cover img-zoom" unoptimized />
          <div className="card-image-overlay-rich absolute inset-0" />

          <button
            onClick={onToggle}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all hover:scale-110 active:scale-90 ${
              saved ? "bg-rose-500" : "bg-white/90 backdrop-blur-sm"
            }`}
          >
            <Heart size={15} className={saved ? "fill-white text-white" : "text-[#8c8580]"} />
          </button>

          {/* Realtor pick badge + price overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white font-bold text-xl drop-shadow-sm leading-none">{formatCurrency(p.price)}</p>
              </div>
              <div className="flex items-center gap-1 bg-[#2c2825]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                <Sparkles size={9} />
                {realtorName.split(" ")[0]}&apos;s pick
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="text-[#2c2825] font-medium text-sm mb-1">{p.address}</p>
          <div className="flex items-center gap-4 text-xs text-[#8c8580] mb-4">
            <span className="flex items-center gap-1.5"><BedDouble size={12} /> {p.bedrooms} bed</span>
            <span className="flex items-center gap-1.5"><Bath size={12} /> {p.bathrooms} bath</span>
            <span className="flex items-center gap-1.5"><Ruler size={12} /> {p.sqft.toLocaleString()} sqft</span>
          </div>
          <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl p-3 mb-4">
            <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-1">Why this feels right</p>
            <p className="text-[#2c2825] text-xs leading-relaxed">{p.matchReason}</p>
          </div>
          <button
            onClick={onToggle}
            className={`w-full text-sm font-medium py-2.5 rounded-full transition-all btn-press ${
              saved
                ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                : "bg-[#2c2825] text-white hover:bg-[#1a1714]"
            }`}
          >
            {saved ? "Saved to Dream Collection ✓" : "Add to Dream Collection"}
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
