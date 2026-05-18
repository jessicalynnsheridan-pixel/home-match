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
    trigger: "Sent to buyer within 36hrs of submitting their profile",
    subject: "Your home search is officially on 🏡",
    preview: "Hi [First name], thanks for submitting your profile — I've received everything and I'm already reviewing your search criteria.",
    body: `Hi [First name],

Thanks for submitting your profile — I've received everything and I'm already reviewing your search criteria. Here's what I have on file for you:

  Looking in      [City]
  Property type   [Type]
  Budget          $X to $Y
  Timeline        [Timeline]

I'll be reaching out shortly to introduce myself and chat through next steps. In the meantime, feel free to reply to this email with any questions.

Talk soon,
[Realtor name]`,
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    tagBg: "#dcfce7",
    tagColor: "#166534",
  },
  {
    type: "day3",
    day: "Day 3",
    trigger: "Sent to buyer if still uncontacted after 3 days",
    subject: "Just checking in on your search 👋",
    preview: "Hi [First name], wanted to check in and see how you're feeling about your home search. Do you have any questions since submitting your profile?",
    body: `Hi [First name],

I wanted to check in and see how you're feeling about your home search in [City]. Do you have any questions since submitting your profile?

Whether you're ready to start viewing properties or just want to talk through your options, I'm here. No rush — just want to make sure you feel supported every step of the way.

Looking forward to connecting,
[Realtor name]`,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    tagBg: "#fef3c7",
    tagColor: "#92400e",
  },
  {
    type: "day7",
    day: "Day 7",
    trigger: "Sent to buyer if still uncontacted after 7 days — gentle nudge",
    subject: "Still thinking about buying in [City]?",
    preview: "Hi [First name], it's been a little while since you submitted your profile and I want to make sure you're getting the support you need.",
    body: `Hi [First name],

It's been a little while since you submitted your profile and I want to make sure you're getting the support you need.

The market in [City] moves quickly — but that doesn't mean you have to rush. Even a quick 15-minute call can help clarify what's out there and what fits your situation best.

Feel free to reply here or give me a call whenever works for you. I'm happy to go at whatever pace feels right.

Here whenever you're ready,
[Realtor name]`,
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#ddd6fe",
    tagBg: "#ede9fe",
    tagColor: "#4c1d95",
  },
  {
    type: "inactivity",
    day: "Realtor alert",
    trigger: "Sent to you when a Hot or Warm lead has had no contact for 5+ days",
    subject: "🔥 Inactivity alert: [Name] ([X] days no contact)",
    preview: "Your Hot/Warm lead [Name] hasn't had any recorded contact in [X] days. Hot leads cool fast — a quick check-in keeps the relationship alive.",
    body: `Hi [Realtor],

Your Hot lead [Name] ([Property type] in [City]) hasn't had any recorded contact in [X] days.

Hot and warm leads cool fast. A quick personal check-in keeps the relationship warm and shows you're the proactive agent they want in their corner.

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

function TemplateCard({ t }: { t: TemplateStep }) {
  const [open, setOpen] = useState(false);
  const isRealtorAlert = t.type === "inactivity";

  return (
    <div style={{ border: "1px solid #e8e4de", borderRadius: "14px", overflow: "hidden", background: "#ffffff" }}>
      {/* Header row */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#faf9f7] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: t.tagBg, color: t.tagColor }}
          >
            {t.day}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#2c2825] truncate">{t.subject}</p>
            <p className="text-[10px] text-[#b8a88a] mt-0.5">{t.trigger}</p>
          </div>
        </div>
        <ChevronDown
          size={13}
          className="text-[#b8a88a] shrink-0 ml-2 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* Expanded — mini email mockup */}
      {open && (
        <div style={{ borderTop: "1px solid #f0ece6", background: "#f5f4f2", padding: "14px" }}>
          {/* Email chrome */}
          <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e8e4de", overflow: "hidden" }}>
            {/* Email header bar */}
            <div style={{ background: "#2c2825", padding: "14px 16px 12px" }}>
              <p style={{ color: "#b8a88a", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 3px" }}>
                HomeMatch
              </p>
              <p style={{ color: "#ffffff", fontSize: "13px", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                {t.subject}
              </p>
            </div>
            {/* Email body */}
            <div style={{ padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", color: "#5c5550", lineHeight: 1.7, whiteSpace: "pre-line", margin: "0 0 12px", fontFamily: "Georgia, serif" }}>
                {t.body}
              </p>
            </div>
          </div>
          {/* Sent-to label */}
          <p className="text-[10px] flex items-center gap-1 mt-2" style={{ color: "#8c8580" }}>
            <Send size={9} style={{ color: t.color }} />
            {isRealtorAlert
              ? "Sent to you (the realtor) — CRM nudge, not visible to buyer"
              : "Sent directly to your client — personalised with their name, city, and budget"}
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
              Day 1, 3, and 7 emails go directly to <strong>your client</strong> — personalised with their name, city, and budget. The inactivity alert goes to <strong>you</strong> as a CRM nudge. All run automatically in the background.
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
