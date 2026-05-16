"use client";

import { useState } from "react";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { PropertyRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Heart, BedDouble, Bath, Ruler, CheckCircle, Circle,
  Lightbulb, BookOpen, MapPin, ShieldCheck, ChevronDown,
  ChevronUp, Info, ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DEMO_LEAD = mockLeads.find((l) => l.id === "lead-001")!;
const { answers } = DEMO_LEAD;

// ─── Affordability math ───────────────────────────────────────────────────────
function calcMonthlyPayment(price: number, downPct = 0.2, annualRate = 0.055, years = 25) {
  const principal = price * (1 - downPct);
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Ontario LTT (simplified)
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

// ─── Closing checklist ────────────────────────────────────────────────────────
const CLOSING_STEPS = [
  { phase: "Offer Stage", items: ["Get pre-approval letter in hand", "Review offer conditions with your lawyer", "Submit offer with deposit cheque ready", "Negotiate conditions (inspection, financing)"] },
  { phase: "After Accepted Offer", items: ["Book home inspection within condition period", "Confirm financing with lender", "Review status certificate (condo) or title search", "Hire a real estate lawyer"] },
  { phase: "Closing Day Prep", items: ["Wire closing funds to lawyer in trust", "Confirm utilities transfer date", "Do a final walkthrough 24–48 hrs before close", "Arrange moving truck and storage if needed"] },
  { phase: "Keys in Hand", items: ["Pick up keys from lawyer or agent", "Change all locks immediately", "Set up home insurance (required on close)", "Register for property tax account with municipality"] },
];

// ─── First-time buyer tips ─────────────────────────────────────────────────
const FTB_TIPS = [
  { title: "Get pre-approved, not just pre-qualified", body: "Pre-approval means a lender has verified your income and credit. It's a real number — not an estimate. Most sellers won't take your offer seriously without it." },
  { title: "Land Transfer Tax is real money", body: "In Ontario, expect to pay 1–2% of purchase price in land transfer tax. First-time buyers get a rebate up to $4,000 — but anything above goes out of pocket on closing day." },
  { title: "The list price is rarely the final price", body: "In competitive markets, homes often sell above asking. Build a buffer into your max budget — never use your full approval amount as your shopping price." },
  { title: "Freehold vs. condo: very different commitments", body: "Condo buyers share maintenance costs through monthly fees. Freehold owners handle everything themselves. Neither is better — it depends on your lifestyle and risk tolerance." },
  { title: "Your lawyer matters more than you think", body: "A real estate lawyer reviews the title, coordinates funds, and catches anything your agent might miss. Budget $1,500–$2,500 and find one before you make an offer." },
];

export default function BuyerPortalPage() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(DEMO_LEAD.savedHomeIds));
  const [openPhase, setOpenPhase] = useState<string | null>(null);
  const [openTip, setOpenTip] = useState<number | null>(null);

  const recommendations = mockProperties.filter((p) => p.leadId === "lead-001");

  function toggle(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const midPrice = (answers.budgetMin + answers.budgetMax) / 2;
  const downPayment = midPrice * 0.2;
  const monthlyPayment = calcMonthlyPayment(midPrice);
  const ltt = ontarioLTT(midPrice);
  const closingCosts = Math.round(midPrice * 0.015);
  const totalHiddenCosts = ltt + closingCosts + 500 + 2000 + 3000; // inspection + lawyer + moving
  const isFirstTimeBuyer = answers.ownershipStatus === "First-time buyer";

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 space-y-8">

        {/* ── Welcome header ───────────────────────────────────────────────── */}
        <div className="bg-[#2c2825] rounded-3xl p-8 text-white">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-3">
            Your Home Hub
          </p>
          <h1 className="text-2xl font-semibold mb-1">
            Welcome back, {answers.firstName}.
          </h1>
          <p className="text-[#e8e4de]/70 text-sm mb-6">
            Your profile is active. Explore your tools, insights, and matched homes below — at your pace.
          </p>
          <div className="flex flex-wrap gap-4">
            <Stat label="Readiness Score" value={`${DEMO_LEAD.matchScore}/100`} />
            <Stat label="Budget" value={`${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`} />
            <Stat label="Timeline" value={answers.timeline || "—"} />
            <Stat label="Saved Homes" value={String(savedIds.size)} />
          </div>
        </div>

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
                { range: formatCurrency(answers.budgetMin), label: "Entry point — look for townhomes or smaller detached" },
                { range: formatCurrency(Math.round(midPrice)), label: "Mid-range — detached with good bones in your neighbourhoods" },
                { range: formatCurrency(answers.budgetMax), label: "Top of range — larger lots, more finishes, less compromise" },
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
            Beyond your purchase price, plan for these costs on closing day — most buyers are surprised by them.
          </p>

          <div className="space-y-2 mb-5">
            {[
              { label: "Ontario Land Transfer Tax", amount: ltt, note: isFirstTimeBuyer ? `Less $4,000 first-time buyer rebate = ${formatCurrency(Math.max(0, ltt - 4000))}` : "Paid on closing" },
              { label: "Closing Costs (legal, title, admin)", amount: closingCosts, note: "~1.5% of purchase price" },
              { label: "Home Inspection", amount: 500, note: "Strongly recommended — budgets $450–$600" },
              { label: "Real Estate Lawyer", amount: 2000, note: "Estimated $1,500–$2,500" },
              { label: "Moving Costs", amount: 3000, note: "Local move estimate — varies by size" },
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
          <p className="text-[#8c8580] text-sm mb-6">
            Based on your vibe preferences, here's how your top areas score for your lifestyle.
          </p>

          <div className="space-y-4">
            {NEIGHBOURHOOD_MATCHES.map((n) => (
              <div key={n.name} className="border border-[#e8e4de] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[#2c2825] font-semibold">{n.name}</p>
                    <p className="text-[#8c8580] text-xs">{n.city} · {n.priceRange}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold ${n.fit >= 90 ? "text-emerald-600" : n.fit >= 80 ? "text-[#b8a88a]" : "text-[#8c8580]"}`}>
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
        </section>

        {/* ── Closing checklist ─────────────────────────────────────────────── */}
        <section className="bg-white border border-[#e8e4de] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-[#b8a88a]" />
            <h2 className="text-[#2c2825] font-semibold">Closing Checklist</h2>
          </div>
          <p className="text-[#8c8580] text-sm mb-5">From accepted offer to keys in hand — what to expect at each stage.</p>
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
          <div className="mb-5">
            <h2 className="text-[#2c2825] font-semibold">Your Matched Homes</h2>
            <p className="text-[#8c8580] text-sm">Properties matched to your profile — save the ones you want to revisit.</p>
          </div>
          {recommendations.length === 0 ? (
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-10 text-center">
              <p className="text-[#2c2825] font-medium mb-2">Matched homes coming soon</p>
              <p className="text-[#8c8580] text-sm">Complete your profile to unlock personalised property matches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recommendations.map((p) => (
                <PortalPropertyCard key={p.id} property={p} saved={savedIds.has(p.id)} onToggle={() => toggle(p.id)} />
              ))}
            </div>
          )}
        </section>

        {/* ── Connect when ready ────────────────────────────────────────────── */}
        <section className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-8 text-center">
          <p className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase mb-3">No Pressure</p>
          <h2 className="text-[#2c2825] font-semibold text-lg mb-3">Ready to connect with a professional?</h2>
          <p className="text-[#8c8580] text-sm leading-relaxed max-w-md mx-auto mb-6">
            When you feel informed and ready, share your completed profile with a real estate professional. They'll have everything they need to hit the ground running — without any introductory back-and-forth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Update My Profile
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] bg-white text-[#2c2825] text-sm px-6 py-2.5 rounded-full hover:border-[#2c2825] transition-colors"
            >
              Browse Listings
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

function PortalPropertyCard({ property: p, saved, onToggle }: { property: PropertyRecommendation; saved: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-44">
        <Image src={p.imageUrl} alt={p.address} fill className="object-cover" unoptimized />
        <button
          onClick={onToggle}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition-all hover:scale-110"
        >
          <Heart size={15} className={saved ? "fill-rose-500 text-rose-500" : "text-[#8c8580]"} />
        </button>
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
        <button className="w-full bg-[#2c2825] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#1a1714] transition-colors">
          Save for Later
        </button>
      </div>
    </div>
  );
}
