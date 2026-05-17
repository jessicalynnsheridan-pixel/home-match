"use client";

import { useState } from "react";
import { LifestyleLayer, AmenityCategory } from "@/lib/lifestyleLayer";
import {
  Coffee, Dumbbell, Leaf, Sparkles, Utensils,
  GraduationCap, ShoppingBag, MapPin, Activity, ShoppingBasket, Clock,
} from "lucide-react";

// ─── Amenity category config ──────────────────────────────────────────────────

const CATEGORY_META: Record<AmenityCategory, { label: string; icon: typeof Coffee; color: string; bg: string }> = {
  coffee:     { label: "Coffee",    icon: Coffee,         color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  fitness:    { label: "Fitness",   icon: Dumbbell,       color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  pilates:    { label: "Pilates",   icon: Activity,       color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  park:       { label: "Parks",     icon: Leaf,           color: "text-green-700",   bg: "bg-green-50 border-green-200" },
  wellness:   { label: "Wellness",  icon: Sparkles,       color: "text-rose-700",    bg: "bg-rose-50 border-rose-200" },
  restaurant: { label: "Dining",    icon: Utensils,       color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
  school:     { label: "Schools",   icon: GraduationCap,  color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  grocery:    { label: "Grocery",   icon: ShoppingBag,    color: "text-slate-700",   bg: "bg-slate-50 border-slate-200" },
  trail:      { label: "Trails",    icon: MapPin,         color: "text-teal-700",    bg: "bg-teal-50 border-teal-200" },
  market:     { label: "Markets",   icon: ShoppingBasket, color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-200" },
};

const CATEGORY_ORDER: AmenityCategory[] = [
  "coffee", "restaurant", "fitness", "pilates", "wellness",
  "park", "trail", "market", "grocery", "school",
];

function travelTime(item: { walkMinutes?: number; driveMinutes?: number }) {
  if (item.walkMinutes) return { label: `${item.walkMinutes} min walk`, icon: true };
  if (item.driveMinutes) return { label: `${item.driveMinutes} min drive`, icon: false };
  return { label: "Nearby", icon: false };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  layer: LifestyleLayer;
}

export default function LifestyleLayerPanel({ layer }: Props) {
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setClaimed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  // Group amenities by category, preserve CATEGORY_ORDER
  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof layer.amenities>>((acc, cat) => {
    const items = layer.amenities.filter((a) => a.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="rounded-3xl overflow-hidden border border-[#e8e4de]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#2c2825] px-6 pt-7 pb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#b8a88a] text-xs font-semibold tracking-widest uppercase">
                Lifestyle Layer™
              </span>
            </div>
            <h2 className="text-white text-xl font-light leading-snug">
              What life actually looks like here
            </h2>
          </div>
          <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-[#b8a88a]" />
          </div>
        </div>

        {/* Vibe tags */}
        <div className="flex flex-wrap gap-2">
          {layer.neighbourhoodVibe.map((v) => (
            <span
              key={v}
              className="text-xs text-[#e8e4de] bg-white/10 border border-white/20 px-3 py-1 rounded-full"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* ── Sunday Morning Energy ─────────────────────────────────────────── */}
      <div className="bg-[#1e1b18] px-6 py-7 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #b8a88a 0%, transparent 70%)" }}
        />
        <p className="text-[#b8a88a] text-xs font-semibold tracking-widest uppercase mb-4">
          Sunday Morning Energy
        </p>
        <p className="text-[#e8e4de] text-base leading-[1.8] italic font-light relative z-10">
          &ldquo;{layer.sundayMorningEnergy}&rdquo;
        </p>
      </div>

      <div className="bg-white">

        {/* ── Emotional prompts ────────────────────────────────────────────── */}
        <div className="px-6 py-8 border-b border-[#f0ece6]">
          <div className="space-y-5">
            {layer.emotionalPrompts.map((prompt, i) => (
              <div key={prompt} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#f5f3f0] border border-[#e8e4de] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#b8a88a] text-xs font-semibold">{i + 1}</span>
                </div>
                <p className="text-[#2c2825] text-base font-medium leading-snug">{prompt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nearby Life ──────────────────────────────────────────────────── */}
        <div className="px-6 py-7 border-b border-[#f0ece6]">
          <p className="text-[#2c2825] font-semibold mb-1">Nearby Life</p>
          <p className="text-[#8c8580] text-sm mb-6">
            What&apos;s around this home, and how close it actually is.
          </p>

          <div className="space-y-5">
            {(Object.entries(grouped) as [AmenityCategory, typeof layer.amenities][]).map(([cat, items]) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${meta.bg}`}>
                      <Icon size={11} className={meta.color} />
                    </div>
                    <p className="text-xs font-semibold text-[#2c2825] uppercase tracking-wider">{meta.label}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
                    {items.map((item) => {
                      const { label: timeLabel } = travelTime(item);
                      return (
                        <div
                          key={item.name}
                          className="flex items-start justify-between gap-2 bg-[#faf9f7] border border-[#f0ece6] rounded-xl px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-[#2c2825] font-medium truncate">{item.name}</p>
                            {item.note && (
                              <p className="text-xs text-[#b8a88a] mt-0.5 truncate">{item.note}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-xs text-[#8c8580] mt-0.5">
                            <Clock size={10} />
                            <span className="whitespace-nowrap">{timeLabel}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Lifestyle statement ──────────────────────────────────────────── */}
        <div className="px-6 py-6 bg-[#faf9f7] border-b border-[#f0ece6]">
          <p className="text-[#2c2825] text-lg font-light leading-snug italic text-center">
            {layer.lifestyleStatement}
          </p>
        </div>

        {/* ── Is This You? ─────────────────────────────────────────────────── */}
        <div className="px-6 py-7">
          <div className="mb-5">
            <p className="text-[#2c2825] font-semibold mb-1">Is this you?</p>
            <p className="text-[#8c8580] text-sm">
              Select the statements that feel true. The more you select, the more this home fits your life.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {layer.lifestyleIdentities.map((identity) => {
              const isSelected = claimed.has(identity);
              return (
                <button
                  key={identity}
                  onClick={() => toggle(identity)}
                  className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                    isSelected
                      ? "bg-[#2c2825] text-white border-[#2c2825]"
                      : "bg-white text-[#5c5550] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"
                  }`}
                >
                  {isSelected ? "✓ " : ""}{identity}
                </button>
              );
            })}
          </div>

          {/* Response based on selection count */}
          {claimed.size === 0 && (
            <p className="text-[#b8a88a] text-sm text-center italic">
              Tap the statements that feel true to you.
            </p>
          )}
          {claimed.size >= 1 && claimed.size <= 2 && (
            <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-2xl px-5 py-4 text-center">
              <p className="text-[#2c2825] text-sm font-medium mb-0.5">Some overlap</p>
              <p className="text-[#8c8580] text-sm">This lifestyle has elements that resonate with you. Worth exploring in person.</p>
            </div>
          )}
          {claimed.size >= 3 && claimed.size <= 4 && (
            <div className="bg-[#f0f9f4] border border-emerald-200 rounded-2xl px-5 py-4 text-center">
              <p className="text-emerald-700 text-sm font-medium mb-0.5">Strong lifestyle match</p>
              <p className="text-[#5c5550] text-sm">This neighbourhood reflects how you actually want to live. That matters more than square footage.</p>
            </div>
          )}
          {claimed.size >= 5 && (
            <div className="bg-[#2c2825] rounded-2xl px-5 py-5 text-center">
              <p className="text-[#b8a88a] text-xs font-semibold tracking-widest uppercase mb-2">You belong here</p>
              <p className="text-white text-sm leading-relaxed">
                This isn&apos;t just a home that fits your criteria &mdash; it&apos;s a neighbourhood that fits your life. Buyers who feel this aligned rarely let these go.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
