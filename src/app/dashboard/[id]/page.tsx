"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { Lead, LeadStatus, RealtorNote, FollowUpReminder, MortgageChecklistItem } from "@/types";
import { formatCurrency, formatDate, getScoreColor } from "@/lib/utils";
import PropertyCard from "@/components/dashboard/PropertyCard";
import MatchScoreRing from "@/components/dashboard/MatchScoreRing";
import DreamHomeProfile from "@/components/dashboard/DreamHomeProfile";
import FollowUpReminders from "@/components/dashboard/FollowUpReminders";
import EmailTemplates from "@/components/dashboard/EmailTemplates";
import MortgageChecklist from "@/components/dashboard/MortgageChecklist";
import BuyerBrief from "@/components/dashboard/BuyerBrief";
import { ArrowLeft, Star, Plus, Trash2, Home, Printer, ExternalLink, Info, Phone, Mail, MessageSquare, Clock } from "lucide-react";
import { calcBuyerReadiness } from "@/lib/buyerMatch";
import { calcBuyerIntelligence } from "@/lib/buyerIntelligence";
import BuyerIntelligencePanel from "@/components/dashboard/BuyerIntelligence";
import Link from "next/link";

const STATUS_OPTIONS: LeadStatus[] = [
  "New Lead", "Qualified", "Showing Booked", "Offer Stage", "Closed",
];

type Tab = "brief" | "outreach" | "profile" | "checklist";

// ─── Playbook ─────────────────────────────────────────────────────────────────
type Playbook = { icon: React.ReactNode; action: string; color: string; bg: string; border: string };

