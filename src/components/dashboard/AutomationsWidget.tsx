"use client";

import { useEffect, useState } from "react";
import { Lead } from "@/types";
import { Zap, Mail, AlertCircle, CheckCircle2, Clock, ChevronRight, Flame, ChevronDown, Eye, Send } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type AutomationType = "day1" | "day3" | "day7" | "inactivity";

interface AutomationLog {
  id: string;
  lead_id: string;
  automation_type: AutomationType;
  sent_at: string;
  subject: string;
}

interface SequenceStatus {
  lead: Lead;
  name: string;
  ageDays: number;
  score: string;
  status: string;
  sent: AutomationType[];
  next: { type: AutomationType; label: string; dueIn: string; overdue: boolean } | null;
  inactivityAlert: boolean;
  inactivityDays: number;
}

// ─── Template definitions ─────────────────────────────────────────────────────

interface TemplateStep {
  type: AutomationType;
  day: string;
  trigger: string;
  subject: string;
  preview: string;
  body: string;
  color: string;
  bg: string;
  border: string;
  tagBg: string;
  tagColor: string;
}

const SEQUENCE_TEMPLATES: TemplateStep[] = [
  {
    type: "day1",
    day: "Day 1",
    trigger: "Sent within 36hrs of a new lead submitting",
    subject: "New buyer: [Name] just submitted their profile",
    preview: "A new buyer just submitted their profile. Here's a quick snapshot — reach out within the first hour for the best response rate.",
    body: `Hi [Realtor],

A new buyer just submitted their profile. Here's a quick snapshot:

Buyer: [First Last] · [email]
Looking for: [Property type] in [City]
Budget: $X to $Y
Timeline: [Timeline]

💡 Best practice: Reach out within the first hour — response rates drop significantly after 24 hrs.

→ View [Name]'s Profile`,
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    tagBg: "#dcfce7",
    tagColor: "#166534",
  },
  {
    type: "day3",
    day: "Day 3",
    trigger: "Sent if lead is still New Lead or Qualified after 3 days",
    subject: "⏰ Follow up with [Name] — 3 days since they submitted",
    preview: "Buyers who don't hear back within 3 days often move on to another agent. A quick email or call today keeps you top of mind.",
    body: `Hi [Realtor],

[Name] submitted 3 days ago — have you connected yet?

They're still at [status]. Buyers who don't hear back within 3 days often move on to another agent.

A quick email or call today keeps you top of mind. We've already drafted a template for you:

→ Open Outreach Templates`,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    tagBg: "#fef3c7",
    tagColor: "#92400e",
  },
  {
    type: "day7",
    day: "Day 7",
    trigger: "Sent if lead is still stalled after 7 days — final nudge",
    subject: "🚨 [Name] — 7 days with no progress",
    preview: "It's been a week. At this stage, buyers have almost certainly spoken to other agents. One genuine outreach today could still turn this around.",
    body: `Hi [Realtor],

It's been 7 days since [Name] submitted their profile and they're still at [status].

At this stage, buyers have almost certainly spoken to other agents.

One genuine, personalised outreach today could still turn this around. We've got their full profile and conversation starters ready.

→ Re-engage [Name] Now`,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    tagBg: "#fee2e2",
    tagColor: "#991b1b",
  },
  {
    type: "inactivity",
    day: "5-Day Alert",
    trigger: "Sent when a Hot or Warm lead has had no recorded contact for 5+ days",
    subject: "🔥 Inactivity alert: [Name] ([X] days)",
    preview: "Hot and warm leads cool fast. A quick check-in keeps the relationship alive and signals you're the proactive agent they want representing them.",
    body: `Hi [Realtor],

Your Hot/Warm lead [Name] ([Property type] in [City]) hasn't had any recorded contact in [X] days.

Hot and warm leads cool fast. A quick check-in keeps the relationship alive and signals you're the proactive agent they want representing them.

→ View [Name]'s Profile`,
    color: "#ea580c",
    bg: "#fff7ed",
    border: "#fed7aa",
    tagBg: "#ffedd5",
    tagColor: "#9a3412",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

const TYPE_LABELS: Record<AutomationType, string> = {
  day1: "Day 1 intro",
  day3: "Day 3 follow-up",
  day7: "Day 7 nudge",
  inactivity: "Inactivity alert",
};

const TYPE_COLOR: Record<AutomationType, string> = {
  day1:       "#22c55e",
  day3:       "#f97316",
  day7:       "#ef4444",
  inactivity: "#f97316",
};

function buildSequenceStatus(lead: Lead, logs: AutomationLog[]): SequenceStatus {
  const name = `${lead.answers.firstName} ${lead.answers.lastName}`.trim();
  const ageDays = daysSince(lead.submittedAt);
  const sentTypes = logs.filter((l) => l.lead_id === lead.id).map((l) => l.automation_type);
  const isActive = ["New Lead", "Qualified", "Showing Booked"].includes(lead.status);

  let next: SequenceStatus["next"] = null;
  if (isActive) {
    if (!sentTypes.includes("day1")) {
      next = { type: "day1", label: "Day 1 intro email", dueIn: "Now", overdue: ageDays > 1.5 };
    } else if (!sentTypes.includes("day3") && ["New Lead", "Qualified"].includes(lead.status)) {
      const dueAt = 3 - ageDays;
      next = { type: "day3", label: "Day 3 follow-up", dueIn: dueAt > 0 ? `in ${Math.ceil(dueAt)}d` : "Overdue", overdue: dueAt <= 0 };
    } else if (!sentTypes.includes("day7") && ["New Lead", "Qualified"].includes(lead.status)) {
      const dueAt = 7 - ageDays;
      next = { type: "day7", label: "Day 7 final nudge", dueIn: dueAt > 0 ? `in ${Math.ceil(dueAt)}d` : "Overdue", overdue: dueAt <= 0 };
    }
  }

  const inactivityLogs = logs.filter((l) => l.lead_id === lead.id && l.automation_type === "inactivity");
  const lastInactivity = inactivityLogs[0]?.sent_at;
  const daysSinceInactivity = lastInactivity ? daysSince(lastInactivity) : Infinity;
  const inactivityAlert =
    (lead.score === "Hot" || lead.score === "Warm") && ageDays >= 5 && isActive && daysSinceInactivity >= 7;

  return { lead, name, ageDays, score: lead.score, status: lead.status, sent: sentTypes, next, inactivityAlert, inactivityDays: Math.floor(ageDays) };
}

function buildMockStatuses(leads: Lead[]): SequenceStatus[] {
  const mockLogs: AutomationLog[] = [
    { id: "ml1", lead_id: "lead-001", automation_type: "day1", sent_at: new Date(Date.now() - 4 * 86400000).toISOString(), subject: "" },
    { id: "ml2", lead_id: "lead-001", automation_type: "day3", sent_at: new Date(Date.now() - 1 * 86400000).toISOString(), subject: "" },
    { id: "ml3", lead_id: "lead-002", automation_type: "day1", sent_at: new Date(Date.now() - 0.5 * 86400000).toISOString(), subject: "" },
  ];
  return leads.map((l) => buildSequenceStatus(l, mockLogs));
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ t, defaultOpen }: { t: TemplateStep; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: "14px", overflow: "hidden", background: t.bg }}>
      {/* Header row */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: t.tagBg, color: t.tagColor }}>
            {t.day}
          </span>
          <div>
            <p className="text-xs font-semibold text-[#2c2825]">{t.subject.replace(/\[.*?\]/g, "[Buyer]")}</p>
            <p className="text-[10px] text-[#8c8580] mt-0.5">{t.trigger}</p>
          </div>
        </div>
        <ChevronDown size={13} className="text-[#b8a88a] shrink-0 ml-2 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: `1px solid ${t.border}` }} className="px-4 py-3">
          <div className="bg-white rounded-xl px-4 py-3 mb-3" style={{ border: `1px solid ${t.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: t.color }}>
              Email Preview
            </p>
            <pre className="text-[11px] text-[#5c5550] leading-relaxed whitespace-pre-wrap font-sans">
              {t.body}
            </pre>
          </div>
          <p className="text-[10px] text-[#8c8580] flex items-center gap-1">
            <Send size={9} />
            Sent automatically to you · Personalised with buyer details
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Sequence row ─────────────────────────────────────────────────────────────

function SequenceRow({ s }: { s: SequenceStatus }) {
  const scoreIcon = s.score === "Hot"
    ? <Flame size={10} style={{ color: "#ef4444" }} />
    : s.score === "Warm"
    ? <Zap size={10} style={{ color: "#f97316" }} />
    : null;

  return (
    <Link href={`/dashboard/${s.lead.id}`} className="block group">
      <div className="px-4 py-3 hover:bg-[#faf9f7] transition-colors rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            {scoreIcon}
            <span className="text-xs font-semibold text-[#2c2825]">{s.name}</span>
          </div>
          <ChevronRight size={12} className="text-[#c4bfb9] group-hover:text-[#8c8580] transition-colors" />
        </div>
        {s.sent.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {s.sent.map((type) => (
              <span key={type} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0ece6] text-[#8c8580]">
                <CheckCircle2 size={9} style={{ color: TYPE_COLOR[type] }} />
                {TYPE_LABELS[type]}
              </span>
            ))}
          </div>
        )}
        {s.next && (
          <div className="flex items-center gap-1.5">
            <Clock size={10} style={{ color: s.next.overdue ? "#ef4444" : "#f97316" }} />
            <span className="text-[11px]" style={{ color: s.next.overdue ? "#ef4444" : "#f97316" }}>
              {s.next.label} · {s.next.dueIn}
            </span>
          </div>
        )}
        {s.inactivityAlert && (
          <div className="flex items-center gap-1.5">
            <AlertCircle size={10} style={{ color: "#ef4444" }} />
            <span className="text-[11px] font-medium" style={{ color: "#ef4444" }}>
              {s.inactivityDays} days no contact — alert queued
            </span>
          </div>
        )}
        {!s.next && !s.inactivityAlert && s.sent.length > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={10} style={{ color: "#22c55e" }} />
            <span className="text-[11px] text-[#8c8580]">Sequence complete</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AutomationsWidget({ leads }: { leads: Lead[] }) {
  const [logs, setLogs] = useState<AutomationLog[] | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/automations/status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
          setIsLive(true);
        } else {
          setLogs([]);
          setIsLive(false);
        }
      })
      .catch(() => { setLogs([]); setIsLive(false); });
  }, []);

  async function runNow() {
    setTestRunning(true);
    setTestResult(null);
    try {
      const r = await fetch("/api/automations/cron?secret=homematch2026");
      const d = await r.json();
      if (d.sent !== undefined) {
        setTestResult(`✓ Ran — ${d.sent} email${d.sent !== 1 ? "s" : ""} sent for ${d.leadsChecked} leads`);
      } else if (d.skipped) {
        setTestResult(`ℹ ${d.skipped}`);
      } else {
        setTestResult(`⚠ ${d.error ?? "Unknown response"}`);
      }
    } catch {
      setTestResult("⚠ Could not reach cron endpoint");
    }
    setTestRunning(false);
  }

  const activeLeads = leads.filter((l) => l.status !== "Closed");

  const isMockMode = !isLive && activeLeads.some((l) => l.id.startsWith("lead-"));

  let statuses: SequenceStatus[];
  if (isMockMode) {
    statuses = buildMockStatuses(activeLeads);
  } else if (logs !== null) {
    statuses = activeLeads.map((l) => buildSequenceStatus(l, logs));
  } else {
    statuses = [];
  }

  const alerts = statuses.filter((s) => s.inactivityAlert || s.next?.overdue).length;
  const active = statuses.filter((s) => s.next || s.inactivityAlert).length;

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#f0ece6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#fef3c7" }}>
            <Zap size={13} style={{ color: "#d97706" }} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2c2825]">Automations</p>
            <p className="text-[10px] text-[#8c8580]">Follow-up sequences · Inactivity alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alerts > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef2f2", color: "#dc2626" }}>
              {alerts} alert{alerts !== 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#166534" }}>
            {active} active
          </span>
        </div>
      </div>

      {/* Sequence status list */}
      <div className="divide-y divide-[#f5f3f0]">
        {logs === null ? (
          <div className="px-4 py-6 text-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#e8e4de] border-t-[#b8a88a] animate-spin mx-auto" />
          </div>
        ) : statuses.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <Mail size={20} className="text-[#e8e4de] mx-auto mb-2" />
            <p className="text-xs text-[#8c8580]">No active leads to track</p>
          </div>
        ) : (
          statuses.map((s) => <SequenceRow key={s.lead.id} s={s} />)
        )}
      </div>

      {/* ── Email Templates section ─────────────────────────────────────────── */}
      <div className="border-t border-[#f0ece6]">
        <button
          onClick={() => setShowTemplates((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#faf9f7] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye size={13} className="text-[#b8a88a]" />
            <span className="text-xs font-semibold text-[#2c2825]">View email templates</span>
            <span className="text-[10px] text-[#b8a88a]">· 4 automated emails</span>
          </div>
          <ChevronDown size={13} className="text-[#b8a88a] transition-transform" style={{ transform: showTemplates ? "rotate(180deg)" : "none" }} />
        </button>

        {showTemplates && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-[#f0ece6] pt-3" style={{ background: "#faf9f7" }}>
            <p className="text-[10px] text-[#8c8580] mb-3 leading-relaxed">
              These emails are sent automatically to <strong>you</strong> — personalised with each buyer&apos;s name, property type, city, and budget. No action needed, they run in the background.
            </p>
            {SEQUENCE_TEMPLATES.map((t) => (
              <TemplateCard key={t.type} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#f0ece6] space-y-2" style={{ background: "#fafaf9" }}>
        {/* Mock mode notice */}
        {isMockMode && (
          <p className="text-[10px] text-[#b8a88a] text-center">
            Showing preview data · Sequence tracking starts once real leads submit
          </p>
        )}

        {/* Manual test trigger */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-[#b8a88a]">Runs daily at 8am automatically</p>
          <button
            onClick={runNow}
            disabled={testRunning}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50"
            style={{ borderColor: "#e8e4de", color: "#2c2825", background: "white" }}
          >
            {testRunning ? "Running…" : "Test run"}
          </button>
        </div>

        {testResult && (
          <p className="text-[10px] font-medium text-center" style={{ color: testResult.startsWith("✓") ? "#059669" : "#d97706" }}>
            {testResult}
          </p>
        )}
      </div>
    </div>
  );
}
