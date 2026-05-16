"use client";

import { useState } from "react";
import {
  BuyerIntelligence,
  CommunicationStyle,
  MotivationTier,
  FollowUpChannel,
} from "@/lib/buyerIntelligence";
import {
  Brain, Zap, AlertTriangle, Sparkles, ChevronDown, ChevronUp,
  Mail, Phone, MessageSquare, Copy, Check, RotateCcw,
} from "lucide-react";

// ─── Style colours ────────────────────────────────────────────────────────────

const STYLE_COLORS: Record<CommunicationStyle, { bg: string; border: string; badge: string; text: string }> = {
  Analytical:  { bg: "bg-blue-50",    border: "border-blue-200",   badge: "bg-blue-100 text-blue-700 border-blue-200",    text: "text-blue-700" },
  Visionary:   { bg: "bg-violet-50",  border: "border-violet-200", badge: "bg-violet-100 text-violet-700 border-violet-200", text: "text-violet-700" },
  Decisive:    { bg: "bg-emerald-50", border: "border-emerald-200",badge: "bg-emerald-100 text-emerald-700 border-emerald-200", text: "text-emerald-700" },
  Cautious:    { bg: "bg-amber-50",   border: "border-amber-200",  badge: "bg-amber-100 text-amber-700 border-amber-200",   text: "text-amber-700" },
};

const MOTIVATION_COLORS: Record<MotivationTier, string> = {
  High:   "bg-emerald-500",
  Medium: "bg-[#b8a88a]",
  Low:    "bg-slate-300",
};

const MOTIVATION_LABELS: Record<MotivationTier, string> = {
  High:   "High",
  Medium: "Medium",
  Low:    "Low",
};

const CHANNEL_META: Record<FollowUpChannel, { icon: typeof Mail; label: string; color: string }> = {
  email: { icon: Mail,           label: "Email",      color: "text-blue-500" },
  call:  { icon: Phone,          label: "Call",       color: "text-emerald-500" },
  text:  { icon: MessageSquare,  label: "Text",       color: "text-violet-500" },
};

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  intelligence: BuyerIntelligence;
}

