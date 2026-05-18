"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing, NiagaraCity, PropertyType, ListingStatus, QuestionnaireAnswers } from "@/types";
import { calcBuyerCompatibility } from "@/lib/buyerMatch";
import { Bed, Bath, Maximize2, Calendar, MapPin, Sparkles, SlidersHorizontal, Heart, ArrowRight } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";
import { useToast } from "@/context/ToastContext";
import TiltCard from "@/components/ui/TiltCard";

const ALL_CITIES: NiagaraCity[] = [
  "St. Catharines", "Niagara-on-the-Lake", "Niagara Falls", "Welland",
  "Fort Erie", "Grimsby", "Lincoln", "Pelham", "Thorold", "Port Colborne",
];

const PROPERTY_TYPES: PropertyType[] = [
  "Single Family", "Condo", "Townhouse", "Multi-Family", "Land", "Luxury Estate",
];

const STATUS_COLORS: Record<ListingStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Price Reduced": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Contract": "bg-blue-100 text-blue-700 border-blue-200",
  Sold: "bg-[#e8e4de] text-[#8c8580] border-transparent",
};

function formatPrice(p: number) {
  return p >= 1_000_000
    ? `$${(p / 1_000_000).toFixed(p % 1_000_000 === 0 ? 0 : 2)}M`
    : `$${(p / 1000).toFixed(0)}K`;
}

function scoreConfig(score: number) {
  if (score >= 85) return { bg: "bg-emerald-500", text: "text-emerald-600", label: "Exceptional match", dot: "bg-emerald-500" };
  if (score >= 70) return { bg: "bg-[#b8a88a]",  text: "text-[#b8a88a]",  label: "Strong match",      dot: "bg-[#b8a88a]"  };
  if (score >= 50) return { bg: "bg-amber-500",   text: "text-amber-600",  label: "Good match",        dot: "bg-amber-500"  };
  return              { bg: "bg-[#8c8580]",   text: "text-[#8c8580]",  label: "Partial match",     dot: "bg-[#8c8580]"  };
}

