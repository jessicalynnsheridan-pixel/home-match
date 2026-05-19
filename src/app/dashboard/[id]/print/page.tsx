"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { formatCurrency, formatDate } from "@/lib/utils";
import { generateDreamHomeProfile } from "@/lib/matchScore";
import { Printer } from "lucide-react";
import { Lead } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function PrintProfilePage() {
  const { id } = useParams<{ id: string }>();

  // Try mock leads first, then fall back to Supabase
  const mockLead = mockLeads.find((l) => l.id === id);
  const [lead, setLead] = useState<Lead | null>(mockLead ?? null);
  const [loading, setLoading] = useState(!mockLead);

  useEffect(() => {
    if (mockLead) return;
    const supabase = createClient();
    supabase.from("leads").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        const row = data as Record<string, unknown>;
        setLead({
          id: row.id as string,
          score: (row.score as Lead["score"]) ?? "Browsing",
          matchScore: (row.match_score as number) ?? 0,
          status: (row.status as Lead["status"]) ?? "New Lead",
          isPriority: (row.is_priority as boolean) ?? false,
          submittedAt: row.submitted_at as string,
          realtorNotes: [],
          reminders: [],
          savedHomeIds: [],
          answers: {
            firstName: "", lastName: "", email: "", phone: "",
            mustHaves: [], dealBreakers: [], lifestylePriorities: [],
            mortgageChecklist: [], homeFeeling: [], neighbourhoodVibe: [],
            proximityPriorities: [], currentFrustration: [],
            ...(row.answers as Partial<Lead["answers"]> ?? {}),
          } as Lead["answers"],
        });
      }
      setLoading(false);
    });
  }, [id, mockLead]);

  const properties = mockProperties.filter((p) => p.leadId === id);

  if (loading) return <div className="p-10 text-[#8c8580]">Loading...</div>;
  if (!lead) return <div className="p-10 text-[#8c8580]">Lead not found.</div>;

  const { answers } = lead;
  const dreamProfile = generateDreamHomeProfile(answers);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Print control, hidden when printing */}
      <div className="print:hidden max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
        <a href={`/dashboard/${id}`} className="text-sm text-[#8c8580] hover:text-[#2c2825]">
          ← Back to profile
        </a>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#2c2825] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1714] transition-colors"
        >
          <Printer size={14} /> Download / Print PDF
        </button>
      </div>

      {/* ── PDF Document ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-16 print:px-0 print:max-w-none">
        <div className="bg-white border border-[#e8e4de] rounded-3xl overflow-hidden shadow-sm print:shadow-none print:border-0 print:rounded-none">

          {/* Cover header */}
          <div className="bg-[#2c2825] px-10 py-10 print:py-12">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase mb-2">
                  Confidential Buyer Profile
                </p>
                <h1 className="text-white text-3xl font-semibold mb-1">
                  {answers.firstName} {answers.lastName}
                </h1>
                <p className="text-[#e8e4de]/60 text-sm">
                  {answers.email} · {answers.phone}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#b8a88a] text-xs font-medium tracking-widest uppercase mb-1">
                  Match Score
                </p>
                <p className="text-white text-4xl font-semibold">{lead.matchScore}</p>
                <p className="text-[#e8e4de]/60 text-xs">out of 100</p>
              </div>
            </div>

            {/* Score bar */}
            <div className="mt-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b8a88a] rounded-full"
                  style={{ width: `${lead.matchScore}%` }}
                />
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Budget", value: `${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}` },
                { label: "Timeline", value: answers.timeline || "-" },
                { label: "Property", value: `${answers.propertyType || "-"}` },
                { label: "Pre-Approval", value: answers.preApprovalStatus || "-" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-[#e8e4de]/50 text-xs uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-white text-sm font-medium">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-8 space-y-8">

            {/* Dream home narrative */}
            <div>
              <SectionTitle>Dream Home Profile</SectionTitle>
              <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-5">
                <p className="text-[#2c2825] text-sm leading-relaxed italic">&ldquo;{dreamProfile}&rdquo;</p>
              </div>
            </div>

            {/* Location & lifestyle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <SectionTitle>Location Preferences</SectionTitle>
                <div className="space-y-3">
                  <InfoRow label="City" value={answers.preferredCity} />
                  <InfoRow label="Neighbourhoods" value={answers.preferredNeighbourhoods} />
                  <InfoRow label="School district" value={answers.schoolDistrictImportance} />
                  <InfoRow label="Commute" value={answers.commutePreferences} />
                </div>
                {answers.neighbourhoodVibe && answers.neighbourhoodVibe.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-2">Neighbourhood vibe</p>
                    <div className="flex flex-wrap gap-2">
                      {answers.neighbourhoodVibe.map((v) => (
                        <span key={v} className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1 rounded-full">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <SectionTitle>Property Requirements</SectionTitle>
                <div className="space-y-3">
                  <InfoRow label="Type" value={answers.propertyType} />
                  <InfoRow label="Bedrooms" value={`${answers.bedrooms}+`} />
                  <InfoRow label="Bathrooms" value={`${answers.bathrooms}+`} />
                  <InfoRow label="Purpose" value={answers.investmentOrPersonal} />
                  <InfoRow label="Ownership" value={answers.ownershipStatus} />
                </div>
              </div>
            </div>

            {/* Must-haves & deal breakers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <SectionTitle>Must-Haves</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {(answers.mustHaves ?? []).map((i) => (
                    <span key={i} className="bg-[#2c2825] text-white text-xs px-3 py-1.5 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
              <div>
                <SectionTitle>Deal Breakers</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {(answers.dealBreakers ?? []).map((i) => (
                    <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3 py-1.5 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle priorities */}
            {(answers.lifestylePriorities ?? []).length > 0 && (
              <div>
                <SectionTitle>Lifestyle Priorities</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {(answers.lifestylePriorities ?? []).map((i) => (
                    <span key={i} className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Mortgage readiness */}
            <div>
              <SectionTitle>Mortgage Readiness</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(answers.mortgageChecklist ?? []).map((item) => (
                  <div
                    key={item.id}
                    className={`text-xs px-3 py-2 rounded-xl border text-center ${
                      item.completed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-[#faf9f7] border-[#e8e4de] text-[#8c8580]"
                    }`}
                  >
                    {item.completed ? "✓ " : "○ "}{item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended properties */}
            {properties.length > 0 && (
              <div>
                <SectionTitle>Recommended Properties</SectionTitle>
                <div className="space-y-3">
                  {properties.map((p) => (
                    <div key={p.id} className="border border-[#e8e4de] rounded-2xl p-4 flex gap-4">
                      <div className="shrink-0 w-20 h-16 bg-[#e8e4de] rounded-xl overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt={p.address} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#2c2825] font-medium text-sm">{p.address}</p>
                        <p className="text-[#b8a88a] font-semibold">{formatCurrency(p.price)}</p>
                        <p className="text-[#8c8580] text-xs">{p.bedrooms} bed · {p.bathrooms} bath · {p.sqft.toLocaleString()} sqft</p>
                        <p className="text-[#8c8580] text-xs mt-1 leading-relaxed">{p.matchReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer notes */}
            {answers.additionalNotes && (
              <div>
                <SectionTitle>Buyer Notes</SectionTitle>
                <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-2xl p-5">
                  <p className="text-[#2c2825] text-sm leading-relaxed">{answers.additionalNotes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-[#e8e4de] flex justify-between text-xs text-[#8c8580]">
              <p>HomeMatch · Confidential Buyer Profile</p>
              <p>Prepared {formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#8c8580] text-xs font-medium uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm border-b border-[#f5f3f0] pb-2">
      <span className="text-[#8c8580]">{label}</span>
      <span className="text-[#2c2825] font-medium text-right max-w-xs">{value || "-"}</span>
    </div>
  );
}