export default function BuyerIntelligencePanel({ intelligence }: Props) {
  const { style, motivation, triggers, hesitations, toneGuide, followUpSuggestions, recoveryPrompt, summaryLine } = intelligence;
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const colors = STYLE_COLORS[style.type];

  return (
    <div className="space-y-5">

      {/* Recovery prompt — always show first if present */}
      {recoveryPrompt && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <RotateCcw size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-amber-800 font-semibold text-sm">Inactive lead — time to re-engage</p>
              <p className="text-amber-700 text-xs mt-0.5">This buyer has gone quiet. Here's a recovery message tailored to their communication style.</p>
            </div>
          </div>
          <div className="bg-white border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[#8c8580] uppercase tracking-wider">Suggested subject</p>
              <CopyButton text={`Subject: ${recoveryPrompt.subject}\n\n${recoveryPrompt.message}`} />
            </div>
            <p className="text-sm font-medium text-[#2c2825] mb-3 italic">"{recoveryPrompt.subject}"</p>
            <pre className="text-sm text-[#5c5550] whitespace-pre-wrap font-sans leading-relaxed">{recoveryPrompt.message}</pre>
          </div>
          <p className="text-xs text-amber-700 mt-3 flex items-start gap-1.5">
            <AlertTriangle size={11} className="shrink-0 mt-0.5" />
            {recoveryPrompt.rationale}
          </p>
        </div>
      )}

      {/* Summary banner */}
      <div className={`${colors.bg} ${colors.border} border rounded-2xl p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colors.badge}`}>
              <Brain size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
                  {style.type}
                </span>
                <span className="text-[#8c8580] text-xs">{style.headline}</span>
              </div>
              <p className="text-[#2c2825] text-sm font-medium">{summaryLine}</p>
            </div>
          </div>
          {/* Motivation */}
          <div className="text-right shrink-0">
            <p className="text-[#8c8580] text-xs mb-1">Motivation</p>
            <div className="flex items-center gap-1.5 justify-end">
              <div className="w-16 h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${MOTIVATION_COLORS[motivation.tier]}`}
                  style={{ width: `${motivation.score}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${motivation.tier === "High" ? "text-emerald-700" : motivation.tier === "Medium" ? "text-[#b8a88a]" : "text-[#8c8580]"}`}>
                {MOTIVATION_LABELS[motivation.tier]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Style + Motivation detail row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Communication style */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
          <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-3">Communication Style</p>
          <p className="text-[#2c2825] text-sm leading-relaxed mb-4">{style.description}</p>
          <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3">
            <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-1">Realtor tip</p>
            <p className="text-[#5c5550] text-xs leading-relaxed">{style.realtorTip}</p>
          </div>
        </div>

        {/* Motivation signals */}
        <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#8c8580] text-xs uppercase tracking-wider">Motivation Level</p>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className={motivation.tier === "High" ? "text-emerald-500" : motivation.tier === "Medium" ? "text-[#b8a88a]" : "text-[#8c8580]"} />
              <span className={`text-xs font-semibold ${motivation.tier === "High" ? "text-emerald-600" : motivation.tier === "Medium" ? "text-[#b8a88a]" : "text-[#8c8580]"}`}>
                {motivation.score}/100
              </span>
            </div>
          </div>
          <div className="h-2 bg-[#f0ece6] rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all ${MOTIVATION_COLORS[motivation.tier]}`}
              style={{ width: `${motivation.score}%` }}
            />
          </div>
          {motivation.signals.length > 0 && (
            <div className="space-y-2">
              {motivation.signals.map((s) => (
                <div key={s} className="flex items-start gap-2 text-xs text-[#5c5550]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b8a88a] shrink-0 mt-1" />
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Triggers + Hesitations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Emotional triggers */}
        {triggers.length > 0 && (
          <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-[#b8a88a]" />
              <p className="text-[#2c2825] font-semibold text-sm">Emotional Triggers</p>
            </div>
            <p className="text-[#8c8580] text-xs mb-4">What excites this buyer and drives their decision.</p>
            <div className="space-y-3">
              {triggers.map((t) => (
                <div key={t.label} className="border-l-2 border-[#b8a88a] pl-3">
                  <p className="text-[#2c2825] text-xs font-semibold mb-0.5">{t.label}</p>
                  <p className="text-[#8c8580] text-xs leading-relaxed">{t.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hesitation points */}
        {hesitations.length > 0 && (
          <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-amber-500" />
              <p className="text-[#2c2825] font-semibold text-sm">Hesitation Points</p>
            </div>
            <p className="text-[#8c8580] text-xs mb-4">What might be holding them back — and how to address it.</p>
            <div className="space-y-4">
              {hesitations.map((h) => (
                <div key={h.label} className="border-l-2 border-amber-300 pl-3">
                  <p className="text-[#2c2825] text-xs font-semibold mb-0.5">{h.label}</p>
                  <p className="text-[#8c8580] text-xs leading-relaxed mb-2">{h.detail}</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-amber-800 text-xs leading-relaxed">{h.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up tone guide */}
      <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
        <div className="mb-4">
          <p className="text-[#2c2825] font-semibold text-sm mb-0.5">{toneGuide.title}</p>
          <p className="text-[#8c8580] text-sm">{toneGuide.description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">Do</p>
            <div className="space-y-1.5">
              {toneGuide.dos.map((d) => (
                <div key={d} className="flex items-start gap-2 text-xs text-[#5c5550]">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-rose-600 text-xs font-semibold uppercase tracking-wider mb-2">Don't</p>
            <div className="space-y-1.5">
              {toneGuide.donts.map((d) => (
                <div key={d} className="flex items-start gap-2 text-xs text-[#5c5550]">
                  <div className="w-4 h-4 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  </div>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up suggestions */}
      <div>
        <div className="mb-3">
          <p className="text-[#2c2825] font-semibold text-sm">Personalized Follow-up Suggestions</p>
          <p className="text-[#8c8580] text-xs mt-0.5">Ready-to-use messages tailored to this buyer's style and timing. Click any card to expand.</p>
        </div>
        <div className="space-y-3">
          {followUpSuggestions.map((s) => {
            const isOpen = expandedSuggestion === s.id;
            const { icon: ChannelIcon, label: channelLabel, color: channelColor } = CHANNEL_META[s.channel];
            return (
              <div
                key={s.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all ${s.urgent ? "border-rose-200" : "border-[#e8e4de]"}`}
              >
                <button
                  onClick={() => setExpandedSuggestion(isOpen ? null : s.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#faf9f7] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${s.urgent ? "bg-rose-50 border-rose-200" : "bg-[#f5f3f0] border-[#e8e4de]"}`}>
                      <ChannelIcon size={13} className={s.urgent ? "text-rose-500" : channelColor} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#2c2825] text-sm font-medium">{s.timing}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.urgent ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-[#f5f3f0] text-[#8c8580] border-[#e8e4de]"}`}>
                          {s.urgent ? "Time-sensitive" : channelLabel}
                        </span>
                      </div>
                      {s.subject && (
                        <p className="text-[#8c8580] text-xs mt-0.5 italic">"{s.subject}"</p>
                      )}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={15} className="text-[#8c8580] shrink-0" /> : <ChevronDown size={15} className="text-[#8c8580] shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-[#f0ece6]">
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[#8c8580] text-xs uppercase tracking-wider font-medium">Message</p>
                        <CopyButton text={s.subject ? `Subject: ${s.subject}\n\n${s.message}` : s.message} />
                      </div>
                      <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl p-4">
                        <pre className="text-sm text-[#2c2825] whitespace-pre-wrap font-sans leading-relaxed">{s.message}</pre>
                      </div>
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#b8a88a] shrink-0 mt-1.5" />
                      <p className="text-xs text-[#8c8580] leading-relaxed">{s.rationale}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