export default function ListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const { branding } = useBranding();
  const { toast } = useToast();

  const [city, setCity] = useState<NiagaraCity | "">("");
  const [propType, setPropType] = useState<PropertyType | "">("");
  const [minBeds, setMinBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "">("");
  const [buyerAnswers, setBuyerAnswers] = useState<Partial<QuestionnaireAnswers> | null>(null);
  const [sortByMatch, setSortByMatch] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("homematch_answers");
        if (raw) {
          setBuyerAnswers(JSON.parse(raw));
          setSortByMatch(true); // auto-sort by match when profile exists
        }
      } catch { /* ignore */ }
      try {
        const saved = localStorage.getItem("homematch_saved_homes");
        if (saved) setSavedIds(new Set(JSON.parse(saved)));
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleSave = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      const adding = !next.has(id);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try { localStorage.setItem("homematch_saved_homes", JSON.stringify([...next])); } catch { /* ignore */ }
      if (adding) {
        toast("Saved to your Dream Collection.", { sub: "Find it again in your Home Hub.", variant: "save" });
      }
      return next;
    });
  }, [toast]);

  const matchScores = useMemo(() => {
    if (!buyerAnswers) return new Map<string, number>();
    const map = new Map<string, number>();
    initialListings.forEach((l) => map.set(l.id, calcBuyerCompatibility(l, buyerAnswers).overall));
    return map;
  }, [buyerAnswers, initialListings]);

  const filtered = useMemo(() => {
    const results = initialListings.filter((l) => {
      if (city && l.city !== city) return false;
      if (propType && l.propertyType !== propType) return false;
      if (minBeds && l.bedrooms < minBeds) return false;
      if (maxPrice && l.price > maxPrice) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      return true;
    });
    if (sortByMatch && buyerAnswers) {
      results.sort((a, b) => (matchScores.get(b.id) ?? 0) - (matchScores.get(a.id) ?? 0));
    }
    return results;
  }, [city, propType, minBeds, maxPrice, statusFilter, sortByMatch, buyerAnswers, matchScores, initialListings]);

  const hasFilters = city || propType || minBeds || maxPrice || statusFilter;
  const firstName = (buyerAnswers as QuestionnaireAnswers | null)?.firstName || "";
  const realtorFirst = branding.realtorName.split(" ")[0];

  function clearFilters() {
    setCity(""); setPropType(""); setMinBeds(0); setMaxPrice(0); setStatusFilter("");
  }

  // Top picks for profile banner
  const topPicks = buyerAnswers
    ? filtered.filter((l) => (matchScores.get(l.id) ?? 0) >= 80).length
    : 0;

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* ─── Hero header ──────────────────────────────────────────────────────── */}
      <div className="bg-[#2c2825] text-white px-6 pt-14 pb-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase mb-3 animate-fade-up">
            Niagara Region · {initialListings.length} homes
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold mb-3 animate-fade-up stagger-1">
            {buyerAnswers
              ? `Homes curated${firstName ? ` for you, ${firstName}` : " for your lifestyle"}.`
              : "Discover homes worth dreaming about."}
          </h1>
          <p className="text-[#a09890] text-base max-w-xl animate-fade-up stagger-2">
            {buyerAnswers
              ? topPicks > 0
                ? `${topPicks} homes match your profile at 80%+. Sorted by compatibility.`
                : "Each listing is scored against your buyer profile."
              : "Build your profile to unlock personalised match scores on every home."}
          </p>

          {/* Profile prompt if no profile */}
          {!buyerAnswers && (
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 mt-6 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-6 py-3 rounded-full hover:bg-[#c9b99b] transition-all btn-press animate-fade-up stagger-3"
            >
              <Sparkles size={14} />
              Unlock my match scores
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

        {/* ─── Profile active banner ─────────────────────────────────────────── */}
        {buyerAnswers && (
          <div className="bg-white border border-[#b8a88a]/30 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 glow-gold animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fdf8f2] border border-[#e8d8c0] flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-[#b8a88a]" />
              </div>
              <div>
                <p className="text-[#2c2825] text-sm font-medium">Your taste profile is active</p>
                <p className="text-[#8c8580] text-xs">
                  {realtorFirst} has scored every listing for your lifestyle.
                  {savedIds.size > 0 ? ` You've saved ${savedIds.size} home${savedIds.size > 1 ? "s" : ""}.` : " Save homes with ♥."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSortByMatch((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all btn-press ${
                  sortByMatch
                    ? "bg-[#2c2825] text-white border-[#2c2825]"
                    : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"
                }`}
              >
                <SlidersHorizontal size={11} />
                {sortByMatch ? "By match ✓" : "Sort by match"}
              </button>
            </div>
          </div>
        )}

        {/* ─── Filter toggle ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="text-sm text-[#8c8580]">
            <span className="font-medium text-[#2c2825]">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "home" : "homes"}
            {hasFilters ? " match your filters" : " available"}
          </p>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all btn-press ${
              showFilters || hasFilters
                ? "bg-[#2c2825] text-white border-[#2c2825]"
                : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
            }`}
          >
            <SlidersHorizontal size={13} />
            {hasFilters ? "Filters active" : "Refine"}
            {hasFilters && (
              <span className="w-4 h-4 rounded-full bg-[#b8a88a] flex items-center justify-center text-[10px] text-white font-bold">
                {[city, propType, minBeds > 0, maxPrice > 0, statusFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* ─── Filter panel ─────────────────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-6 animate-scale-in">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 min-w-40">
                <label className="text-xs text-[#8c8580] font-medium uppercase tracking-wider">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value as NiagaraCity | "")}
                  className="border border-[#e8e4de] rounded-xl px-3 py-2.5 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] transition-colors">
                  <option value="">All Cities</option>
                  {ALL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-40">
                <label className="text-xs text-[#8c8580] font-medium uppercase tracking-wider">Style</label>
                <select value={propType} onChange={(e) => setPropType(e.target.value as PropertyType | "")}
                  className="border border-[#e8e4de] rounded-xl px-3 py-2.5 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] transition-colors">
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-32">
                <label className="text-xs text-[#8c8580] font-medium uppercase tracking-wider">Min Beds</label>
                <select value={minBeds} onChange={(e) => setMinBeds(Number(e.target.value))}
                  className="border border-[#e8e4de] rounded-xl px-3 py-2.5 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] transition-colors">
                  <option value={0}>Any</option>
                  {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-36">
                <label className="text-xs text-[#8c8580] font-medium uppercase tracking-wider">Budget</label>
                <select value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="border border-[#e8e4de] rounded-xl px-3 py-2.5 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] transition-colors">
                  <option value={0}>Any</option>
                  <option value={600000}>Under $600K</option>
                  <option value={800000}>Under $800K</option>
                  <option value={1000000}>Under $1M</option>
                  <option value={1500000}>Under $1.5M</option>
                  <option value={2000000}>Under $2M</option>
                  <option value={3000000}>Under $3M</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-36">
                <label className="text-xs text-[#8c8580] font-medium uppercase tracking-wider">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ListingStatus | "")}
                  className="border border-[#e8e4de] rounded-xl px-3 py-2.5 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] transition-colors">
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Price Reduced">Price Reduced</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              {hasFilters && (
                <button onClick={clearFilters}
                  className="text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors underline underline-offset-2 self-end pb-0.5">
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── Listings grid ────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-up">
            <p className="text-2xl mb-3">🏡</p>
            <p className="text-[#2c2825] font-medium mb-2">No homes match those filters.</p>
            <p className="text-[#8c8580] text-sm mb-5">Try broadening your search, the right one is in here.</p>
            <button onClick={clearFilters}
              className="text-sm underline underline-offset-2 hover:text-[#2c2825] text-[#8c8580] transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((listing, i) => {
              const score = buyerAnswers ? (matchScores.get(listing.id) ?? 0) : null;
              const isSaved = savedIds.has(listing.id);
              const cfg = score !== null ? scoreConfig(score) : null;
              const isNew = listing.daysOnMarket <= 7;
              const isTopMatch = score !== null && score >= 85;

              return (
                <TiltCard
                  key={listing.id}
                  className={`
                    rounded-2xl overflow-hidden flex flex-col animate-fade-up
                    ${isTopMatch ? "shadow-gold-lg" : "shadow-warm-sm"}
                  `}
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` } as React.CSSProperties}
                >
                  <Link
                    href={`/listings/${listing.id}`}
                    className={`
                      group bg-white rounded-2xl overflow-hidden flex flex-col flex-1
                      ${isTopMatch
                        ? "border border-[#b8a88a]/40"
                        : "border border-[#e8e4de]"}
                    `}
                  >
                    {/* ── Cinematic image block ── */}
                    <div className="relative h-60 overflow-hidden bg-[#e8e4de] shrink-0">
                      <Image
                        src={listing.images[0]}
                        alt={listing.address}
                        fill
                        className="object-cover img-zoom"
                        unoptimized
                      />

                      {/* Rich cinematic gradient overlay, price lives here */}
                      <div className="card-image-overlay-rich absolute inset-0" />

                      {/* Top badges row */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-[10px] font-semibold border px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90 self-start ${STATUS_COLORS[listing.status]}`}>
                            {listing.status}
                          </span>
                          {isNew && (
                            <span className="flex items-center gap-1 bg-[#2c2825]/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full self-start animate-pulse-soft">
                              <span className="w-1 h-1 rounded-full bg-[#b8a88a] animate-dot-blink" />
                              New
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            <Calendar size={9} />
                            {listing.daysOnMarket}d
                          </span>
                          <button
                            onClick={(e) => toggleSave(e, listing.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-90 ${
                              isSaved ? "bg-rose-500" : "bg-white/90 backdrop-blur-sm"
                            }`}
                          >
                            <Heart size={14} className={isSaved ? "fill-white text-white" : "text-[#8c8580]"} />
                          </button>
                        </div>
                      </div>

                      {/* Price over image, bottom left */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-white font-bold text-xl leading-none drop-shadow-sm">
                                {formatPrice(listing.price)}
                              </span>
                              {listing.originalPrice && (
                                <span className="text-white/60 text-xs line-through">
                                  {formatPrice(listing.originalPrice)}
                                </span>
                              )}
                            </div>
                            {listing.originalPrice && (
                              <span className="text-[10px] text-amber-300 font-semibold">↓ Price drop</span>
                            )}
                          </div>

                          {/* Match score badge over image */}
                          {cfg && score !== null && (
                            <div className={`${cfg.bg} text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0`}>
                              <Sparkles size={10} />
                              <span className="font-bold text-sm">{score}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Card body ── */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[#2c2825] font-medium text-sm leading-snug mb-0.5">{listing.address}</p>
                      <p className="text-[#8c8580] text-xs flex items-center gap-1 mb-auto">
                        <MapPin size={10} />
                        {listing.neighbourhood ? `${listing.neighbourhood} · ` : ""}{listing.city}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 text-xs text-[#8c8580] border-t border-[#f0ece6] pt-3 mt-3">
                        <span className="flex items-center gap-1"><Bed size={11} />{listing.bedrooms} bd</span>
                        <span className="flex items-center gap-1"><Bath size={11} />{listing.bathrooms} ba</span>
                        <span className="flex items-center gap-1"><Maximize2 size={11} />{listing.sqft.toLocaleString()} sqft</span>
                        {cfg && (
                          <span className={`ml-auto text-[10px] font-medium ${cfg.text}`}>{cfg.label}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              );
            })}
          </div>
        )}

        {/* ─── No profile CTA ───────────────────────────────────────────────── */}
        {!buyerAnswers && filtered.length > 0 && (
          <div className="mt-12 bg-[#2c2825] rounded-3xl p-8 text-center animate-fade-up">
            <p className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase mb-3">Unlock your experience</p>
            <h2 className="text-white font-semibold text-xl mb-3">
              See which of these {filtered.length} homes actually fit your life.
            </h2>
            <p className="text-[#e8e4de]/60 text-sm leading-relaxed max-w-md mx-auto mb-6">
              Build your taste profile in 8 minutes. Every listing gets scored against your lifestyle, budget, and priorities, not just your keyword search.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#c9b99b] transition-all btn-press"
            >
              <Sparkles size={14} />
              Build my profile · Free
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
