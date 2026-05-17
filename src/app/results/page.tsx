"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuestionnaireAnswers } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Sparkles, Heart, MapPin, Home } from "lucide-react";
import { calcBuyerReadiness } from "@/lib/buyerMatch";

// ─── Animated Score Ring ───────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (displayed / 100) * circumference;

  useEffect(() => {
    let frame: number;
    let current = 0;
    const target = score;
    const step = () => {
      current += 1.8;
      if (current >= target) {
        setDisplayed(target);
        return;
      }
      setDisplayed(Math.round(current));
      frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(step); }, 600);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [score]);

  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#b8a88a" : score >= 40 ? "#f59e0b" : "#94a3b8";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e8e4de" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.05s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#2c2825]">{displayed}</span>
          <span className="text-xs text-[#8c8580]">/ 100</span>
        </div>
      </div>
      <p
        className="mt-2 text-sm font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Personality card ──────────────────────────────────────────────────────

function buildPersonalityLine(answers: QuestionnaireAnswers): string {
  const feelings = answers.homeFeeling?.slice(0, 2).join(" + ") || "";
  const style = answers.modernVsCozy || "";
  const sunday = answers.sundayMorning || "";

  if (feelings && style) return `${feelings} · ${style}`;
  if (feelings) return feelings;
  if (sunday) return `Dream: ${sunday}`;
  return "Your unique home personality";
}

