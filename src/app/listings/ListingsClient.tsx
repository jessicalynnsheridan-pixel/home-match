"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listing, NiagaraCity, PropertyType, ListingStatus, QuestionnaireAnswers } from "@/types";
import { calcBuyerCompatibility } from "@/lib/buyerMatch";
import { Bed, Bath, Maximize2, Calendar, Tag, MapPin, Sparkles, SlidersHorizontal, Heart, MessageCircle } from "lucide-react";
import { useBranding } from "@/context/BrandingContext";

const ALL_CITIES: NiagaraCity[] = [
  "St. Catharines",
  "Niagara-on-the-Lake",
  "Niagara Falls",
  "Welland",
  "Fort Erie",
  "Grimsby",
  "Lincoln",
  "Pelham",
  "Thorold",
  "Port Colborne",
];

const PROPERTY_TYPES: PropertyType[] = [
  "Single Family",
  "Condo",
  "Townhouse",
  "Multi-Family",
  "Land",
  "Luxury Estate",
];

const STATUS_COLORS: Record<ListingStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  "Price Reduced": "bg-amber-100 text-amber-700",
  "Under Contract": "bg-blue-100 text-blue-700",
  Sold: "bg-[#e8e4de] text-[#8c8580]",
};

function formatPrice(p: number) {
  return p >= 1_000_000
    ? `$${(p / 1_000_000).toFixed(p % 1_000_000 === 0 ? 0 : 2)}M`
    : `$${(p / 1000).toFixed(0)}K`;
}

