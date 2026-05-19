"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing, QuestionnaireAnswers } from "@/types";
import { mockLeads } from "@/data/mockLeads";
import { matchListingToLead } from "@/data/niagaraListings";
import { calcBuyerCompatibility, calcAffordabilitySnapshot } from "@/lib/buyerMatch";
import { calcLifestyleLayer } from "@/lib/lifestyleLayer";
import LifestyleLayerPanel from "@/components/listings/LifestyleLayer";
import { formatCurrency } from "@/lib/utils";
import {
  Bed, Bath, Maximize2, Calendar, Tag, MapPin,
  ChevronLeft, ChevronRight, ExternalLink, TrendingUp,
  AlertTriangle, CheckCircle2, Home, Thermometer, Car,
  Sparkles, DollarSign, X,
} from "lucide-react";

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency", currency: "CAD", maximumFractionDigits: 0,
  }).format(p);
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Price Reduced": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Contract": "bg-blue-100 text-blue-700 border-blue-200",
  Sold: "bg-[#e8e4de] text-[#8c8580] border-[#e8e4de]",
};

// ─── Vibe insight generator ────────────────────────────────────────────────
// Maps the buyer's personality answers to emotionally resonant listing insights.
function buildVibeInsights(
  answers: Partial<QuestionnaireAnswers>,
  listing: Listing
): Array<{ emoji: string; headline: string; detail: string }> {
  const insights: Array<{ emoji: string; headline: string; detail: string }> = [];
  const featuresLower = listing.features.map((f) => f.toLowerCase()).join(" ");
  const descLower = (listing.description || "").toLowerCase();
  const allText = featuresLower + " " + descLower;

  // Hosting vs Privacy
  if (answers.hostingVsPrivacy === "Private sanctuary") {
    insights.push({
      emoji: "🌿",
      headline: "Your private retreat",
      detail: "You said you need a true escape. " + (
        allText.includes("ravine") ? "This home backs onto a ravine, no neighbours behind you." :
        allText.includes("backyard") || allText.includes("garden") ? "The private backyard means you can breathe without an audience." :
        "The lot and layout give you the separation you're looking for."
      ),
    });
  } else if (answers.hostingVsPrivacy === "Hosting haven") {
    insights.push({
      emoji: "🥂",
      headline: "Made for hosting",
      detail: "You love having people over. " + (
        allText.includes("open concept") || allText.includes("kitchen island") ? "The open-concept layout flows naturally for entertaining." :
        allText.includes("backyard") || allText.includes("patio") ? "The outdoor space is exactly where those long summer evenings happen." :
        "The space and layout were built for gathering."
      ),
    });
  }

  // Sunday morning mood
  const sunday = answers.sundayMorning || "";
  if (sunday.includes("sunny kitchen") || sunday.includes("coffee")) {
    if (allText.includes("east") || allText.includes("south") || allText.includes("bright") || allText.includes("natural light")) {
      insights.push({
        emoji: "☕",
        headline: "Your Sunday morning is here",
        detail: `You pictured "${sunday.toLowerCase()}". This kitchen gets beautiful natural light. That moment is very possible.`,
      });
    }
  } else if (sunday.includes("walk") || sunday.includes("cafe")) {
    insights.push({
      emoji: "🚶",
      headline: "Walkability that feeds your lifestyle",
      detail: `You crave "${sunday.toLowerCase()}". This neighbourhood puts you steps from cafés, parks, and the rhythm you want.`,
    });
  } else if (sunday.includes("reading") || sunday.includes("fireplace")) {
    if (allText.includes("fireplace") || allText.includes("library") || allText.includes("study")) {
      insights.push({
        emoji: "📖",
        headline: "Your reading nook exists here",
        detail: "You want a quiet corner to disappear into. This home has exactly the kind of space where that happens.",
      });
    }
  }

  // Style preference
  const style = answers.modernVsCozy || "";
  if (style === "Classic elegance") {
    if (allText.includes("crown") || allText.includes("hardwood") || allText.includes("heritage") || allText.includes("original") || allText.includes("character")) {
      insights.push({
        emoji: "🏛️",
        headline: "The character you were looking for",
        detail: "You gravitate toward timeless architecture and craftsmanship. This home has the bones, crown moulding, original hardwood, details that aren't replicated anymore.",
      });
    }
  } else if (style === "Modern & minimal") {
    if (allText.includes("quartz") || allText.includes("smart") || allText.includes("modern") || allText.includes("renovated") || allText.includes("new")) {
      insights.push({
        emoji: "✨",
        headline: "Clean, elevated, exactly your style",
        detail: "You want modern finishes with nothing unnecessary. The renovation quality here matches that standard.",
      });
    }
  } else if (style === "Warm & cozy") {
    insights.push({
      emoji: "🕯️",
      headline: "The warmth you were describing",
      detail: "You want a home that feels settled and lived-in, not cold and on-trend. This home has that quality.",
    });
  }

  // Tradeoff: Outdoor space
  if (answers.tradeoffOutdoorVsInterior === "Outdoor space") {
    if (allText.includes("backyard") || allText.includes("garden") || allText.includes("patio") || allText.includes("deck")) {
      insights.push({
        emoji: "🌳",
        headline: "Outdoor space you prioritised",
        detail: "You chose outdoor space over interior finishes when it came to trade-offs. This property delivers on that, there's real room outside.",
      });
    }
  }

  // Tradeoff: Quiet vs energy
  if (answers.tradeoffQuietVsEnergy === "Quiet & calm") {
    if (allText.includes("quiet") || allText.includes("ravine") || allText.includes("dead end") || allText.includes("cul-de-sac")) {
      insights.push({
        emoji: "🌅",
        headline: "The quiet you asked for",
        detail: "You need calm, you made that clear. The street profile and lot position here deliver exactly that.",
      });
    }
  }

  // If no specific insights matched, return a generic personality summary
  if (insights.length === 0) {
    const feelings = answers.homeFeeling?.slice(0, 2) || [];
    if (feelings.length > 0) {
      insights.push({
        emoji: "🏡",
        headline: `A ${feelings[0].toLowerCase()}`,
        detail: `You said you want your home to feel like a ${feelings.join(" and ")}. The character of this property aligns with that.`,
      });
    }
  }

  return insights.slice(0, 3); // max 3
}