// ─── Confetti burst (CSS-only) ─────────────────────────────────────────────

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full opacity-0 animate-confetti"
          style={{
            left: `${10 + i * 7}%`,
            top: "30%",
            backgroundColor: ["#b8a88a", "#2c2825", "#e8e4de", "#d4a76a", "#6b7280"][i % 5],
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    // Use setTimeout so setState fires in a callback (satisfies react-hooks/set-state-in-effect)
    const hydrate = setTimeout(() => {
      const raw = sessionStorage.getItem("homematch_answers");
      if (raw) {
        try { setAnswers(JSON.parse(raw)); } catch { /* ignore */ }
      }
    }, 0);
    const celebrate = setTimeout(() => setCelebrated(true), 300);
    return () => { clearTimeout(hydrate); clearTimeout(celebrate); };
  }, []);

  const readiness = answers ? calcBuyerReadiness(answers) : null;
  const name = answers?.firstName || "You";

  const vibeItems = [
    answers?.homeFeeling?.slice(0, 2),
    answers?.sundayMorning ? [answers.sundayMorning] : [],
    answers?.modernVsCozy ? [answers.modernVsCozy] : [],
  ].flat().filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 lg:px-8 py-16">
      <div className="max-w-2xl mx-auto">

        {/* ── Celebration header ─────────────────────────────────────────── */}
        <div
          className={`relative bg-[#2c2825] rounded-3xl p-8 sm:p-10 text-center mb-6 overflow-hidden transition-all duration-700 ${
            celebrated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <ConfettiBurst />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-[#b8a88a] text-xs font-medium tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              <Sparkles size={12} />
              Profile Complete
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3 leading-tight">
              {name}, your home profile<br />is ready. 🏡
            </h1>
            <p className="text-[#e8e4de]/70 text-base leading-relaxed max-w-md mx-auto">
              We&apos;ve built your personal home fingerprint. Every listing you see from here is matched to you specifically.
            </p>

            {/* Score reveal */}
            {readiness && (
              <div className="mt-8 flex flex-col items-center">
                <p className="text-[#e8e4de]/60 text-xs uppercase tracking-widest mb-4">
                  Your Buyer Readiness Score
                </p>
                <ScoreRing score={readiness.overall} label={readiness.label} />
                {readiness.tip && (
                  <p className="mt-4 text-[#e8e4de]/60 text-xs max-w-xs leading-relaxed">
                    {readiness.tip}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Personality card ──────────────────────────────────────────── */}
        {answers && vibeItems.length > 0 && (
          <div
            className={`bg-white border border-[#e8e4de] rounded-2xl p-6 mb-5 transition-all duration-700 delay-300 ${
              celebrated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#f5f3f0] flex items-center justify-center">
                <Heart size={14} className="text-[#b8a88a]" />
              </div>
              <div>
                <p className="text-[#2c2825] font-semibold text-sm">Your Home Personality</p>
                <p className="text-[#8c8580] text-xs">{buildPersonalityLine(answers)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {vibeItems.map((item) => (
                <span
                  key={item}
                  className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full"
                >
                  {item}
                </span>
              ))}
              {answers.hostingVsPrivacy && (
                <span className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full">
                  {answers.hostingVsPrivacy}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Profile summary (collapsible) ─────────────────────────────── */}
        {answers && (
          <div
            className={`bg-white border border-[#e8e4de] rounded-2xl mb-5 overflow-hidden transition-all duration-700 delay-400 ${
              celebrated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#faf9f7] transition-colors"
              onClick={() => setShowDetails((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <Home size={14} className="text-[#b8a88a]" />
                <span className="text-[#2c2825] font-medium text-sm">View profile summary</span>
              </div>
              <span className="text-[#8c8580] text-xs">{showDetails ? "Hide" : "Show"}</span>
            </button>

            {showDetails && (
              <div className="px-6 pb-6 border-t border-[#f0ece6] space-y-4 pt-4">
                <SummaryRow label="Name" value={`${answers.firstName} ${answers.lastName}`} />
                <SummaryRow label="Timeline" value={answers.timeline || "-"} />
                <SummaryRow
                  label="Budget"
                  value={`${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`}
                />
                <SummaryRow
                  label="Location"
                  value={
                    [answers.preferredCity, answers.preferredNeighbourhoods]
                      .filter(Boolean)
                      .join(", ") || "-"
                  }
                />
                <SummaryRow
                  label="Property"
                  value={`${answers.propertyType || "-"} · ${answers.bedrooms} bed · ${answers.bathrooms} bath`}
                />
                <SummaryRow label="Pre-approval" value={answers.preApprovalStatus || "-"} />

                {answers.mustHaves.length > 0 && (
                  <div className="pt-3 border-t border-[#f0ece6]">
                    <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-2">Must-haves</p>
                    <div className="flex flex-wrap gap-2">
                      {answers.mustHaves.map((item) => (
                        <span key={item} className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Next steps ────────────────────────────────────────────────── */}
        <div
          className={`space-y-3 transition-all duration-700 delay-500 ${
            celebrated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Primary CTA — portal */}
          <Link
            href="/portal"
            className="flex items-center justify-between gap-4 bg-[#b8a88a] hover:bg-[#c9b99b] text-[#2c2825] rounded-2xl p-5 transition-colors group"
          >
            <div>
              <p className="font-semibold text-sm mb-0.5">Open your Home Hub</p>
              <p className="text-[#2c2825]/70 text-xs">
                Affordability insights, matched homes, neighbourhood scores
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Listings */}
          <Link
            href="/listings"
            className="flex items-center justify-between gap-4 bg-white border border-[#e8e4de] hover:border-[#2c2825] text-[#2c2825] rounded-2xl p-5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-[#b8a88a] shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-0.5">Browse matched listings</p>
                <p className="text-[#8c8580] text-xs">
                  Every property now shows your personal match score
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="shrink-0 text-[#8c8580] group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Realtor connect */}
          <div className="bg-[#2c2825] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium text-sm mb-0.5">Your realtor will love this</p>
              <p className="text-[#e8e4de]/60 text-xs leading-relaxed">
                Share your completed profile — they can start finding your home immediately.
              </p>
            </div>
            <Link
              href="/portal"
              className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap"
            >
              View Hub
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start text-sm gap-4">
      <span className="text-[#8c8580] shrink-0">{label}</span>
      <span className="text-[#2c2825] font-medium text-right">{value}</span>
    </div>
  );
}
