"use client";

import { useState } from "react";
import Link from "next/link";
import { Listing } from "@/types";
import { mockLeads } from "@/data/mockLeads";
import { matchListingToLead } from "@/data/niagaraListings";
import {
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Tag,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Home,
  Thermometer,
  Car,
} from "lucide-react";

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(p);
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Price Reduced": "bg-amber-100 text-amber-700 border-amber-200",
  "Under Contract": "bg-blue-100 text-blue-700 border-blue-200",
  Sold: "bg-[#e8e4de] text-[#8c8580] border-[#e8e4de]",
};

export default function ListingDetail({ listing }: { listing: Listing }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState("");

  const selectedLead = selectedLeadId ? mockLeads.find((l) => l.id === selectedLeadId) : undefined;
  const matchResult = selectedLead ? matchListingToLead(listing, selectedLead.answers) : null;

  function prevImg() {
    setImgIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  }

  function nextImg() {
    setImgIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Back nav */}
      <div className="bg-white border-b border-[#e8e4de] px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors"
          >
            <ChevronLeft size={15} />
            Back to Listings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: images + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-[#e8e4de] aspect-video">
              <img
                src={listing.images[imgIndex]}
                alt={`${listing.address} photo ${imgIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {listing.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === imgIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Thumbnail strip */}
              {listing.images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${((imgIndex + 1) / listing.images.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2">
                {listing.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-16 flex-1 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === imgIndex ? "border-[#2c2825]" : "border-transparent"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#2c2825] mb-3">About this property</h2>
              <p className="text-[#5c5550] leading-relaxed text-sm">{listing.description}</p>
            </div>

            {/* Features */}
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

            {/* Property details grid */}
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
                    <dt className="text-xs text-[#8c8580] flex items-center gap-1">
                      {icon}
                      {label}
                    </dt>
                    <dd className="text-sm font-medium text-[#2c2825]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right column: price card + match tool */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 sticky top-20">
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    STATUS_COLORS[listing.status]
                  }`}
                >
                  {listing.status}
                </span>
                <span className="text-xs text-[#8c8580] flex items-center gap-1">
                  <Calendar size={10} />
                  {listing.daysOnMarket} days on market
                </span>
              </div>

              {listing.originalPrice ? (
                <div className="mb-1">
                  <p className="text-3xl font-light text-[#2c2825]">
                    {formatPrice(listing.price)}
                  </p>
                  <p className="text-sm text-[#8c8580] line-through">
                    {formatPrice(listing.originalPrice)}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">
                    Reduced by {formatPrice(listing.originalPrice - listing.price)}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-light text-[#2c2825] mb-1">
                  {formatPrice(listing.price)}
                </p>
              )}

              <p className="text-sm font-medium text-[#2c2825]">{listing.address}</p>
              <p className="text-xs text-[#8c8580] flex items-center gap-1 mt-0.5 mb-4">
                <MapPin size={10} />
                {listing.neighbourhood}, {listing.city} &middot; {listing.postalCode}
              </p>

              <div className="space-y-2 text-xs text-[#8c8580] border-t border-[#f0ece6] pt-4 mb-4">
                <div className="flex justify-between">
                  <span>MLS#</span>
                  <span className="font-medium text-[#2c2825] flex items-center gap-1">
                    <Tag size={10} />
                    {listing.mlsNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Annual taxes</span>
                  <span className="font-medium text-[#2c2825]">
                    {formatPrice(listing.taxes)}
                  </span>
                </div>
                {listing.maintenanceFee && (
                  <div className="flex justify-between">
                    <span>Maintenance fee</span>
                    <span className="font-medium text-[#2c2825]">
                      {formatPrice(listing.maintenanceFee)}/mo
                    </span>
                  </div>
                )}
              </div>

              {listing.virtualTourUrl && (
                <a
                  href={listing.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-[#2c2825] text-[#2c2825] text-sm py-2.5 rounded-full hover:bg-[#2c2825] hover:text-white transition-colors mb-3"
                >
                  <ExternalLink size={14} />
                  Virtual Tour
                </a>
              )}

              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full bg-[#2c2825] text-white text-sm py-2.5 rounded-full hover:bg-[#1a1714] transition-colors"
              >
                View All Leads
              </Link>
            </div>

            {/* Match to Lead */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#2c2825] flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-[#b8a88a]" />
                Match to Lead
              </h3>
              <p className="text-xs text-[#8c8580] mb-3">
                Select a lead to see how well this property fits their criteria.
              </p>

              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full border border-[#e8e4de] rounded-lg px-3 py-2 text-sm text-[#2c2825] bg-white focus:outline-none focus:border-[#b8a88a] mb-4"
              >
                <option value="">Select a lead…</option>
                {mockLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.answers.firstName} {lead.answers.lastName} — {lead.score}
                  </option>
                ))}
              </select>

              {matchResult && (
                <div className="space-y-3">
                  {/* Score bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-[#8c8580]">Match score</span>
                      <span
                        className={`text-sm font-bold ${
                          matchResult.score >= 70
                            ? "text-emerald-600"
                            : matchResult.score >= 40
                            ? "text-amber-600"
                            : "text-red-500"
                        }`}
                      >
                        {matchResult.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#f0ece6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          matchResult.score >= 70
                            ? "bg-emerald-500"
                            : matchResult.score >= 40
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${matchResult.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Reasons */}
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

                  {/* Warnings */}
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

                  <Link
                    href={`/dashboard/${selectedLeadId}`}
                    className="flex items-center justify-center gap-1 w-full border border-[#2c2825] text-[#2c2825] text-xs py-2 rounded-full hover:bg-[#2c2825] hover:text-white transition-colors mt-2"
                  >
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