export default function ListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const { branding } = useBranding();
  const [city, setCity] = useState<NiagaraCity | "">("");
  const [propType, setPropType] = useState<PropertyType | "">("");
  const [minBeds, setMinBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "">("");
  const [buyerAnswers, setBuyerAnswers] = useState<Partial<QuestionnaireAnswers> | null>(null);
  const [sortByMatch, setSortByMatch] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // setTimeout so setState fires in a callback (satisfies react-hooks/set-state-in-effect)
    const timer = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem("homematch_answers");
        if (raw) setBuyerAnswers(JSON.parse(raw));
      } catch { /* ignore */ }
      try {
        const saved = localStorage.getItem("homematch_saved_homes");
        if (saved) setSavedIds(new Set(JSON.parse(saved)));
      } catch { /* ignore */ }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function toggleSave(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try { localStorage.setItem("homematch_saved_homes", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  const matchScores = useMemo(() => {
    if (!buyerAnswers) return new Map<string, number>();
    const map = new Map<string, number>();
    initialListings.forEach((l) => {
      map.set(l.id, calcBuyerCompatibility(l, buyerAnswers).overall);
    });
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

  function clearFilters() {
    setCity("");
    setPropType("");
    setMinBeds(0);
    setMaxPrice(0);
    setStatusFilter("");
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="bg-[#2c2825] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#b8a88a] text-sm tracking-widest uppercase mb-3">
            Niagara Region
          </p>
          <h1 className="text-4xl font-light mb-3">Active Listings</h1>
          <p className="text-[#a09890] text-lg">
            {initialListings.length} properties across the Niagara region
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Buyer profile banner */}
        {buyerAnswers ? (
          <div className="space-y-3 mb-6">
            {/* Realtor message */}
            <div className="bg-[#2c2825] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#b8a88a] flex items-center justify-center shrink-0 text-[#2c2825] font-bold text-sm">
                {branding.realtorName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{branding.realtorName}</p>
                <p className="text-[#e8e4de]/70 text-xs truncate">
                  Showing all {initialListings.length} listings matched to your profile.
                </p>
              </div>
              <button className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
                <MessageCircle size={11} />
                Message
              </button>
            </div>
            {/* Profile active + sort */}
            <div className="bg-white border border-[#b8a88a]/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f5f3f0] border border-[#e8e4de] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-[#b8a88a]" />
                </div>
                <div>
                  <p className="text-[#2c2825] text-sm font-medium">Your buyer profile is active</p>
                  <p className="text-[#8c8580] text-xs">Match scores are shown on every listing. Save homes with the {"♥"} button.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setSortByMatch((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    sortByMatch
                      ? "bg-[#2c2825] text-white border-[#2c2825]"
                      : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"
                  }`}
                >
                  <SlidersHorizontal size={11} />
                  Sort by match
                </button>
                <Link href="/questionnaire" className="text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors underline underline-offset-2">
                  Update profile
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#faf9f7] border border-dashed border-[#d4cfc9] rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#e8e4de] flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-[#b8a88a]" />
              </div>
              <p className="text-[#8c8580] text-sm">
                See how well each home fits you.{" "}
                <Link href="/questionnaire" className="text-[#2c2825] font-medium underline underline-offset-2 hover:text-[#b8a88a] transition-colors">
                  Build your buyer profile
                </Link>{" "}
                to unlock match scores.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 mb-8 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-40">
            <label className="text-xs text-[#8c8580] font-medium">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as NiagaraCity | "")}
              className="border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a]"
            >
              <option value="">All Cities</option>
              {ALL_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-40">
            <label className="text-xs text-[#8c8580] font-medium">Property Type</label>
            <select
              value={propType}
              onChange={(e) => setPropType(e.target.value as PropertyType | "")}
              className="border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a]"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-32">
            <label className="text-xs text-[#8c8580] font-medium">Min Beds</label>
            <select
              value={minBeds}
              onChange={(e) => setMinBeds(Number(e.target.value))}
              className="border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a]"
            >
              <option value={0}>Any</option>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-36">
            <label className="text-xs text-[#8c8580] font-medium">Max Price</label>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a]"
            >
              <option value={0}>Any Price</option>
              <option value={600000}>Under $600K</option>
              <option value={800000}>Under $800K</option>
              <option value={1000000}>Under $1M</option>
              <option value={1500000}>Under $1.5M</option>
              <option value={2000000}>Under $2M</option>
              <option value={3000000}>Under $3M</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-36">
            <label className="text-xs text-[#8c8580] font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ListingStatus | "")}
              className="border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a]"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Price Reduced">Price Reduced</option>
              <option value="Under Contract">Under Contract</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors underline underline-offset-2 self-end pb-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-[#8c8580] mb-6">
          {filtered.length} {filtered.length === 1 ? "listing" : "listings"} found
          {hasFilters ? " matching your filters" : ""}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#8c8580]">
            <p className="text-lg mb-2">No listings match your filters.</p>
            <button
              onClick={clearFilters}
              className="text-sm underline underline-offset-2 hover:text-[#2c2825] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => {
              const score = buyerAnswers ? (matchScores.get(listing.id) ?? 0) : null;
              const isSaved = savedIds.has(listing.id);
              const scoreColor = score !== null
                ? score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-[#b8a88a]" : "bg-[#8c8580]"
                : "";
              const scoreLabel = score !== null
                ? score >= 85 ? "Exceptional" : score >= 70 ? "Strong match" : score >= 50 ? "Good match" : "Partial match"
                : "";

              return (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group bg-white border border-[#e8e4de] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#b8a88a] transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-[#e8e4de] shrink-0">
                    <Image
                      src={listing.images[0]}
                      alt={listing.address}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    {/* Status badge */}
                    <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[listing.status]}`}>
                      {listing.status}
                    </span>
                    {/* Days on market */}
                    <span className="absolute top-3 right-12 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Calendar size={10} />
                      {listing.daysOnMarket}d
                    </span>
                    {/* Save heart */}
                    <button
                      onClick={(e) => toggleSave(e, listing.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all hover:scale-110 active:scale-95 ${
                        isSaved ? "bg-rose-500" : "bg-white/90 backdrop-blur"
                      }`}
                    >
                      <Heart size={14} className={isSaved ? "fill-white text-white" : "text-[#8c8580]"} />
                    </button>
                    {/* Match score — hero placement */}
                    {score !== null && (
                      <div className={`absolute bottom-3 left-3 ${scoreColor} text-white px-3 py-1.5 rounded-xl flex items-center gap-2`}>
                        <Sparkles size={11} />
                        <div>
                          <span className="font-bold text-sm">{score}%</span>
                          <span className="text-white/80 text-xs ml-1">{scoreLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      {listing.originalPrice ? (
                        <>
                          <span className="text-xl font-semibold text-[#2c2825]">{formatPrice(listing.price)}</span>
                          <span className="text-sm text-[#8c8580] line-through">{formatPrice(listing.originalPrice)}</span>
                          <span className="text-xs text-amber-600 font-medium">Price Drop</span>
                        </>
                      ) : (
                        <span className="text-xl font-semibold text-[#2c2825]">{formatPrice(listing.price)}</span>
                      )}
                    </div>
                    <p className="text-[#2c2825] font-medium text-sm">{listing.address}</p>
                    <p className="text-[#8c8580] text-xs flex items-center gap-1 mt-0.5 mb-3">
                      <MapPin size={10} />
                      {listing.neighbourhood || listing.city}, {listing.city}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#8c8580] border-t border-[#f0ece6] pt-3 mt-auto">
                      <span className="flex items-center gap-1"><Bed size={12} />{listing.bedrooms} bd</span>
                      <span className="flex items-center gap-1"><Bath size={12} />{listing.bathrooms} ba</span>
                      <span className="flex items-center gap-1"><Maximize2 size={12} />{listing.sqft.toLocaleString()} sqft</span>
                      <span className="flex items-center gap-1 ml-auto"><Tag size={12} />{listing.mlsNumber}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
