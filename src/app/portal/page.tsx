"use client";

import { useState, useEffect } from "react";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { PropertyRecommendation, QuestionnaireAnswers } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Heart, BedDouble, Bath, Ruler, CheckCircle, Circle,
  Lightbulb, BookOpen, MapPin, ShieldCheck, ChevronDown,
  ChevronUp, Info, ArrowRight, TrendingUp, MessageCircle,
  Sparkles, Star, Bell,
} from "lucide-react";
import { calcBuyerReadiness } from "@/lib/buyerMatch";
import { useBranding } from "@/context/BrandingContext";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_LEAD = mockLeads.find((l) => l.id === "lead-001")!;

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

// ─── Neighbourhood lifestyle data ────────────────────────────────────────────
const NEIGHBOURHOOD_MATCHES = [
  {
    name: "Rosedale",
    city: "Toronto",
    vibes: ["Quiet & residential", "Tree-lined streets"],
    priceRange: "$1.4M – $3M+",
    highlights: ["Top-ranked schools", "Ravine trails", "Mature canopy streets", "Boutique village feel"],
    fit: 95,
  },
  {
    name: "Forest Hill",
    city: "Toronto",
    vibes: ["Quiet & residential", "Near schools"],
    priceRange: "$1.6M – $4M+",
    highlights: ["UCC & BSS school district", "Village shops", "Large lots", "Safe, walkable streets"],
    fit: 88,
  },
  {
    name: "Lawrence Park",
    city: "Toronto",
    vibes: ["Quiet & residential", "Near transit"],
    priceRange: "$1.2M – $2.5M",
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
    setLoaded(true);
  }, [fallbackIds]);

  function toggle(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("homematch_saved_homes", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  return { savedIds, toggle, loaded };
}

// ─── Realtor Banner ───────────────────────────────────────────────────────────
function RealtorBanner({ realtorName, message }: { realtorName: string; message: string }) {
  return (
    <div className="bg-white border border-[#b8a88a]/40 rounded-2xl p-4 flex items-center gap-4">
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
      <button className="shrink-0 flex items-center gap-1.5 bg-[#2c2825] text-white text-xs font-medium px-3 py-2 rounded-full hover:bg-[#1a1714] transition-colors">
        <MessageCircle size={12} />
        Message
      </button>
    </div>
  );
}

// ─── New matches badge ─────────────────────────────────────────────────────
function NewMatchesBadge({ count, realtorName }: { count: number; realtorName: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 bg-[#b8a88a]/10 border border-[#b8a88a]/30 rounded-xl px-4 py-3">
      <div className="w-7 h-7 rounded-full bg-[#b8a88a] flex items-center justify-center shrink-0">
        <Bell size={13} className="text-white" />
      </div>
      <p className="text-[#2c2825] text-sm">
        <span className="font-semibold">{count} new {count === 1 ? "home" : "homes"}</span> match your profile since your last visit.{" "}
        <span className="text-[#8c8580]">{realtorName} is keeping an eye out for you.</span>
      </p>
    </div>
  );
}

// ─── Vibe summary ─────────────────────────────────────────────────────────
function VibeSummary({ answers }: { answers: QuestionnaireAnswers }) {
  const feelings = answers.homeFeeling?.slice(0, 3) || [];
  const style = answers.modernVsCozy || "";
  const hosting = answers.hostingVsPrivacy || "";
  const items = [...feelings, style, hosting].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-[#b8a88a]" />
        <p className="text-[#2c2825] font-semibold text-sm">Your Home Personality</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="bg-[#faf9f7] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full">
            {item}
          </span>
        ))}
      </div>
      {answers.sundayMorning && (
        <p className="text-[#8c8580] text-xs mt-3 italic">
          Dream Sunday: &quot;{answers.sundayMorning}&quot;
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuyerPortalPage() {
  const { branding } = useBranding();

  // ── Load buyer answers from sessionStorage, fall back to demo lead ──────
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(FALLBACK_LEAD.answers);
  const [isRealUser, setIsRealUser] = useState(false);
  const [newMatchCount, setNewMatchCount] = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("homematch_answers");
      if (raw) {
        const parsed = JSON.parse(raw);
        setAnswers(parsed);
        setIsRealUser(true);
      }
    } catch { /* ignore */ }

    // Track last visit for "new matches" return trigger
    try {
      const lastVisit = localStorage.getItem("homematch_last_portal_visit");
      const now = Date.now();
      if (lastVisit) {
        const hoursSince = (now - parseInt(lastVisit)) / (1000 * 60 * 60);
        // Simulate: every 24hrs of absence = 1-3 new matches
        if (hoursSince > 1) setNewMatchCount(Math.min(3, Math.floor(hoursSince / 8) + 1));
      }
      localStorage.setItem("homematch_last_portal_visit", String(now));
    } catch { /* ignore */ }
  }, []);

  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [openTip, setOpenTip] = useState<number | null>(null);

  const fallbackSavedIds = isRealUser ? [] : (FALLBACK_LEAD.savedHomeIds || []);
  const { savedIds, toggle } = useSavedHomes(fallbackSavedIds);

  const recommendations = mockProperties.filter((p) => p.leadId === "lead-001");
  const readiness = calcBuyerReadiness(answers);
  const midPrice = (answers.budgetMin + answers.budgetMax) / 2;
  const downPayment = midPrice * 0.2;
  const monthlyPayment = calcMonthlyPayment(midPrice);
  const ltt = ontarioLTT(midPrice);
  const closingCosts = Math.round(midPrice * 0.015);
  const totalHiddenCosts = ltt + closingCosts + 500 + 2000 + 3000;
  const isFirstTimeBuyer = answers.ownershipStatus === "First-time buyer";

  // Dynamic realtor messages
  const realtorMessages = [
    `${newMatchCount > 0 ? `I found ${newMatchCount} new homes that match your profile. ` : ""}Your profile is looking great. Let me know when you're ready to tour.`,
    "I've been keeping an eye on your saved neighbourhoods. A few interesting properties just came up.",
    "Based on your preferences, I think you're going to love what's available right now.",
  ];
  const realtorMessage = realtorMessages[0];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 space-y-6">

        {/* ── Realtor banner ────────────────────────────────────────────────── */}
        <RealtorBanner
          realtorName={branding.realtorName}
          message={realtorMessage}
        />

        {/* ── New matches badge ─────────────────────────────────────────────── */}
        <NewMatchesBadge count={newMatchCount} realtorName={branding.realtorName} />

        {/* ── Welcome header ───────────────────────────────────────────────── */}
        <div className="bg-[#2c2825] rounded-3xl p-8 text-white">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-3">
            Your Home Hub
          </p>
          <h1 className="text-2xl font-semibold mb-1">
            Welcome back{answers.firstName ? `, ${answers.firstName}` : ""}.
          </h1>
          <p className="text-[#e8e4de]/70 text-sm mb-6">
            {isRealUser
              ? "Your profile is active. Everything below is personalised to you."
              : "Explore your tools, insights, and matched homes below."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Stat label="Readiness Score" value={`${readiness.overall}/100`} />
            <Stat label="Budget" value={`${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`} />
            <Stat label="Timeline" value={answers.timeline || "-"} />
            <Stat label="Saved Homes" value={String(savedIds.size)} />
          </div>
        </div>

        {/* ── Home Personality ──────────────────────────────────────────────── */}
        {answers.homeFeeling && answers.homeFeeling.length > 0 && (
          <VibeSummary answers={answers} />
        )}

        {/* ── First-time buyer banner ───────────────────────────────────────── */}
        {isFirstTimeBuyer && (
          <div className="bg-[#b8a88a]/10 border border-[#b8a88a]/30 rounded-2xl p-5 flex gap-4 items-start">
            <Info size={18} className="text-[#b8a88a] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#2c2825] font-medium text-sm mb-1">First-time buyer? We've got you.</p>
              <p className="text-[#8c8580] text-sm">
                You qualify for the Ontario First-Time Home Buyer Land Transfer Tax Rebate (up to $4,000) and may be eligible for the FHSA and Home Buyers' Plan. See your tips below.
              </p>
            </div>
          </div>
        )}

        {/* ── Buyer Readiness Score ─────────────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#b8a88a]" />
              <div>
                <h2 className="text-[#2c2825] font-semibold">Buyer Readiness Score</h2>
                <p className="text-[#8c8580] text-sm mt-0.5">How prepared you are to move on the right home.</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-2xl font-bold ${readiness.overall >= 80 ? "text-emerald-600" : readiness.overall >= 60 ? "text-[#b8a88a]" : readiness.overall >= 40 ? "text-amber-500" : "text-[#8c8580]"}`}>
                {readiness.overall}<span className="text-sm font-normal text-[#8c8580]">/100</span>
              </p>
              <p className="text-xs text-[#8c8580] mt-0.5">{readiness.label}</p>
            </div>
          </div>

          <div className="space-y-4 mb-5">
            {[readiness.financing, readiness.timeline, readiness.documentation, readiness.commitment].map((dim) => (
              <div key={dim.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#2c2825] font-medium">{dim.label}</span>
                  <span className="text-[#8c8580]">{dim.detail}</span>
                </div>
                <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${dim.score >= 75 ? "bg-emerald-500" : dim.score >= 50 ? "bg-[#b8a88a]" : dim.score >= 30 ? "bg-amber-400" : "bg-slate-300"}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {readiness.tip && (
            <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 flex gap-3 items-start">
              <Info size={14} className="text-[#b8a88a] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#5c5550]">{readiness.tip}</p>
                <p className="text-xs text-[#b8a88a] mt-1">
                  {branding.realtorName} can help you with this step.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Affordability insights ────────────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={16} className="text-[#b8a88a]" />
            <h2 className="text-[#2c2825] font-semibold">Affordability Insights</h2>
          </div>
          <p className="text-[#8c8580] text-sm mb-6">
            Based on the midpoint of your budget ({formatCurrency(midPrice)}), 20% down, 25-year amortization at 5.5%.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Est. Monthly Payment", value: formatCurrency(Math.round(monthlyPayment)), note: "Principal & interest" },
              { label: "Down Payment (20%)", value: formatCurrency(Math.round(downPayment)), note: "To avoid CMHC insurance" },
              { label: "Annual Property Tax", value: "~" + formatCurrency(Math.round(midPrice * 0.007)), note: "Estimate ~0.7% of value" },
              { label: "Monthly All-In Est.", value: formatCurrency(Math.round(monthlyPayment + (midPrice * 0.007) / 12 + 250)), note: "Payment + tax + maintenance" },
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
                { range: formatCurrency(answers.budgetMin), label: "Entry point: look for townhomes or smaller detached" },
                { range: formatCurrency(Math.round(midPrice)), label: "Mid-range: detached with good bones in your neighbourhoods" },
                { range: formatCurrency(answers.budgetMax), label: "Top of range: larger lots, more finishes, less compromise" },
              ].map((b) => (
                <div key={b.range} className="flex items-start gap-2">
                  <span className="text-[#b8a88a] font-semibold shrink-0">{b.range}</span>
                  <span className="text-[#8c8580] text-xs leading-relaxed">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hidden costs calculator ───────────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-[#b8a88a]" />
            <h2 className="text-[#2c2825] font-semibold">Hidden Cost Estimator</h2>
          </div>
          <p className="text-[#8c8580] text-sm mb-6">
            Beyond your purchase price, plan for these costs on closing day.
          </p>

          <div className="space-y-2 mb-5">
            {[
              { label: "Ontario Land Transfer Tax", amount: ltt, note: isFirstTimeBuyer ? `Less $4,000 first-time buyer rebate = ${formatCurrency(Math.max(0, ltt - 4000))}` : "Paid on closing" },
              { label: "Closing Costs (legal, title, admin)", amount: closingCosts, note: "~1.5% of purchase price" },
              { label: "Home Inspection", amount: 500, note: "Strongly recommended, $450-$600" },
              { label: "Real Estate Lawyer", amount: 2000, note: "Estimated $1,500–$2,500" },
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

          <div className="bg-[#2c2825] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#b8a88a] text-xs uppercase tracking-wider mb-0.5">Total to budget beyond purchase price</p>
              <p className="text-white text-xs">(excluding first year maintenance)</p>
            </div>
            <p className="text-white font-bold text-xl">{formatCurrency(totalHiddenCosts)}</p>
          </div>
        </section>

        {/* ── Neighbourhood lifestyle match ─────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-[#b8a88a]" />
            <h2 className="text-[#2c2825] font-semibold">Neighbourhood Lifestyle Match</h2>
          </div>
          <p className="text-[#8c8580] text-sm mb-2">
            Based on your vibe preferences, here&apos;s how your top areas score for your lifestyle.
          </p>
          <p className="text-[#b8a88a] text-xs mb-5 italic">
            {branding.realtorName} is actively watching these neighbourhoods for you.
          </p>

          <div className="space-y-4">
            {NEIGHBOURHOOD_MATCHES.map((n) => (
              <div key={n.name} className="border border-[#e8e4de] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[#2c2825] font-semibold">{n.name}</p>
                    <p className="text-[#8c8580] text-xs">{n.city} · {n.priceRange}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={12} className={n.fit >= 90 ? "fill-emerald-500 text-emerald-500" : "fill-[#b8a88a] text-[#b8a88a]"} />
                    <span className={`text-sm font-bold ${n.fit >= 90 ? "text-emerald-600" : "text-[#b8a88a]"}`}>
                      {n.fit}% fit
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full ${n.fit >= 90 ? "bg-emerald-500" : "bg-[#b8a88a]"}`}
                    style={{ width: `${n.fit}%` }}
                  />
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

        {/* ── Mortgage readiness checklist ─────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <h2 className="text-[#2c2825] font-semibold mb-1">Mortgage Readiness Checklist</h2>
          <p className="text-[#8c8580] text-sm mb-5">Complete these before your lender appointment to speed up approval.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {answers.mortgageChecklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  item.completed ? "bg-emerald-50 border-emerald-200" : "bg-[#faf9f7] border-[#e8e4de]"
                }`}
              >
                <CheckCircle size={16} className={item.completed ? "text-emerald-500" : "text-[#e8e4de]"} />
                <p className={`text-sm ${item.completed ? "text-emerald-800 line-through" : "text-[#2c2825]"}`}>{item.label}</p>
              </div>
            ))}
          </div>
          {answers.mortgageChecklist.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#e8e4de]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#8c8580]">Progress</span>
                <span className="text-[#2c2825] font-medium">
                  {answers.mortgageChecklist.filter((i) => i.completed).length} of {answers.mortgageChecklist.length} complete
                </span>
              </div>
              <div className="h-2 bg-[#e8e4de] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(answers.mortgageChecklist.filter((i) => i.completed).length / answers.mortgageChecklist.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Closing checklist ─────────────────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-[#b8a88a]" />
            <h2 className="text-[#2c2825] font-semibold">Closing Checklist</h2>
          </div>
          <p className="text-[#8c8580] text-sm mb-5">From accepted offer to keys in hand.</p>
          <div className="space-y-2">
            {CLOSING_STEPS.map((phase) => (
              <div key={phase.phase} className="border border-[#e8e4de] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#faf9f7] transition-colors"
                  onClick={() => setOpenPhase(openPhase === phase.phase ? null : phase.phase)}
                >
                  <span className="text-sm font-medium text-[#2c2825]">{phase.phase}</span>
                  {openPhase === phase.phase ? <ChevronUp size={15} className="text-[#8c8580]" /> : <ChevronDown size={15} className="text-[#8c8580]" />}
                </button>
                {openPhase === phase.phase && (
                  <div className="px-5 pb-4 border-t border-[#f0ece6]">
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

        {/* ── First-time buyer guide ────────────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-[#b8a88a]" />
            <h2 className="text-[#2c2825] font-semibold">Buyer Knowledge Base</h2>
          </div>
          <p className="text-[#8c8580] text-sm mb-5">Plain-language answers to the questions most buyers are afraid to ask.</p>
          <div className="space-y-2">
            {FTB_TIPS.map((tip, i) => (
              <div key={tip.title} className="border border-[#e8e4de] rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#faf9f7] transition-colors"
                  onClick={() => setOpenTip(openTip === i ? null : i)}
                >
                  <span className="text-sm font-medium text-[#2c2825]">{tip.title}</span>
                  {openTip === i ? <ChevronUp size={15} className="text-[#8c8580]" /> : <ChevronDown size={15} className="text-[#8c8580]" />}
                </button>
                {openTip === i && (
                  <div className="px-5 pb-4 border-t border-[#f0ece6]">
                    <p className="text-sm text-[#5c5550] leading-relaxed mt-3">{tip.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Matched homes ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[#2c2825] font-semibold">Your Matched Homes</h2>
              <p className="text-[#8c8580] text-sm">
                Handpicked by {branding.realtorName} to match your profile.
              </p>
            </div>
            <Link
              href="/listings"
              className="shrink-0 text-xs text-[#2c2825] border border-[#e8e4de] px-3 py-1.5 rounded-full hover:border-[#2c2825] transition-colors"
            >
              Browse all
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-10 text-center">
              <p className="text-[#2c2825] font-medium mb-2">Matched homes coming soon</p>
              <p className="text-[#8c8580] text-sm">{branding.realtorName} will add curated listings here for you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recommendations.map((p) => (
                <PortalPropertyCard key={p.id} property={p} saved={savedIds.has(p.id)} onToggle={() => toggle(p.id)} realtorName={branding.realtorName} />
              ))}
            </div>
          )}
        </section>

        {/* ── Connect when ready ────────────────────────────────────────────── */}
        <section className="bg-[#2c2825] rounded-2xl p-8">
          <p className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase mb-3">Your Advisor</p>
          <h2 className="text-white font-semibold text-lg mb-2">{branding.realtorName} is ready when you are.</h2>
          <p className="text-[#e8e4de]/70 text-sm leading-relaxed max-w-md mb-6">
            {branding.tagline || "Your profile is complete. Connect whenever the time feels right."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center justify-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#c9b99b] transition-colors">
              <MessageCircle size={14} />
              Message {branding.realtorName.split(" ")[0]}
            </button>
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white text-sm px-6 py-2.5 rounded-full hover:border-white/40 transition-colors"
            >
              Update My Profile
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl px-4 py-3">
      <p className="text-[#e8e4de]/60 text-xs mb-0.5">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
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
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-44">
        <Image src={p.imageUrl} alt={p.address} fill className="object-cover" unoptimized />
        <button
          onClick={onToggle}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition-all hover:scale-110 active:scale-95"
        >
          <Heart size={15} className={saved ? "fill-rose-500 text-rose-500" : "text-[#8c8580]"} />
        </button>
        {/* Realtor pick badge */}
        <div className="absolute bottom-3 left-3 bg-[#2c2825]/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={10} />
          {realtorName.split(" ")[0]}&apos;s pick
        </div>
      </div>
      <div className="p-5">
        <p className="text-[#2c2825] font-medium text-sm mb-1">{p.address}</p>
        <p className="text-[#b8a88a] font-semibold text-lg mb-3">{formatCurrency(p.price)}</p>
        <div className="flex items-center gap-4 text-xs text-[#8c8580] mb-4">
          <span className="flex items-center gap-1.5"><BedDouble size={12} /> {p.bedrooms} bed</span>
          <span className="flex items-center gap-1.5"><Bath size={12} /> {p.bathrooms} bath</span>
          <span className="flex items-center gap-1.5"><Ruler size={12} /> {p.sqft.toLocaleString()} sqft</span>
        </div>
        <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl p-3 mb-4">
          <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-1">Why this matches you</p>
          <p className="text-[#2c2825] text-xs leading-relaxed">{p.matchReason}</p>
        </div>
        <button
          onClick={onToggle}
          className={`w-full text-sm font-medium py-2.5 rounded-full transition-all active:scale-95 ${
            saved
              ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
              : "bg-[#2c2825] text-white hover:bg-[#1a1714]"
          }`}
        >
          {saved ? "Saved ✓" : "Save for Later"}
        </button>
      </div>
    </div>
  );
}
