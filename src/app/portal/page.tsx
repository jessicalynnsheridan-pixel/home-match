"use client";

import { useState, useEffect } from "react";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { PropertyRecommendation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Heart, BedDouble, Bath, Ruler, Calendar, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// The portal uses lead-001 as the demo buyer session.
// In production, authenticated via Supabase Auth or a magic link.
const DEMO_LEAD = mockLeads.find((l) => l.id === "lead-001")!;

export default function BuyerPortalPage() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(DEMO_LEAD.savedHomeIds));
  const recommendations = mockProperties.filter((p) => p.leadId === "lead-001");
  // Show all properties as browseable, not just matched ones
  const allProperties = mockProperties;

  function toggle(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const savedProperties = allProperties.filter((p) => savedIds.has(p.id));

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        {/* Welcome header */}
        <div className="bg-[#2c2825] rounded-3xl p-8 mb-10 text-white">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-3">
            Buyer Portal
          </p>
          <h1 className="text-2xl font-semibold mb-1">
            Welcome back, {DEMO_LEAD.answers.firstName}.
          </h1>
          <p className="text-[#e8e4de]/70 text-sm mb-6">
            Your home search is active. Your realtor is reviewing your profile and curating personalized recommendations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Stat label="Match Score" value={`${DEMO_LEAD.matchScore}/100`} />
            <Stat label="Budget" value={`${formatCurrency(DEMO_LEAD.answers.budgetMin)} – ${formatCurrency(DEMO_LEAD.answers.budgetMax)}`} />
            <Stat label="Timeline" value={DEMO_LEAD.answers.timeline || "—"} />
            <Stat label="Saved Homes" value={String(savedIds.size)} />
          </div>
        </div>

        {/* Mortgage checklist */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 mb-8">
          <h2 className="text-[#2c2825] font-semibold mb-1">Mortgage Readiness Checklist</h2>
          <p className="text-[#8c8580] text-sm mb-5">
            Complete these items to speed up your purchase process.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_LEAD.answers.mortgageChecklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  item.completed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-[#faf9f7] border-[#e8e4de]"
                }`}
              >
                <CheckCircle
                  size={16}
                  className={item.completed ? "text-emerald-500" : "text-[#e8e4de]"}
                />
                <p className={`text-sm ${item.completed ? "text-emerald-800 line-through" : "text-[#2c2825]"}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#e8e4de]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#8c8580]">Checklist progress</span>
              <span className="text-[#2c2825] font-medium">
                {DEMO_LEAD.answers.mortgageChecklist.filter((i) => i.completed).length} of {DEMO_LEAD.answers.mortgageChecklist.length} complete
              </span>
            </div>
            <div className="h-2 bg-[#e8e4de] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${(DEMO_LEAD.answers.mortgageChecklist.filter((i) => i.completed).length / DEMO_LEAD.answers.mortgageChecklist.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Recommended homes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-[#2c2825] font-semibold">Your Matched Homes</h2>
              <p className="text-[#8c8580] text-sm">Hand-selected by your realtor based on your profile.</p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-10 text-center">
              <p className="text-[#2c2825] font-medium mb-2">Recommendations coming soon</p>
              <p className="text-[#8c8580] text-sm">Your realtor is curating your personalized home list.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recommendations.map((p) => (
                <PortalPropertyCard
                  key={p.id}
                  property={p}
                  saved={savedIds.has(p.id)}
                  onToggle={() => toggle(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Saved homes */}
        {savedIds.size > 0 && (
          <div>
            <h2 className="text-[#2c2825] font-semibold mb-1">Saved Homes</h2>
            <p className="text-[#8c8580] text-sm mb-5">
              Homes you&apos;ve favourited. Share this list with your realtor.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {savedProperties.map((p) => (
                <PortalPropertyCard
                  key={p.id}
                  property={p}
                  saved={savedIds.has(p.id)}
                  onToggle={() => toggle(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 border-t border-[#e8e4de] pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-[#8c8580] text-sm">
            Questions? Your realtor is always a message away.
          </p>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-[#e8e4de] text-[#2c2825] text-sm px-5 py-2.5 rounded-full hover:border-[#2c2825] transition-colors bg-white">
              <Calendar size={14} /> Book a Call
            </button>
            <Link
              href="/questionnaire"
              className="bg-[#2c2825] text-white text-sm px-5 py-2.5 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Update My Profile
            </Link>
          </div>
        </div>
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
  property: p, saved, onToggle,
}: {
  property: PropertyRecommendation; saved: boolean; onToggle: () => void;
}) {
  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-44">
        <Image src={p.imageUrl} alt={p.address} fill className="object-cover" unoptimized />
        <button
          onClick={onToggle}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow transition-all hover:scale-110"
        >
          <Heart
            size={15}
            className={saved ? "fill-rose-500 text-rose-500" : "text-[#8c8580]"}
          />
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
          Request a Showing
        </button>
      </div>
    </div>
  );
}
