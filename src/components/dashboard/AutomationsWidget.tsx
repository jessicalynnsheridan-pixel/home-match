"use client";

import { useEffect, useState } from "react";
import { Lead } from "@/types";
import { Zap, Mail, AlertCircle, CheckCircle2, Clock, ChevronRight, Flame } from "lucide-react";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function relativeTime(dateStr: string) {
  const d = daysSince(dateStr);
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  return `${Math.floor(d)}d ago`;
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
  const sentTypes = logs
    .filter((l) => l.lead_id === lead.id)
    .map((l) => l.automation_type);

  const isActive = ["New Lead", "Qualified", "Showing Booked"].includes(lead.status);

  // Calculate next step
  let next: SequenceStatus["next"] = null;
  if (isActive) {
    if (!sentTypes.includes("day1")) {
      next = { type: "day1", label: "Day 1 intro email", dueIn: "Now", overdue: ageDays > 1.5 };
    } else if (!sentTypes.includes("day3") && ["New Lead", "Qualified"].includes(lead.status)) {
      const dueAt = 3 - ageDays;
      next = {
        type: "day3",
        label: "Day 3 follow-up",
        dueIn: dueAt > 0 ? `in ${Math.ceil(dueAt)}d` : "Overdue",
        overdue: dueAt <= 0,
      };
    } else if (!sentTypes.includes("day7") && ["New Lead", "Qualified"].includes(lead.status)) {
      const dueAt = 7 - ageDays;
      next = {
        type: "day7",
        label: "Day 7 final nudge",
        dueIn: dueAt > 0 ? `in ${Math.ceil(dueAt)}d` : "Overdue",
        overdue: dueAt <= 0,
      };
    }
  }

  // Inactivity alert check (Hot/Warm, 5+ days idle)
  const inactivityLogs = logs.filter((l) => l.lead_id === lead.id && l.automation_type === "inactivity");
  const lastInactivity = inactivityLogs[0]?.sent_at;
  const daysSinceInactivity = lastInactivity ? daysSince(lastInactivity) : Infinity;
  const inactivityAlert =
    (lead.score === "Hot" || lead.score === "Warm") &&
    ageDays >= 5 &&
    isActive &&
    daysSinceInactivity >= 7;

  return {
    lead,
    name,
    ageDays,
    score: lead.score,
    status: lead.status,
    sent: sentTypes,
    next,
    inactivityAlert,
    inactivityDays: Math.floor(ageDays),
  };
}

// ─── Mock data (shown when no real Supabase logs exist) ───────────────────────

function buildMockStatuses(leads: Lead[]): SequenceStatus[] {
  // Simulate realistic automation states for the 3 mock leads
  const mockLogs: AutomationLog[] = [
    { id: "ml1", lead_id: "lead-001", automation_type: "day1", sent_at: new Date(Date.now() - 4 * 86400000).toISOString(), subject: "New buyer" },
    { id: "ml2", lead_id: "lead-001", automation_type: "day3", sent_at: new Date(Date.now() - 1 * 86400000).toISOString(), subject: "Follow up" },
    { id: "ml3", lead_id: "lead-002", automation_type: "day1", sent_at: new Date(Date.now() - 0.5 * 86400000).toISOString(), subject: "New buyer" },
  ];
  return leads.map((l) => buildSequenceStatus(l, mockLogs));
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SequenceRow({ s }: { s: SequenceStatus }) {
  const scoreIcon = s.score === "Hot"
    ? <Flame size={10} style={{ color: "#ef4444" }} />
    : s.score === "Warm"
    ? <Zap size={10} style={{ color: "#f97316" }} />
    : null;

  return (
    <Link href={`/dashboard/${s.lead.id}`} className="block group">
      <div className="px-4 py-3 hover:bg-[#faf9f7] transition-colors rounded-xl">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {scoreIcon}
            <span className="text-xs font-semibold text-[#2c2825]">{s.name}</span>
          </div>
          <ChevronRight size={12} className="text-[#c4bfb9] group-hover:text-[#8c8580] transition-colors" />
        </div>

        {/* Sent pills */}
        {s.sent.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {s.sent.map((type) => (
              <span key={type} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0ece6] text-[#8c8580]">
                <CheckCircle2 size={9} style={{ color: TYPE_COLOR[type] }} />
                {TYPE_LABELS[type]}
              </span>
            ))}
          </div>
        )}

        {/* Next step */}
        {s.next && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={10} style={{ color: s.next.overdue ? "#ef4444" : "#f97316" }} />
            <span className="text-[11px]" style={{ color: s.next.overdue ? "#ef4444" : "#f97316" }}>
              {s.next.label} · {s.next.dueIn}
            </span>
          </div>
        )}

        {/* Inactivity alert */}
        {s.inactivityAlert && (
          <div className="flex items-center gap-1.5 mt-1">
            <AlertCircle size={10} style={{ color: "#ef4444" }} />
            <span className="text-[11px] font-medium" style={{ color: "#ef4444" }}>
              {s.inactivityDays} days with no contact — alert queued
            </span>
          </div>
        )}

        {/* Fully done */}
        {!s.next && !s.inactivityAlert && s.sent.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
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
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetch("/api/automations/status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.logs)) setLogs(data.logs);
        else setUseMock(true);
      })
      .catch(() => setUseMock(true));
  }, []);

  const activeLeads = leads.filter((l) => l.status !== "Closed");

  let statuses: SequenceStatus[];
  if (useMock || (logs !== null && logs.length === 0 && activeLeads.some((l) => l.id.startsWith("lead-")))) {
    statuses = buildMockStatuses(activeLeads);
  } else if (logs !== null) {
    statuses = activeLeads.map((l) => buildSequenceStatus(l, logs));
  } else {
    statuses = []; // loading
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
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0fdf4] text-emerald-700">
            {active} active
          </span>
        </div>
      </div>

      {/* Sequence list */}
      <div className="divide-y divide-[#f5f3f0]">
        {logs === null && !useMock ? (
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#f0ece6]" style={{ background: "#fafaf9" }}>
        <p className="text-[10px] text-[#b8a88a] text-center">
          Emails send automatically · Day 1, Day 3, Day 7 · Inactivity at 5 days
        </p>
      </div>
    </div>
  );
}