function scoreColor(s: number) {
  if (s >= 80) return "text-emerald-600";
  if (s >= 60) return "text-[#b8a88a]";
  if (s >= 40) return "text-amber-600";
  return "text-[#8c8580]";
}

function scoreBar(s: number) {
  if (s >= 80) return "bg-emerald-500";
  if (s >= 60) return "bg-[#b8a88a]";
  if (s >= 40) return "bg-amber-400";
  return "bg-[#e8e4de]";
}

export default function ListingDetail({ listing }: { listing: Listing }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [buyerAnswers, setBuyerAnswers] = useState<Partial<QuestionnaireAnswers> | null>(null);

  useEffect(() => {
    // setTimeout so setState fires in a callback (satisfies react-hooks/set-state-in-effect)
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("homematch_answers") ?? localStorage.getItem("homematch_answers");
        if (raw) setBuyerAnswers(JSON.parse(raw));
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const selectedLead = selectedLeadId ? mockLeads.find((l) => l.id === selectedLeadId) : undefined;
  const matchResult = selectedLead ? matchListingToLead(listing, selectedLead.answers) : null;

  const lifestyleLayer = calcLifestyleLayer(listing);
  const buyerMatch = buyerAnswers ? calcBuyerCompatibility(listing, buyerAnswers) : null;
  const affordability = buyerAnswers
    ? calcAffordabilitySnapshot(listing.price, buyerAnswers, listing.sqft)
    : calcAffordabilitySnapshot(listing.price, {}, listing.sqft);

  function prevImg() { setImgIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1)); }
  function nextImg() { setImgIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1)); }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Back nav */}
      <div className="bg-white border-b border-[#e8e4de] px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors">
            <ChevronLeft size={15} />
            Back to Listings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-[#e8e4de] aspect-video">
              <Image
                src={listing.images[imgIndex]}
                alt={`${listing.address} photo ${imgIndex + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              {listing.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {listing.images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imgIndex ? "bg-white" : "bg-white/50"}`} />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-white transition-all" style={{ width: `${((imgIndex + 1) / listing.images.length) * 100}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2">
                {listing.images.map((src, i) => (
                  <button key={i} onClick={() => setImgIndex(i)} className={`relative h-16 flex-1 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-[#2c2825]" : "border-transparent"}`}>
                    <Image src={src} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#2c2825] mb-3">About this property</h2>
              <p className="text-[#5c5550] leading-relaxed text-sm">{listing.description}</p>
            </div>

            {/* ── Lifestyle Layer™ ───────────────────────────────────────── */}
            <LifestyleLayerPanel layer={lifestyleLayer} />

            {/* ── Why This Matches Your Vibe ─────────────────────────────── */}
            {buyerAnswers && (() => {
              const vibeInsights = buildVibeInsights(buyerAnswers, listing);
              if (vibeInsights.length === 0) return null;
              return (
                <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#f0ece6] flex items-center gap-2">
                    <Sparkles size={15} className="text-[#b8a88a]" />
                    <p className="text-[#2c2825] font-semibold text-sm">Why this matches your vibe</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {vibeInsights.map((insight) => (
                      <div key={insight.headline} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#faf9f7] border border-[#e8e4de] flex items-center justify-center shrink-0 text-lg">
                          {insight.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#2c2825] text-sm font-medium mb-0.5">{insight.headline}</p>
                          <p className="text-[#8c8580] text-xs leading-relaxed">{insight.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Buyer Match Panel ──────────────────────────────────────── */}
            {buyerMatch ? (
              <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#2c2825] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-[#b8a88a]" />
                    <p className="text-white font-semibold text-sm">Your Compatibility Match</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${buyerMatch.overall >= 70 ? "text-emerald-400" : buyerMatch.overall >= 50 ? "text-[#b8a88a]" : "text-amber-400"}`}>
                      {buyerMatch.overall}%
                    </span>
                    <span className="text-[#e8e4de]/70 text-xs">{buyerMatch.label}</span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Summary */}
                  <p className="text-[#5c5550] text-sm leading-relaxed border-l-2 border-[#b8a88a] pl-4">
                    {buyerMatch.summary}
                  </p>

                  {/* Match score bar */}
                  <div>
                    <div className="h-2 bg-[#f0ece6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${scoreBar(buyerMatch.overall)}`}
                        style={{ width: `${buyerMatch.overall}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Must-haves */}
                    {(buyerMatch.mustHaveHits.length > 0 || buyerMatch.mustHaveMisses.length > 0) && (
                      <div>
                        <p className="text-xs font-semibold text-[#2c2825] uppercase tracking-wider mb-3">Must-Haves</p>
                        <ul className="space-y-1.5">
                          {buyerMatch.mustHaveHits.map((h) => (
                            <li key={h} className="flex items-center gap-2 text-xs text-[#2c2825]">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              {h}
                            </li>
                          ))}
                          {buyerMatch.mustHaveMisses.map((m) => (
                            <li key={m} className="flex items-center gap-2 text-xs text-[#8c8580]">
                              <X size={13} className="text-[#c4bfb9] shrink-0" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Deal breakers */}
                    {buyerMatch.dealBreakerFlags.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#2c2825] uppercase tracking-wider mb-3">Flagged Items</p>
                        <ul className="space-y-1.5">
                          {buyerMatch.dealBreakerFlags.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-xs text-amber-700">
                              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Lifestyle dimensions */}
                  {buyerMatch.lifestyle.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#2c2825] uppercase tracking-wider mb-4">Lifestyle Fit</p>
                      <div className="space-y-3">
                        {buyerMatch.lifestyle.map((dim) => (
                          <div key={dim.label}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dim.matched ? "bg-emerald-500" : "bg-[#c4bfb9]"}`} />
                                <span className="text-xs font-medium text-[#2c2825]">{dim.label}</span>
                              </div>
                              <span className={`text-xs font-semibold ${scoreColor(dim.score)}`}>
                                {dim.matched ? "Match" : "Gap"}
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden ml-3.5">
                              <div
                                className={`h-full rounded-full ${dim.matched ? "bg-emerald-400" : "bg-[#d4cfc9]"}`}
                                style={{ width: `${dim.score}%` }}
                              />
                            </div>
                            <p className="text-xs text-[#8c8580] ml-3.5 mt-0.5">{dim.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[#b8a88a] pt-2 border-t border-[#f0ece6]">
                    Based on your HomeMatch questionnaire profile.{" "}
                    <Link href="/questionnaire" className="underline underline-offset-2 hover:text-[#8c8580]">Update your profile</Link>
                  </p>
                </div>
              </div>
            ) : (
              /* No profile prompt */
              <div className="bg-[#faf9f7] border border-dashed border-[#d4cfc9] rounded-2xl p-6 flex items-center gap-5">
                <Sparkles size={22} className="text-[#b8a88a] shrink-0" />
                <div className="flex-1">
                  <p className="text-[#2c2825] font-medium text-sm mb-1">Get your personal compatibility score</p>
                  <p className="text-[#8c8580] text-xs leading-relaxed">Complete your buyer profile to see how well this home fits your lifestyle, budget, and priorities.</p>
                </div>
                <Link
                  href="/questionnaire"
                  className="shrink-0 bg-[#2c2825] text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-[#1a1714] transition-colors"
                >
                  Build Profile
                </Link>
              </div>
            )}

            {/* Key Features */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#2c2825] mb-4">Key Features</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#5c5550]">
                    <CheckCircle2 size={15} className="text-[#b8a88a] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Property Details */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#2c2825] mb-4">Property Details</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Home size={14} />, label: "Type", value: listing.propertyType },
                  { icon: <Bed size={14} />, label: "Bedrooms", value: listing.bedrooms },
                  { icon: <Bath size={14} />, label: "Bathrooms", value: listing.bathrooms },
                  { icon: <Maximize2 size={14} />, label: "Sqft", value: listing.sqft.toLocaleString() },
                  { icon: <MapPin size={14} />, label: "Lot Size", value: listing.lotSize },
                  { icon: <Calendar size={14} />, label: "Year Built", value: listing.yearBuilt },
                  { icon: <Car size={14} />, label: "Garage", value: listing.garage },
                  { icon: <Home size={14} />, label: "Basement", value: listing.basement },
                  { icon: <Thermometer size={14} />, label: "Heating", value: listing.heating },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-[#8c8580] flex items-center gap-1">{icon}{label}</dt>
                    <dd className="text-sm font-medium text-[#2c2825]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ── Right column ──────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Buyer match score pill (compact, sticky with price card) */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 sticky top-20 space-y-4">
              {/* Price */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[listing.status]}`}>
                    {listing.status}
                  </span>
                  <span className="text-xs text-[#8c8580] flex items-center gap-1">
                    <Calendar size={10} />
                    {listing.daysOnMarket}d on market
                  </span>
                </div>

                {listing.originalPrice ? (
                  <div className="mb-1">
                    <p className="text-3xl font-light text-[#2c2825]">{formatPrice(listing.price)}</p>
                    <p className="text-sm text-[#8c8580] line-through">{formatPrice(listing.originalPrice)}</p>
                    <p className="text-xs text-amber-600 font-medium">Reduced by {formatPrice(listing.originalPrice - listing.price)}</p>
                  </div>
                ) : (
                  <p className="text-3xl font-light text-[#2c2825] mb-1">{formatPrice(listing.price)}</p>
                )}

                <p className="text-sm font-medium text-[#2c2825]">{listing.address}</p>
                <p className="text-xs text-[#8c8580] flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  {listing.neighbourhood}, {listing.city} &middot; {listing.postalCode}
                </p>
              </div>

              {/* Buyer match score callout */}
              {buyerMatch && (
                <div className={`rounded-xl p-3 flex items-center justify-between ${
                  buyerMatch.overall >= 70 ? "bg-emerald-50 border border-emerald-200"
                  : buyerMatch.overall >= 50 ? "bg-[#faf9f7] border border-[#b8a88a]/30"
                  : "bg-amber-50 border border-amber-200"
                }`}>
                  <div>
                    <p className="text-xs text-[#8c8580]">Your Match</p>
                    <p className={`text-lg font-bold ${scoreColor(buyerMatch.overall)}`}>{buyerMatch.overall}%</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${scoreColor(buyerMatch.overall)}`}>{buyerMatch.label}</p>
                    <p className="text-xs text-[#8c8580]">{buyerMatch.mustHaveHits.length}/{(buyerAnswers?.mustHaves || []).length || "?"} must-haves</p>
                  </div>
                </div>
              )}

              {/* MLS + taxes */}
              <div className="space-y-2 text-xs text-[#8c8580] border-t border-[#f0ece6] pt-4">
                <div className="flex justify-between">
                  <span>MLS#</span>
                  <span className="font-medium text-[#2c2825] flex items-center gap-1"><Tag size={10} />{listing.mlsNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual taxes</span>
                  <span className="font-medium text-[#2c2825]">{formatPrice(listing.taxes)}</span>
                </div>
                {listing.maintenanceFee && (
                  <div className="flex justify-between">
                    <span>Maintenance fee</span>
                    <span className="font-medium text-[#2c2825]">{formatPrice(listing.maintenanceFee)}/mo</span>
                  </div>
                )}
              </div>

              {listing.virtualTourUrl && (
                <a href={listing.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full border border-[#2c2825] text-[#2c2825] text-sm py-2.5 rounded-full hover:bg-[#2c2825] hover:text-white transition-colors">
                  <ExternalLink size={14} />
                  Virtual Tour
                </a>
              )}
              <Link href="/dashboard" className="flex items-center justify-center w-full bg-[#2c2825] text-white text-sm py-2.5 rounded-full hover:bg-[#1a1714] transition-colors">
                View All Leads
              </Link>
            </div>

            {/* ── Affordability Snapshot ─────────────────────────────────── */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={15} className="text-[#b8a88a]" />
                <h3 className="text-sm font-semibold text-[#2c2825]">Affordability Snapshot</h3>
              </div>

              {buyerAnswers?.budgetMax && (
                <div className={`text-xs font-medium px-3 py-1.5 rounded-full mb-4 inline-flex items-center gap-1.5 ${
                  affordability.budgetComfort === "well within" || affordability.budgetComfort === "within"
                    ? "bg-emerald-50 text-emerald-700"
                    : affordability.budgetComfort === "at the top of"
                    ? "bg-[#faf9f7] text-[#b8a88a]"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                  {affordability.budgetComfort === "well within" ? "Well within your budget"
                   : affordability.budgetComfort === "within" ? "Within your budget range"
                   : affordability.budgetComfort === "at the top of" ? "Near top of your budget"
                   : affordability.budgetComfort === "slightly over" ? "Slightly over budget"
                   : "Over your stated budget"}
                </div>
              )}

              <p className="text-xs text-[#8c8580] mb-3 font-medium uppercase tracking-wider">Monthly costs</p>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Mortgage (20% down, 25yr)", value: formatCurrency(affordability.monthlyPayment) },
                  { label: "Property tax (est.)", value: formatCurrency(affordability.propertyTaxMonthly) },
                  { label: "Utilities (est.)", value: formatCurrency(affordability.utilityEstimate) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-[#8c8580]">{r.label}</span>
                    <span className="text-[#2c2825] font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#f0ece6]">
                  <span className="text-[#2c2825]">Total monthly est.</span>
                  <span className="text-[#2c2825]">{formatCurrency(affordability.totalMonthly)}</span>
                </div>
              </div>

              <p className="text-xs text-[#8c8580] mb-3 font-medium uppercase tracking-wider">Cash needed at close</p>
              <div className="space-y-2">
                {[
                  { label: "Down payment (20%)", value: formatCurrency(affordability.downPayment) },
                  { label: "Ontario land transfer tax", value: formatCurrency(affordability.ltt) },
                  { label: "Legal & closing costs", value: formatCurrency(affordability.closingCosts) },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-[#8c8580]">{r.label}</span>
                    <span className="text-[#2c2825] font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-[#f0ece6]">
                  <span className="text-[#2c2825]">Total cash required</span>
                  <span className="text-[#2c2825]">{formatCurrency(affordability.totalCashAtClose)}</span>
                </div>
              </div>

              <p className="text-xs text-[#b8a88a] mt-4 leading-relaxed">
                Estimates based on 20% down, 5.5% rate, 25-year amortization. Actual costs vary.
              </p>
            </div>

            {/* ── Match to Lead (realtor tool) ───────────────────────────── */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#2c2825] flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-[#b8a88a]" />
                Match to Lead
              </h3>
              <p className="text-xs text-[#8c8580] mb-3">Select a lead to see how this property fits their criteria.</p>

              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] mb-4"
              >
                <option value="">Select a lead…</option>
                {mockLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.answers.firstName} {lead.answers.lastName} ({lead.score})
                  </option>
                ))}
              </select>

              {matchResult && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#8c8580]">Match score</span>
                      <span className={`text-sm font-bold ${matchResult.score >= 70 ? "text-emerald-600" : matchResult.score >= 40 ? "text-amber-600" : "text-red-500"}`}>
                        {matchResult.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#f0ece6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${matchResult.score >= 70 ? "bg-emerald-500" : matchResult.score >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${matchResult.score}%` }}
                      />
                    </div>
                  </div>

                  {matchResult.reasons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#2c2825] mb-1.5">Why it fits</p>
                      <ul className="space-y-1">
                        {matchResult.reasons.map((r) => (
                          <li key={r} className="flex items-start gap-1.5 text-xs text-[#5c5550]">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchResult.warnings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#2c2825] mb-1.5">Watch out</p>
                      <ul className="space-y-1">
                        {matchResult.warnings.map((w) => (
                          <li key={w} className="flex items-start gap-1.5 text-xs text-[#5c5550]">
                            <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href={`/dashboard/${selectedLeadId}`} className="flex items-center justify-center gap-1 w-full border border-[#2c2825] text-[#2c2825] text-xs py-2 rounded-full hover:bg-[#2c2825] hover:text-white transition-colors mt-2">
                    View Lead Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
