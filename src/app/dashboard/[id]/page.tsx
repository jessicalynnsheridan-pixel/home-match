"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockLeads } from "@/data/mockLeads";
import { mockProperties } from "@/data/mockProperties";
import { Lead, LeadStatus, RealtorNote, FollowUpReminder, MortgageChecklistItem } from "@/types";
import { formatCurrency, formatDate, getScoreColor, getStatusColor } from "@/lib/utils";
import PropertyCard from "@/components/dashboard/PropertyCard";
import MatchScoreRing from "@/components/dashboard/MatchScoreRing";
import DreamHomeProfile from "@/components/dashboard/DreamHomeProfile";
import FollowUpReminders from "@/components/dashboard/FollowUpReminders";
import EmailTemplates from "@/components/dashboard/EmailTemplates";
import MortgageChecklist from "@/components/dashboard/MortgageChecklist";
import { ArrowLeft, Star, Plus, Trash2, Home, Printer, ExternalLink } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS: LeadStatus[] = [
  "New Lead", "Qualified", "Showing Booked", "Offer Stage", "Closed",
];

type Tab = "profile" | "email" | "checklist";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const initialLead = mockLeads.find((l) => l.id === id);
  const [lead, setLead] = useState<Lead | null>(initialLead ?? null);
  const [newNote, setNewNote] = useState("");
  const [tab, setTab] = useState<Tab>("profile");

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

  function updateStatus(status: LeadStatus) { setLead((p) => p && { ...p, status }); }
  function togglePriority() { setLead((p) => p && { ...p, isPriority: !p.isPriority }); }

  function addNote() {
    const text = newNote.trim();
    if (!text) return;
    const note: RealtorNote = { id: `note-${Date.now()}`, text, createdAt: new Date().toISOString() };
    setLead((p) => p ? { ...p, realtorNotes: [...p.realtorNotes, note] } : p);
    setNewNote("");
  }

  function deleteNote(id: string) {
    setLead((p) => p ? { ...p, realtorNotes: p.realtorNotes.filter((n) => n.id !== id) } : p);
  }

  function updateReminders(reminders: FollowUpReminder[]) {
    setLead((p) => p ? { ...p, reminders } : p);
  }

  function updateChecklist(items: MortgageChecklistItem[]) {
    setLead((p) => p ? { ...p, answers: { ...p.answers, mortgageChecklist: items } } : p);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile", label: "Full Profile" },
    { id: "email", label: "Email Templates" },
    { id: "checklist", label: "Mortgage Checklist" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-[#8c8580] hover:text-[#2c2825] text-sm mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to leads
            </button>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              {lead.isPriority && <Star size={16} className="text-[#b8a88a] fill-[#b8a88a]" />}
              <h1 className="text-2xl font-semibold text-[#2c2825]">
                {answers.firstName} {answers.lastName}
              </h1>
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getScoreColor(lead.score)}`}>
                {lead.score}
              </span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
            </div>
            <p className="text-[#8c8580] text-sm">
              {answers.email} · {answers.phone} · Submitted {formatDate(lead.submittedAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Link
              href={`/dashboard/${lead.id}/print`}
              className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border border-[#e8e4de] text-[#2c2825] hover:border-[#2c2825] transition-colors bg-white"
            >
              <Printer size={13} /> PDF Profile
            </Link>
            <button
              onClick={togglePriority}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border transition-all ${
                lead.isPriority
                  ? "bg-[#b8a88a] text-[#2c2825] border-[#b8a88a]"
                  : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
              }`}
            >
              <Star size={13} className={lead.isPriority ? "fill-[#2c2825]" : ""} />
              {lead.isPriority ? "Prioritized" : "Mark Priority"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: main content ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Match score + dream home profile */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 flex gap-6 items-start">
              <MatchScoreRing score={lead.matchScore} size="lg" />
              <div className="flex-1">
                <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-1">Buyer Readiness Score</p>
                <p className="text-[#2c2825] font-semibold text-lg mb-2">{lead.matchScore} / 100</p>
                <div className="h-2 bg-[#e8e4de] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${lead.matchScore >= 80 ? "bg-rose-400" : lead.matchScore >= 50 ? "bg-amber-400" : "bg-slate-300"}`}
                    style={{ width: `${lead.matchScore}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-3 text-xs text-[#8c8580]">
                  <span>Pre-approval: <strong className="text-[#2c2825]">{answers.preApprovalStatus || "—"}</strong></span>
                  <span>Timeline: <strong className="text-[#2c2825]">{answers.timeline || "—"}</strong></span>
                </div>
              </div>
            </div>

            {/* Dream home profile */}
            <DreamHomeProfile answers={answers} />

            {/* Tab nav */}
            <div className="flex gap-1 bg-[#f5f3f0] border border-[#e8e4de] rounded-xl p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 text-sm py-2 rounded-lg transition-all font-medium ${
                    tab === t.id
                      ? "bg-white text-[#2c2825] shadow-sm"
                      : "text-[#8c8580] hover:text-[#2c2825]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Full Profile */}
            {tab === "profile" && (
              <>
                {/* Buyer summary */}
                <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
                  <h2 className="text-[#2c2825] font-semibold mb-5">Buyer Profile</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <DetailRow label="Timeline" value={answers.timeline} />
                    <DetailRow label="Budget" value={`${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`} />
                    <DetailRow label="Location" value={answers.preferredCity} />
                    <DetailRow label="Neighbourhoods" value={answers.preferredNeighbourhoods} />
                    <DetailRow label="Property type" value={answers.propertyType} />
                    <DetailRow label="Size" value={`${answers.bedrooms} bed · ${answers.bathrooms} bath`} />
                    <DetailRow label="Pre-approval" value={answers.preApprovalStatus} />
                    <DetailRow label="Ownership" value={answers.ownershipStatus} />
                    <DetailRow label="Purpose" value={answers.investmentOrPersonal} />
                    <DetailRow label="School district" value={answers.schoolDistrictImportance} />
                  </div>
                  {answers.commutePreferences && (
                    <div className="mt-5 pt-5 border-t border-[#e8e4de]">
                      <p className="text-[#8c8580] text-xs mb-1">Commute preferences</p>
                      <p className="text-[#2c2825] text-sm">{answers.commutePreferences}</p>
                    </div>
                  )}
                </div>

                {/* Must-haves, deal breakers, lifestyle */}
                <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 space-y-5">
                  <ChipSection title="Must-haves" items={answers.mustHaves} />
                  <ChipSection title="Deal breakers" items={answers.dealBreakers} accent />
                  <ChipSection title="Lifestyle priorities" items={answers.lifestylePriorities} />
                </div>

                {/* Buyer notes */}
                {answers.additionalNotes && (
                  <div className="bg-white border border-[#e8e4de] rounded-2xl p-6">
                    <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-3">Buyer Notes</p>
                    <p className="text-[#2c2825] text-sm leading-relaxed">{answers.additionalNotes}</p>
                  </div>
                )}

                {/* Property recommendations */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#2c2825] font-semibold">Recommended Homes</h2>
                    <button className="flex items-center gap-1.5 text-sm border border-[#e8e4de] px-4 py-2 rounded-full hover:border-[#2c2825] transition-colors bg-white text-[#2c2825]">
                      <Plus size={13} /> Add recommendation
                    </button>
                  </div>
                  {properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#e8e4de] rounded-2xl p-10 text-center">
                      <Home size={24} className="text-[#e8e4de] mx-auto mb-3" />
                      <p className="text-[#2c2825] font-medium mb-1">No recommendations yet</p>
                      <p className="text-[#8c8580] text-sm">Add homes that match this buyer&apos;s profile.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tab: Email Templates */}
            {tab === "email" && <EmailTemplates lead={lead} />}

            {/* Tab: Mortgage Checklist */}
            {tab === "checklist" && (
              <MortgageChecklist
                items={answers.mortgageChecklist || []}
                onChange={updateChecklist}
              />
            )}
          </div>

          {/* ── Right: status, notes, reminders ──────────────────────────── */}
          <div className="space-y-5">
            {/* Status */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
              <p className="text-[#2c2825] font-semibold mb-4">Pipeline Stage</p>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all ${
                      lead.status === s
                        ? "bg-[#2c2825] text-white border-[#2c2825]"
                        : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Link
                href="/pipeline"
                className="flex items-center gap-1 text-xs text-[#8c8580] hover:text-[#2c2825] mt-4 transition-colors"
              >
                <ExternalLink size={11} /> View in pipeline board
              </Link>
            </div>

            {/* Follow-up reminders */}
            <FollowUpReminders reminders={lead.reminders} onChange={updateReminders} />

            {/* Realtor private notes */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
              <p className="text-[#2c2825] font-semibold mb-4">Private Notes</p>
              {lead.realtorNotes.length > 0 && (
                <div className="space-y-3 mb-4">
                  {lead.realtorNotes.map((note) => (
                    <div key={note.id} className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl p-3.5 group">
                      <p className="text-[#2c2825] text-sm leading-relaxed mb-2">{note.text}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-[#8c8580] text-xs">{formatDate(note.createdAt)}</p>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-[#8c8580] hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
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
                className="w-full border border-[#e8e4de] rounded-xl px-3.5 py-3 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7] resize-none mb-3"
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="w-full bg-[#2c2825] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#1a1714] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>

            {/* Contact */}
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
              <p className="text-[#2c2825] font-semibold mb-4">Contact</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[#8c8580] text-xs mb-0.5">Email</p>
                  <p className="text-[#2c2825] text-sm">{answers.email}</p>
                </div>
                <div>
                  <p className="text-[#8c8580] text-xs mb-0.5">Phone</p>
                  <p className="text-[#2c2825] text-sm">{answers.phone}</p>
                </div>
              </div>
            </div>
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
      <p className="text-[#2c2825] text-sm font-medium">{value || "—"}</p>
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
