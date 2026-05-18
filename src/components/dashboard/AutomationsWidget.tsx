"use client";

import { useEffect, useState } from "react";
import { Lead } from "@/types";
import { Zap, Mail, CheckCircle2, ChevronDown, Eye, Send, Flame } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type AutomationType = "day1" | "day3" | "day7";

interface AutomationLog {
  id: string;
  lead_id: string;
  automation_type: AutomationType;
  sent_at: string;
  subject: string;
}

interface QueueItem {
  lead: Lead;
  name: string;
  type: AutomationType;
  dayLabel: string;
  description: string;
  tagBg: string;
  tagColor: string;
}

// ─── Template preview data ────────────────────────────────────────────────────

interface TemplateInfo {
  type: AutomationType;
  day: string;
  trigger: string;
  subject: string;
  body: string;
  tagBg: string;
  tagColor: string;
  color: string;
}

const TEMPLATES: TemplateInfo[] = [
  {
    type: "day1",
    day: "Day 1",
    trigger: "Sent to buyer as soon as you click Send",
    subject: "Your home search is officially on 🏡",
    body: `Hi [First name],

Thanks for submitting your profile — I've received everything and I'm already reviewing your search criteria. Here's what I have on file for you:

  Looking in      [City]
  Property type   [Type]
  Budget          $X to $Y
  Timeline        [Timeline]

I'll be reaching out shortly to introduce myself and chat through next steps. In the meantime, feel free to reply to this email with any questions.

Talk soon,
[Your name]`,
    tagBg: "#dcfce7",
    tagColor: "#166534",
    color: "#059669",
  },
  {
    type: "day3",
    day: "Day 3",
    trigger: "Appears in queue 3 days after lead submits (if uncontacted)",
    subject: "Just checking in on your search 👋",
    body: `Hi [First name],

I wanted to check in and see how you're feeling about your home search in [City]. Do you have any questions since submitting your profile?

Whether you're ready to start viewing properties or just want to talk through your options, I'm here. No rush — just want to make sure you feel supported every step of the way.

Looking forward to connecting,
[Your name]`,
    tagBg: "#fef3c7",
    tagColor: "#92400e",
    color: "#d97706",
  },
  {
    type: "day7",
    day: "Day 7",
    trigger: "Appears in queue 7 days after lead submits (if still uncontacted)",
    subject: "Still thinking about buying in [City]?",
    body: `Hi [First name],

It's been a little while since you submitted your profile and I want to make sure you're getting the support you need.

The market in [City] moves quickly — but that doesn't mean you have to rush. Even a quick 15-minute call can help clarify what's out there and what fits your situation best.

Feel free to reply here or give me a call whenever works for you. I'm happy to go at whatever pace feels right.

Here whenever you're ready,
[Your name]`,
    tagBg: "#ede9fe",
    tagColor: "#4c1d95",
    color: "#7c3aed",
  },
  {
    type: "day1", // reuse type slot — inactivity is realtor-only
    day: "Realtor alert",
    trigger: "Auto-sent to you when a Hot/Warm lead has no contact for 5+ days",
    subject: "🔥 Inactivity alert: [Name] ([X] days no contact)",
    body: `Hi [Realtor],

Your Hot lead [Name] ([Property type] in [City]) hasn't had any recorded contact in [X] days.

Hot and warm leads cool fast. A quick personal check-in keeps the relationship warm and shows you're the proactive agent they want in their corner.

→ View [Name]'s Profile`,
    tagBg: "#ffedd5",
    tagColor: "#9a3412",
    color: "#ea580c",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

const DAY_CONFIG: Record<AutomationType, { label: string; desc: string; tagBg: string; tagColor: string }> = {
  day1: { label: "Day 1",  desc: "Welcome email",  tagBg: "#dcfce7", tagColor: "#166534" },
  day3: { label: "Day 3",  desc: "Check-in email", tagBg: "#fef3c7", tagColor: "#92400e" },
  day7: { label: "Day 7",  desc: "Follow-up email", tagBg: "#ede9fe", tagColor: "#4c1d95" },
};

function buildQueue(leads: Lead[], logs: AutomationLog[]): QueueItem[] {
  const items: QueueItem[] = [];
  for (const lead of leads) {
    const sentTypes = new Set(logs.filter((l) => l.lead_id === lead.id).map((l) => l.automation_type));
    const age = daysSince(lead.submittedAt);
    const name = `${lead.answers.firstName ?? ""} ${lead.answers.lastName ?? ""}`.trim() || "Unnamed buyer";
    const isActive = ["New Lead", "Qualified", "Showing Booked"].includes(lead.status);
    if (!isActive) continue;

    let type: AutomationType | null = null;
    if (!sentTypes.has("day1")) {
      type = "day1";
    } else if (!sentTypes.has("day3") && age >= 3 && ["New Lead", "Qualified"].includes(lead.status)) {
      type = "day3";
    } else if (!sentTypes.has("day7") && age >= 7 && ["New Lead", "Qualified"].includes(lead.status)) {
      type = "day7";
    }

    if (type) {
      const cfg = DAY_CONFIG[type];
      items.push({ lead, name, type, dayLabel: cfg.label, description: cfg.desc, tagBg: cfg.tagBg, tagColor: cfg.tagColor });
    }
  }
  return items;
}

function buildMockQueue(leads: Lead[]): QueueItem[] {
  // Mock: lead-001 has day1+day3 sent, lead-002 has day1 sent, lead-003 nothing
  const mockLogs: AutomationLog[] = [
    { id: "m1", lead_id: "lead-001", automation_type: "day1", sent_at: new Date(Date.now() - 4 * 86400000).toISOString(), subject: "" },
    { id: "m2", lead_id: "lead-001", automation_type: "day3", sent_at: new Date(Date.now() - 1 * 86400000).toISOString(), subject: "" },
    { id: "m3", lead_id: "lead-002", automation_type: "day1", sent_at: new Date(Date.now() - 2 * 86400000).toISOString(), subject: "" },
  ];
  return buildQueue(leads, mockLogs);
}

// ─── Template preview card ────────────────────────────────────────────────────

function TemplateCard({ t }: { t: TemplateInfo }) {
  const [open, setOpen] = useState(false);
  const isRealtorAlert = t.day === "Realtor alert";

  return (
    <div style={{ border: "1px solid #e8e4de", borderRadius: "12px", overflow: "hidden", background: "#ffffff" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-[#faf9f7] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: t.tagBg, color: t.tagColor }}>
            {t.day}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#2c2825] truncate">{t.subject}</p>
            <p className="text-[10px] text-[#b8a88a] mt-0.5 leading-tight">{t.trigger}</p>
          </div>
        </div>
        <ChevronDown size={12} className="text-[#b8a88a] shrink-0 ml-2 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #f0ece6", background: "#f5f4f2", padding: "12px" }}>
          {/* Email mockup */}
          <div style={{ background: "#ffffff", borderRadius: "10px", border: "1px solid #e8e4de", overflow: "hidden" }}>
            <div style={{ background: "#2c2825", padding: "12px 14px 10px" }}>
              <p style={{ color: "#b8a88a", fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 2px" }}>HomeMatch</p>
              <p style={{ color: "#ffffff", fontSize: "12px", fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{t.subject}</p>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <p style={{ fontSize: "11px", color: "#5c5550", lineHeight: 1.75, whiteSpace: "pre-line", margin: 0, fontFamily: "Georgia, serif" }}>
                {t.body}
              </p>
            </div>
          </div>
          <p className="text-[10px] flex items-center gap-1 mt-2" style={{ color: "#8c8580" }}>
            <Send size={8} style={{ color: t.color }} />
            {isRealtorAlert ? "Sent automatically to you — not visible to buyer" : "Sent to your client · Personalised with their details"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Queue row ────────────────────────────────────────────────────────────────

function QueueRow({
  item,
  onSent,
}: {
  item: QueueItem;
  onSent: (leadId: string, type: AutomationType) => void;
}) {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scoreIcon =
    item.lead.score === "Hot" ? <Flame size={10} style={{ color: "#ef4444" }} /> :
    item.lead.score === "Warm" ? <Zap size={10} style={{ color: "#f97316" }} /> : null;

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/automations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: item.lead.id, type: item.type }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => onSent(item.lead.id, item.type), 800);
      } else {
        setError(data.error ?? "Send failed");
      }
    } catch {
      setError("Network error");
    }
    setSending(false);
  }

  if (done) {
    return (
      <div className="px-4 py-3 flex items-center gap-2">
        <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
        <span className="text-[11px] text-[#8c8580]">Sent to {item.name}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: item.tagBg, color: item.tagColor }}>
          {item.dayLabel}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            {scoreIcon}
            <Link href={`/dashboard/${item.lead.id}`} className="text-[11px] font-semibold text-[#2c2825] hover:underline truncate">
              {item.name}
            </Link>
          </div>
          <p className="text-[10px] text-[#8c8580] mt-0.5">{item.description}</p>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
          style={{ background: "#2c2825", color: "#ffffff" }}
        >
          <Send size={9} />
          {sending ? "Sending…" : "Send"}
        </button>
        {error && <p className="text-[9px]" style={{ color: "#ef4444" }}>{error}</p>}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AutomationsWidget({ leads }: { leads: Lead[] }) {
  const [logs, setLogs] = useState<AutomationLog[] | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  // Track items sent this session so they disappear immediately
  const [sentThisSession, setSentThisSession] = useState<Set<string>>(new Set());

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

  const activeLeads = leads.filter((l) => l.status !== "Closed");
  const isMockMode = !isLive && activeLeads.some((l) => l.id.startsWith("lead-"));

  const allQueue: QueueItem[] = isMockMode
    ? buildMockQueue(activeLeads)
    : logs !== null
    ? buildQueue(activeLeads, logs)
    : [];

  // Filter out anything sent this session
  const queue = allQueue.filter((item) => !sentThisSession.has(`${item.lead.id}:${item.type}`));

  function handleSent(leadId: string, type: AutomationType) {
    setSentThisSession((prev) => new Set([...prev, `${leadId}:${type}`]));
  }

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
            <p className="text-[10px] text-[#8c8580]">Client email sequences</p>
          </div>
        </div>
        {logs !== null && (
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={queue.length > 0
              ? { background: "#fef3c7", color: "#92400e" }
              : { background: "#f0fdf4", color: "#166534" }}
          >
            {queue.length > 0 ? `${queue.length} queued` : "All sent"}
          </span>
        )}
      </div>

      {/* Queue */}
      <div className="divide-y divide-[#f5f3f0]">
        {logs === null ? (
          <div className="px-4 py-6 flex justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#e8e4de] border-t-[#b8a88a] animate-spin" />
          </div>
        ) : queue.length === 0 ? (
          <div className="px-4 py-5 flex items-center gap-2.5">
            <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
            <div>
              <p className="text-[11px] font-semibold text-[#2c2825]">All caught up</p>
              <p className="text-[10px] text-[#8c8580]">No emails queued right now</p>
            </div>
          </div>
        ) : (
          queue.map((item) => (
            <QueueRow key={`${item.lead.id}:${item.type}`} item={item} onSent={handleSent} />
          ))
        )}
      </div>

      {/* Templates section */}
      <div className="border-t border-[#f0ece6]">
        <button
          onClick={() => setShowTemplates((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#faf9f7] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-[#b8a88a]" />
            <span className="text-[11px] font-semibold text-[#2c2825]">View email templates</span>
            <span className="text-[10px] text-[#b8a88a]">· 4 emails</span>
          </div>
          <ChevronDown size={12} className="text-[#b8a88a] transition-transform" style={{ transform: showTemplates ? "rotate(180deg)" : "none" }} />
        </button>

        {showTemplates && (
          <div className="px-3 pb-3 pt-2 space-y-2 border-t border-[#f0ece6]" style={{ background: "#faf9f7" }}>
            <p className="text-[10px] text-[#8c8580] leading-relaxed px-1 mb-2">
              Day 1 / 3 / 7 emails go to your <strong>client</strong>. The inactivity alert comes to <strong>you</strong>.
            </p>
            {TEMPLATES.map((t, i) => <TemplateCard key={i} t={t} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      {isMockMode && (
        <div className="px-4 py-2.5 border-t border-[#f0ece6]" style={{ background: "#fafaf9" }}>
          <p className="text-[10px] text-[#b8a88a] text-center">
            Preview mode · Send buttons active once real leads submit
          </p>
        </div>
      )}
    </div>
  );
}