function getPlaybook(lead: Lead): Playbook {
  const { answers, score } = lead;
  const isFinanced = answers.preApprovalStatus === "Yes, fully approved" || answers.preApprovalStatus === "Paying cash";
  const isASAP = answers.timeline === "ASAP" || answers.timeline === "1–3 months";
  if (score === "Hot" && isASAP && isFinanced) return { icon: <Phone size={13} />, action: "Call within 2 hours", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
  if (score === "Hot") return { icon: <Mail size={13} />, action: "Email today, call tomorrow", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  if (score === "Warm") return { icon: <MessageSquare size={13} />, action: "Email now, follow up in 5 days", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
  return { icon: <Clock size={13} />, action: "Monthly touch - no rush", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
}

// Persist mock lead overrides across navigation (localStorage)
function getMockOverrides(): Record<string, Partial<Lead>> {
  try { return JSON.parse(localStorage.getItem("hm_mock_overrides") ?? "{}"); } catch { return {}; }
}
function saveMockOverride(id: string, patch: Partial<Lead>) {
  try {
    const all = getMockOverrides();
    all[id] = { ...all[id], ...patch };
    localStorage.setItem("hm_mock_overrides", JSON.stringify(all));
  } catch { /* ignore */ }
}

// Persist notes and reminders per lead (localStorage, works for both mock and real leads)
function getLeadNotes(id: string): RealtorNote[] {
  try { return JSON.parse(localStorage.getItem(`hm_notes_${id}`) ?? "[]"); } catch { return []; }
}
function saveLeadNotes(id: string, notes: RealtorNote[]) {
  try { localStorage.setItem(`hm_notes_${id}`, JSON.stringify(notes)); } catch { /* ignore */ }
}
function getLeadReminders(id: string): FollowUpReminder[] {
  try { return JSON.parse(localStorage.getItem(`hm_reminders_${id}`) ?? "[]"); } catch { return []; }
}
function saveLeadReminders(id: string, reminders: FollowUpReminder[]) {
  try { localStorage.setItem(`hm_reminders_${id}`, JSON.stringify(reminders)); } catch { /* ignore */ }
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const baseMockLead = mockLeads.find((l) => l.id === id);
  // Apply any previously saved overrides so status changes survive navigation
  const initialLead = baseMockLead
    ? {
        ...baseMockLead,
        ...(typeof window !== "undefined" ? getMockOverrides()[id] ?? {} : {}),
        realtorNotes: typeof window !== "undefined" ? getLeadNotes(id) : baseMockLead.realtorNotes,
        reminders: typeof window !== "undefined" ? getLeadReminders(id) : baseMockLead.reminders,
      }
    : undefined;
  const [lead, setLead] = useState<Lead | null>(initialLead ?? null);
  const [realtorName, setRealtorName] = useState<string>("");
  const [realtorPhone, setRealtorPhone] = useState<string>("");

  // Load realtor info for template personalisation
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const first = (user.user_metadata?.first_name as string) ?? "";
      const last = (user.user_metadata?.last_name as string) ?? "";
      setRealtorName([first, last].filter(Boolean).join(" "));
      setRealtorPhone((user.user_metadata?.phone as string) ?? "");
    });
  }, []);

  // Fetch from Supabase if not found in mock data
  useEffect(() => {
    if (initialLead) return;
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
          realtorNotes: getLeadNotes(row.id as string),
          reminders: getLeadReminders(row.id as string),
          savedHomeIds: [],
          answers: row.answers as Lead["answers"],
        });
      }
    });
  }, [id, initialLead]);
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState<Tab>("brief");
  const [statusSaved, setStatusSaved] = useState(false);

  const properties = mockProperties.filter((p) => p.leadId === id);

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#2c2825] font-medium mb-2">Lead not found</p>
          <Link href="/dashboard" className="text-[#8c8580] text-sm underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const { answers } = lead;
  const readiness = calcBuyerReadiness(answers);
  const intelligence = calcBuyerIntelligence(answers, { submittedAt: lead.submittedAt, status: lead.status });

  async function updateStatus(status: LeadStatus) {
    setLead((p) => p && { ...p, status });
    setStatusSaved(false);
    const isMock = mockLeads.some((l) => l.id === id);
    if (isMock) {
      saveMockOverride(id, { status });
      setStatusSaved(true);
      setTimeout(() => setStatusSaved(false), 2000);
    } else {
      const supabase = createClient();
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (!error) {
        setStatusSaved(true);
        setTimeout(() => setStatusSaved(false), 2000);
      }
    }
  }

  async function togglePriority() {
    const next = !lead?.isPriority;
    setLead((p) => p && { ...p, isPriority: next });
    const isMock = mockLeads.some((l) => l.id === id);
    if (isMock) {
      saveMockOverride(id, { isPriority: next });
    } else {
      const supabase = createClient();
      await supabase.from("leads").update({ is_priority: next }).eq("id", id);
    }
  }

  function addNote() {
    const text = newNote.trim();
    if (!text) return;
    const note: RealtorNote = { id: `note-${Date.now()}`, text, createdAt: new Date().toISOString() };
    setLead((p) => {
      if (!p) return p;
      const updated = [...p.realtorNotes, note];
      saveLeadNotes(p.id, updated);
      return { ...p, realtorNotes: updated };
    });
    setNewNote("");
  }

  function deleteNote(noteId: string) {
    setLead((p) => {
      if (!p) return p;
      const updated = p.realtorNotes.filter((n) => n.id !== noteId);
      saveLeadNotes(p.id, updated);
      return { ...p, realtorNotes: updated };
    });
  }

  function updateReminders(reminders: FollowUpReminder[]) {
    setLead((p) => {
      if (!p) return p;
      saveLeadReminders(p.id, reminders);
      return { ...p, reminders };
    });
  }

  function updateChecklist(items: MortgageChecklistItem[]) {
    setLead((p) => p ? { ...p, answers: { ...p.answers, mortgageChecklist: items } } : p);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "brief", label: "Brief" },
    { id: "outreach", label: "Outreach" },
    { id: "profile", label: "Profile" },
    { id: "checklist", label: "Checklist" },
  ];

  const pb = getPlaybook(lead);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6">

        {/* ── Compact header ─────────────────────────────────────────────── */}
        <div className="mb-5">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-[#8c8580] hover:text-[#2c2825] text-xs mb-4 transition-colors"
          >
            <ArrowLeft size={12} /> Back to leads
          </button>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#2c2825] text-white flex items-center justify-center text-sm font-bold shrink-0">
              {answers.firstName.charAt(0)}{answers.lastName.charAt(0)}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-semibold text-[#2c2825]">
                  {answers.firstName} {answers.lastName}
                </h1>
                {lead.isPriority && <Star size={11} className="text-[#b8a88a] fill-[#b8a88a]" />}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getScoreColor(lead.score)}`}>
                  {lead.score}
                </span>
              </div>
              <p className="text-xs text-[#8c8580] truncate">{answers.email} · {answers.phone}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a href={`tel:${answers.phone}`} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors">
                <Phone size={12} /> Call
              </a>
              <a href={`mailto:${answers.email}`} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl border border-[#e8e4de] bg-white text-[#2c2825] hover:border-[#2c2825] transition-colors">
                <Mail size={12} /> Email
              </a>
              <button onClick={togglePriority} className={`p-2 rounded-xl border transition-all ${lead.isPriority ? "bg-[#b8a88a]/20 border-[#b8a88a] text-[#8c6a3e]" : "border-[#e8e4de] bg-white text-[#8c8580]"}`}>
                <Star size={12} className={lead.isPriority ? "fill-[#8c6a3e]" : ""} />
              </button>
              <Link href={`/dashboard/${lead.id}/print`} className="p-2 rounded-xl border border-[#e8e4de] bg-white text-[#8c8580] hover:text-[#2c2825] transition-colors">
                <Printer size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Action directive banner ─────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3 mb-5"
          style={{ background: pb.bg, borderColor: pb.border }}
        >
          <span style={{ color: pb.color }} className="shrink-0">{pb.icon}</span>
          <p className="text-sm font-bold" style={{ color: pb.color }}>{pb.action}</p>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getScoreColor(lead.score)}`}>
              {lead.score}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={lead.status}
                onChange={(e) => updateStatus(e.target.value as LeadStatus)}
                className="text-xs border border-[#e8e4de] rounded-lg px-2 py-1 bg-white text-[#2c2825] focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {statusSaved && (
                <span className="text-[10px] text-emerald-600 font-medium animate-fade-up">Saved ✓</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: tabs + content ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tab bar */}
            <div className="flex gap-1 bg-[#f0ece6] rounded-xl p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 text-xs py-2 px-2 rounded-lg transition-all font-medium ${
                    tab === t.id
                      ? "bg-white text-[#2c2825] shadow-sm"
                      : "text-[#8c8580] hover:text-[#2c2825]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Brief */}
            {tab === "brief" && <BuyerBrief lead={lead} />}

            {/* Tab: Outreach */}
            {tab === "outreach" && <EmailTemplates lead={lead} realtorName={realtorName} realtorPhone={realtorPhone} />}

            {/* Tab: Profile */}
            {tab === "profile" && (
              <div className="space-y-4">
                {/* Readiness card */}
                <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <MatchScoreRing score={readiness.overall} size="lg" />
                    <div>
                      <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-0.5">Buyer Readiness</p>
                      <p className="text-[#2c2825] font-semibold text-lg">{readiness.overall} / 100</p>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        readiness.overall >= 80 ? "bg-emerald-50 text-emerald-700" :
                        readiness.overall >= 60 ? "bg-[#f5f3f0] text-[#b8a88a]" :
                        readiness.overall >= 40 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"
                      }`}>{readiness.label}</span>
                    </div>
                    <div className="ml-auto text-right text-xs text-[#8c8580]">
                      <p>Pre-approval: <strong className="text-[#2c2825]">{answers.preApprovalStatus || "-"}</strong></p>
                      <p className="mt-0.5">Timeline: <strong className="text-[#2c2825]">{answers.timeline || "-"}</strong></p>
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-3">
                    {[readiness.financing, readiness.timeline, readiness.documentation, readiness.commitment].map((dim) => (
                      <div key={dim.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#2c2825] font-medium">{dim.label}</span>
                          <span className="text-[#8c8580]">{dim.detail}</span>
                        </div>
                        <div className="h-1.5 bg-[#f0ece6] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${dim.score >= 75 ? "bg-emerald-500" : dim.score >= 50 ? "bg-[#b8a88a]" : dim.score >= 30 ? "bg-amber-400" : "bg-slate-300"}`} style={{ width: `${dim.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {readiness.tip && (
                    <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 flex gap-2.5 items-start">
                      <Info size={13} className="text-[#b8a88a] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#5c5550]">{readiness.tip}</p>
                    </div>
                  )}
                </div>

                {/* Buyer intelligence summary */}
                <BuyerIntelligencePanel intelligence={intelligence} />

                {/* Buyer details */}
                <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
                  <h2 className="text-[#2c2825] font-semibold mb-4 text-sm">Details</h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <DetailRow label="Timeline" value={answers.timeline} />
                    <DetailRow label="Budget" value={`${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`} />
                    <DetailRow label="Location" value={answers.preferredCity} />
                    <DetailRow label="Neighbourhoods" value={answers.preferredNeighbourhoods} />
                    <DetailRow label="Property type" value={answers.propertyType} />
                    <DetailRow label="Size" value={`${answers.bedrooms} bed · ${answers.bathrooms} bath`} />
                    <DetailRow label="Pre-approval" value={answers.preApprovalStatus} />
                    <DetailRow label="Ownership" value={answers.ownershipStatus} />
                    <DetailRow label="Purpose" value={answers.investmentOrPersonal} />
                  </div>
                  {answers.additionalNotes && (
                    <div className="mt-4 pt-4 border-t border-[#e8e4de]">
                      <p className="text-[#8c8580] text-xs mb-1">Buyer notes</p>
                      <p className="text-[#2c2825] text-sm leading-relaxed">{answers.additionalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Must-haves / deal-breakers */}
                <div className="bg-white border border-[#e8e4de] rounded-2xl p-5 space-y-4">
                  <ChipSection title="Must-haves" items={answers.mustHaves} />
                  <ChipSection title="Deal breakers" items={answers.dealBreakers} accent />
                </div>

                {/* Dream home + recommended homes */}
                <DreamHomeProfile answers={answers} />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[#2c2825] font-semibold text-sm">Recommended Homes</h2>
                    <button className="flex items-center gap-1 text-xs border border-[#e8e4de] px-3 py-1.5 rounded-full hover:border-[#2c2825] transition-colors bg-white text-[#2c2825]">
                      <Plus size={11} /> Add
                    </button>
                  </div>
                  {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e8e4de] rounded-2xl p-8 text-center">
                      <Home size={22} className="text-[#e8e4de] mx-auto mb-2" />
                      <p className="text-[#2c2825] font-medium text-sm mb-1">No recommendations yet</p>
                      <p className="text-[#8c8580] text-xs">Add homes that match this buyer&apos;s profile.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Checklist */}
            {tab === "checklist" && (
              <MortgageChecklist items={answers.mortgageChecklist || []} onChange={updateChecklist} />
            )}
          </div>

          {/* ── Right sidebar ───────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Follow-up reminders */}
            <FollowUpReminders reminders={lead.reminders} onChange={updateReminders} />

            {/* Private notes */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-4">
              <p className="text-[#2c2825] font-semibold text-sm mb-3">Private Notes</p>
              {lead.realtorNotes.length > 0 && (
                <div className="space-y-2.5 mb-3">
                  {lead.realtorNotes.map((note) => (
                    <div key={note.id} className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl p-3 group">
                      <p className="text-[#2c2825] text-xs leading-relaxed mb-1.5">{note.text}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-[#8c8580] text-[10px]">{formatDate(note.createdAt)}</p>
                        <button onClick={() => deleteNote(note.id)} className="text-[#8c8580] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a private note..."
                rows={3}
                className="w-full border border-[#e8e4de] rounded-xl px-3 py-2.5 text-xs text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7] resize-none mb-2"
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="w-full bg-[#2c2825] text-white text-xs font-medium py-2 rounded-full hover:bg-[#1a1714] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>

            {/* Pipeline link */}
            <Link
              href="/pipeline"
              className="flex items-center justify-center gap-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] bg-white border border-[#e8e4de] rounded-xl py-2.5 transition-colors"
            >
              <ExternalLink size={11} /> View in pipeline board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[#8c8580] text-xs mb-0.5">{label}</p>
      <p className="text-[#2c2825] text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function ChipSection({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              accent
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-[#f5f3f0] text-[#2c2825] border-[#e8e4de]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
