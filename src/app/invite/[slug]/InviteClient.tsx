"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { slugToAttribution, setRealtorAttribution, attributionToBrandingPatch } from "@/lib/realtorAttribution";
import { useBranding } from "@/context/BrandingContext";

interface InviteClientProps {
  slug: string;
  source?: "invite_link" | "qr_code" | "bio_link" | "text" | "website";
}

export default function InviteClient({ slug, source = "invite_link" }: InviteClientProps) {
  const router = useRouter();
  const { update } = useBranding();
  const [ready, setReady] = useState(false);

  // Decode name from slug for display before attribution is stored
  const displayName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const firstName = displayName.split(" ")[0];

  // Store attribution silently on mount, buyer never sees this
  useEffect(() => {
    const timer = setTimeout(() => {
      const attribution = slugToAttribution(slug, source);
      setRealtorAttribution(attribution);
      update(attributionToBrandingPatch(attribution));
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [slug, source, update]);

  function handleStart() {
    router.push("/questionnaire");
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Ambient glow */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#e8e4de]/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#b8a88a]/10 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Realtor identity chip, subtle, non-CRM */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#e8e4de] rounded-full px-4 py-2 mb-10 shadow-sm animate-fade-up">
          <div className="w-6 h-6 rounded-full bg-[#2c2825] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
            {firstName.charAt(0)}
          </div>
          <span className="text-[#8c8580] text-sm">{displayName} · {slug.includes("-") ? "Real Estate Advisor" : "Home Match"}</span>
        </div>

        {/* Headline */}
        <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#b8a88a]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#2c2825] leading-tight tracking-tight max-w-xl mb-6">
            {firstName} has curated something
            <br />
            <span className="text-[#b8a88a]">just for you.</span>
          </h1>
          <p className="text-[#8c8580] text-lg leading-relaxed max-w-md mx-auto mb-12">
            A personalised home search experience built around your life, your lifestyle, and what actually matters to you.
          </p>
        </div>

        {/* Three promise cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-14 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          {[
            { emoji: "🏡", label: "Homes matched to your vibe", sub: "Not just your budget" },
            { emoji: "✨", label: "Personalised insights", sub: "Built around your lifestyle" },
            { emoji: "🔒", label: "Private & pressure-free", sub: "Connect when you're ready" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white border border-[#e8e4de] rounded-2xl px-5 py-5 shadow-sm text-left"
            >
              <div className="text-2xl mb-3">{card.emoji}</div>
              <p className="text-[#2c2825] text-sm font-medium leading-snug mb-1">{card.label}</p>
              <p className="text-[#8c8580] text-xs">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <button
            onClick={handleStart}
            disabled={!ready}
            className="inline-flex items-center gap-3 bg-[#2c2825] text-white text-sm font-medium px-10 py-4 rounded-full hover:bg-[#1a1714] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait"
          >
            {ready ? (
              <>
                Start my home profile
                <ArrowRight size={16} />
              </>
            ) : (
              "Getting things ready…"
            )}
          </button>
          <p className="text-[#8c8580] text-xs mt-4">Takes about 8 minutes · No sign-up required</p>
        </div>

        {/* Social proof strip */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-center gap-6 text-center animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          {[
            { value: "8 min", label: "to build your profile" },
            { value: "94%", label: "feel truly understood" },
            { value: "$0", label: "always free for buyers" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-2xl font-semibold text-[#2c2825]">{stat.value}</span>
              <span className="text-[#8c8580] text-xs mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <p className="text-center text-[#8c8580]/60 text-xs pb-8">
        Home Match · A personalised experience from {displayName}
      </p>
    </div>
  );
}
