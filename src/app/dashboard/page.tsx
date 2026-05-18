"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockLeads } from "@/data/mockLeads";
import LeadCard from "@/components/dashboard/LeadCard";
import { Lead, LeadScore, LeadStatus } from "@/types";
import { Download, Flame, Zap, Eye, AlertCircle, Copy, Check, Link2, Phone, Mail, ChevronRight, Star, Users, TrendingUp, ChevronDown, CheckCircle2, ExternalLink, Sparkles, Calendar, Clock, MapPin, Bell, DollarSign, CalendarDays, X, MessageSquare, ShieldAlert, Activity, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const SCORE_FILTERS: (LeadScore | "All")[] = ["All", "Hot", "Warm", "Browsing"];
const STATUS_FILTERS: (LeadStatus | "All")[] = [
  "All", "New Lead", "Qualified", "Showing Booked", "Offer Stage", "Closed",
];

function exportLeads(leads: Lead[]) {
  const headers = ["Name","Email","Phone","Score","Status","Budget Min","Budget Max","Timeline","Location","Property Type","Pre-Approval","Submitted"].join(",");
  const rows = leads.map((l) =>
    [`"${l.answers.firstName} ${l.answers.lastName}"`, l.answers.email, l.answers.phone, l.score, l.status, l.answers.budgetMin, l.answers.budgetMax, l.answers.timeline, l.answers.preferredCity, l.answers.propertyType, l.answers.preApprovalStatus, l.submittedAt].join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "homematch-leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function mapSupabaseLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    score: (row.score as Lead["score"]) ?? "Browsing",
    matchScore: (row.match_score as number) ?? 0,
    status: (row.status as Lead["status"]) ?? "New Lead",
    isPriority: (row.is_priority as boolean) ?? false,
    submittedAt: row.submitted_at as string,
    realtorNotes: [],
    reminders: [],
    savedHomeIds: [],
    answers: row.answers as Lead["answers"],
  };
}

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}${name ? `, ${name}` : ""}`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
}

function quickGmailUrl(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function openGmailPopup(to: string, subject: string, body: string) {
  window.open(quickGmailUrl(to, subject, body), "gmail_compose", "width=960,height=720,left=200,top=100");
}

function quickSmsUrl(phone: string, body: string) {
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

type ActionItem = {
  id: string;
  priority: "urgent" | "high" | "medium";
  icon: "call" | "email" | "new" | "followup";
  label: string;
  sub: string;
  leadId: string;
  phone?: string;
  emailAddr?: string;
  lead: Lead;
};

function generateQuickMessage(item: ActionItem, lead: Lead, realtorName: string): string {
  const name = lead.answers.firstName;
  const city = lead.answers.preferredCity || "your area";
  const from = realtorName || "Your Name";

  if (item.icon === "call" || item.icon === "email") {
    const hook = lead.answers.sundayMorning
      ? `You mentioned ${lead.answers.sundayMorning.toLowerCase()} as your ideal Sunday`
      : lead.answers.homeFeeling?.[0]
      ? `You're looking for something ${lead.answers.homeFeeling[0].toLowerCase()}`
      : `You have a clear sense of what you want`;
    return `Hi ${name}, it's ${from} from HomeMatch. ${hook}. I have a couple of properties in ${city} that I think could be a real fit. Worth a quick 5-minute call this week?`;
  }
  if (item.icon === "new") {
    const propType = lead.answers.propertyType || "property";
    const timeline = lead.answers.timeline || "";
    return `New profile submitted: ${name} is looking for a ${propType} in ${city}. Budget and timeline look ${timeline === "ASAP" || timeline === "1–3 months" ? "urgent" : "solid"}. Open their profile to review and reach out.`;
  }
  return `Hi ${name}, it's ${from}. Just following up. Still keeping an eye out for ${city} properties that match what you described. Anything new on your end?`;
}

function buildActionQueue(leads: Lead[]): ActionItem[] {
  const items: ActionItem[] = [];
  for (const lead of leads) {
    const name = `${lead.answers.firstName} ${lead.answers.lastName}`;
    const isHot = lead.score === "Hot";
    const isWarm = lead.score === "Warm";
    const isNew = lead.status === "New Lead";
    const isASAP = lead.answers.timeline === "ASAP" || lead.answers.timeline === "1–3 months";
    const isFinanced = lead.answers.preApprovalStatus === "Yes, fully approved" || lead.answers.preApprovalStatus === "Paying cash";

    if (isHot && isASAP && isFinanced) {
      items.push({ id: `call-${lead.id}`, priority: "urgent", icon: "call", label: `Call ${name} now`, sub: "Hot · Pre-approved · ASAP, act now", leadId: lead.id, phone: lead.answers.phone, emailAddr: lead.answers.email, lead });
    } else if (isHot && isNew) {
      items.push({ id: `email-${lead.id}`, priority: "high", icon: "email", label: `Send first email to ${name}`, sub: "Hot lead · New, reach out within the hour", leadId: lead.id, emailAddr: lead.answers.email, lead });
    } else if (isNew) {
      items.push({ id: `new-${lead.id}`, priority: isWarm ? "high" : "medium", icon: "new", label: `New lead: ${name}`, sub: `${lead.score} · ${lead.answers.propertyType || "Buyer"} in ${lead.answers.preferredCity || "N/A"}`, leadId: lead.id, lead });
    } else if (isWarm) {
      items.push({ id: `followup-${lead.id}`, priority: "medium", icon: "followup", label: `Follow up with ${name}`, sub: `Warm · ${lead.status}, keep the momentum`, leadId: lead.id, emailAddr: lead.answers.email, lead });
    }
  }
  const order = { urgent: 0, high: 1, medium: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 5);
}

const PRIORITY_CONFIG = {
  urgent: {
    cardBg: "bg-rose-50/50",
    border: "border border-rose-100",
    leftBar: "bg-rose-400",
    badge: "bg-rose-100 text-rose-700 border border-rose-200",
    badgeLabel: "Urgent",
    iconBg: "bg-rose-100 text-rose-600",
    ctaBg: "bg-rose-500 hover:bg-rose-600 text-white",
    expandBg: "bg-rose-50/70",
  },
  high: {
    cardBg: "bg-amber-50/50",
    border: "border border-amber-100",
    leftBar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    badgeLabel: "Today",
    iconBg: "bg-amber-100 text-amber-600",
    ctaBg: "bg-amber-500 hover:bg-amber-600 text-white",
    expandBg: "bg-amber-50/70",
  },
  medium: {
    cardBg: "bg-sky-50/50",
    border: "border border-sky-100",
    leftBar: "bg-sky-400",
    badge: "bg-sky-100 text-sky-700 border border-sky-200",
    badgeLabel: "This week",
    iconBg: "bg-sky-100 text-sky-600",
    ctaBg: "bg-sky-600 hover:bg-sky-700 text-white",
    expandBg: "bg-sky-50/70",
  },
};

function ActionQueueItem({
  item,
  isChecked,
  isExpanded,
  realtorName,
  onToggleCheck,
  onToggleExpand,
}: {
  item: ActionItem;
  isChecked: boolean;
  isExpanded: boolean;
  realtorName: string;
  onToggleCheck: () => void;
  onToggleExpand: () => void;
}) {
  const s = PRIORITY_CONFIG[item.priority];
  const message = generateQuickMessage(item, item.lead, realtorName);
  const isEmailType = item.icon === "email" || (item.icon === "followup" && item.emailAddr);
  const gmailUrl = item.emailAddr
    ? quickGmailUrl(item.emailAddr, `Homes in ${item.lead.answers.preferredCity || "your area"} | HomeMatch`, message)
    : "";
  const smsUrl = item.phone ? quickSmsUrl(item.phone, message) : "";

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(message);
  }

  const initials = `${item.lead.answers.firstName?.[0] ?? ""}${item.lead.answers.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className={`rounded-2xl overflow-hidden transition-all ${s.border} ${isChecked ? "opacity-40 scale-[0.99]" : ""}`}>
      {/* Card row */}
      <div
        className={`${s.cardBg} cursor-pointer`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          {/* Colored left indicator */}
          <div className={`w-1 self-stretch rounded-full shrink-0 ${s.leftBar}`} />

          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.iconBg}`}>
            {initials || "?"}
          </div>

          {/* Text + mobile actions */}
          <div className="flex-1 min-w-0">
            {/* Top row: name + desktop CTAs + chevron */}
            <div className="flex items-center gap-2">
              <p className={`flex-1 text-sm font-semibold text-[#1a1714] truncate ${isChecked ? "line-through opacity-50" : ""}`}>
                {item.label}
              </p>

              {/* Badge — hidden on mobile, shown on sm+ */}
              <span className={`hidden sm:inline-flex shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                {s.badgeLabel}
              </span>

              {/* CTA buttons — hidden on mobile */}
              {item.icon === "call" && item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`hidden sm:flex items-center gap-1.5 shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Phone size={11} /> Call
                </a>
              )}
              {item.emailAddr && item.icon !== "call" && (
                <button
                  onClick={(e) => { e.stopPropagation(); openGmailPopup(item.emailAddr!, `Homes in ${item.lead.answers.preferredCity || "your area"} | HomeMatch`, message); }}
                  className={`hidden sm:flex items-center gap-1.5 shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Mail size={11} /> Email
                </button>
              )}

              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
                className="shrink-0 w-6 h-6 rounded-lg border-2 border-white/70 flex items-center justify-center hover:border-emerald-400 transition-colors bg-white/50"
                aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
              >
                {isChecked && <Check size={12} className="text-emerald-600" />}
              </button>

              <ChevronDown size={14} className={`shrink-0 text-[#9c9590] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>

            {/* Sub text */}
            <p className="text-xs text-[#6b6560] mt-0.5 truncate">{item.sub}</p>

            {/* Mobile-only bottom row: badge + CTA */}
            <div className="flex items-center gap-2 mt-2.5 sm:hidden">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                {s.badgeLabel}
              </span>
              {item.icon === "call" && item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Phone size={11} /> Call
                </a>
              )}
              {item.emailAddr && item.icon !== "call" && (
                <button
                  onClick={(e) => { e.stopPropagation(); openGmailPopup(item.emailAddr!, `Homes in ${item.lead.answers.preferredCity || "your area"} | HomeMatch`, message); }}
                  className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors ${s.ctaBg}`}
                >
                  <Mail size={11} /> Email
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded message panel */}
      {isExpanded && (
        <div className={`px-5 pb-4 pt-3 ${s.expandBg} border-t border-white/60`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6560] mb-2">Prepared message</p>
          <p className="text-xs text-[#3c3835] leading-relaxed bg-white/80 border border-white/60 rounded-xl px-3.5 py-3 mb-3 backdrop-blur-sm">
            {message}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e0dbd5] text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium"
            >
              <Copy size={11} /> Copy text
            </button>
            {isEmailType && item.emailAddr ? (
              <button
                onClick={(e) => { e.stopPropagation(); openGmailPopup(item.emailAddr!, `Homes in ${item.lead.answers.preferredCity || "your area"} | HomeMatch`, message); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e0dbd5] text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium">
                <ExternalLink size={11} /> Open in Gmail
              </button>
            ) : smsUrl ? (
              <a href={smsUrl}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-[#e0dbd5] text-[#5c5550] hover:border-[#2c2825] hover:text-[#2c2825] transition-colors font-medium">
                <ExternalLink size={11} /> Open in Messages
              </a>
            ) : null}
            <Link href={`/dashboard/${item.leadId}`}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-[#b8a88a] hover:text-[#8c6a3e] transition-colors font-medium ml-auto">
              Full profile <ChevronRight size={11} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Schedule Widget ─────────────────────────────────────────────────────────

type ScheduleEvent = {
  id: string;
  type: "showing" | "call" | "reminder" | "followup";
  label: string;
  sub: string;
  time?: string; // "10:00 AM"
  leadId?: string;
};

function getScheduleEvents(leads: Lead[]): ScheduleEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const events: ScheduleEvent[] = [];

  // Pull reminders from localStorage for all known leads
  if (typeof window !== "undefined") {
    leads.forEach((lead) => {
      try {
        const stored = localStorage.getItem(`hm_reminders_${lead.id}`);
        if (!stored) return;
        const reminders: { id: string; text: string; dueDate: string; completed: boolean }[] = JSON.parse(stored);
        reminders
          .filter((r) => !r.completed && r.dueDate)
          .forEach((r) => {
            const due = new Date(r.dueDate);
            due.setHours(0, 0, 0, 0);
            if (due.getTime() === today.getTime()) {
              events.push({
                id: r.id,
                type: "reminder",
                label: r.text,
                sub: `${lead.answers.firstName} ${lead.answers.lastName}`,
                leadId: lead.id,
              });
            }
          });
      } catch { /* ignore */ }
    });
  }

  // Leads with "Showing Booked" status → treat as a scheduled showing today (demo)
  leads
    .filter((l) => l.status === "Showing Booked")
    .forEach((lead, i) => {
      const times = ["9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"];
      events.push({
        id: `showing-${lead.id}`,
        type: "showing",
        label: `Showing — ${lead.answers.firstName} ${lead.answers.lastName}`,
        sub: lead.answers.preferredCity || "Location TBD",
        time: times[i % times.length],
        leadId: lead.id,
      });
    });

  // Hot leads that are "New Lead" → suggest a call today
  leads
    .filter((l) => l.score === "Hot" && l.status === "New Lead")
    .slice(0, 1)
    .forEach((lead) => {
      events.push({
        id: `call-${lead.id}`,
        type: "call",
        label: `Call ${lead.answers.firstName} ${lead.answers.lastName}`,
        sub: "Hot lead — reach out today",
        time: "ASAP",
        leadId: lead.id,
      });
    });

  return events;
}

const EVENT_CONFIG = {
  showing: { icon: MapPin,  bg: "bg-sky-50",    border: "border-sky-100",   dot: "bg-sky-400",    text: "text-sky-700"   },
  call:    { icon: Phone,   bg: "bg-rose-50",   border: "border-rose-100",  dot: "bg-rose-400",   text: "text-rose-700"  },
  reminder:{ icon: Bell,    bg: "bg-amber-50",  border: "border-amber-100", dot: "bg-amber-400",  text: "text-amber-700" },
  followup:{ icon: Mail,    bg: "bg-violet-50", border: "border-violet-100",dot: "bg-violet-400", text: "text-violet-700"},
};

function ScheduleWidget({ leads }: { leads: Lead[] }) {
  const events = getScheduleEvents(leads);

  // Mini week strip
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const weekDays = ["S","M","T","W","T","F","S"];
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    return d;
  });

  const timeLabel = today.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="bg-white border border-[#ece8e2] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#2c2825] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-[#b8a88a]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8a88a]">Today&apos;s Schedule</p>
        </div>
        <div className="flex items-center gap-1 text-white/40">
          <Clock size={10} />
          <span className="text-[10px]">{timeLabel}</span>
        </div>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 border-b border-[#f0ece6] bg-[#faf9f7]">
        {weekDates.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={i} className={`flex flex-col items-center py-2.5 ${isToday ? "bg-[#2c2825]" : ""}`}>
              <span className={`text-[9px] font-semibold uppercase ${isToday ? "text-[#b8a88a]" : "text-[#b8b4b0]"}`}>
                {weekDays[i]}
              </span>
              <span className={`text-xs font-bold mt-0.5 ${isToday ? "text-white" : "text-[#8c8580]"}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="p-3 space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-[#b8b4b0] text-xs">Nothing scheduled today.</p>
            <p className="text-[#c4bfb9] text-[10px] mt-0.5">Set reminders from any lead profile.</p>
          </div>
        ) : (
          events.map((event) => {
            const cfg = EVENT_CONFIG[event.type];
            const Icon = cfg.icon;
            return (
              <Link
                key={event.id}
                href={event.leadId ? `/dashboard/${event.leadId}` : "/dashboard"}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${cfg.bg} ${cfg.border} hover:opacity-80 transition-opacity`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#2c2825] truncate">{event.label}</p>
                  <p className={`text-[10px] mt-0.5 truncate ${cfg.text}`}>{event.sub}</p>
                </div>
                {event.time && (
                  <span className="text-[10px] text-[#8c8580] shrink-0 mt-0.5 font-medium">{event.time}</span>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/integrations"
          className="w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#b8a88a] border border-[#e8e4de] rounded-xl py-2 hover:bg-[#faf9f7] transition-colors"
        >
          <Calendar size={10} /> Sync with Google Calendar
        </Link>
      </div>
    </div>
  );
}

// ─── Showing Request Types ────────────────────────────────────────────────────
interface ShowingRequest {
  id: string;
  buyer_name: string;
  buyer_email: string;
  preferred_dates: string;
  preferred_time: string;
  message: string;
  status: "pending" | "confirmed" | "declined";
  requested_at: string;
}

// ─── Showing Inbox Widget ─────────────────────────────────────────────────────
const MOCK_SHOWING_REQUESTS: ShowingRequest[] = [
  {
    id: "mock-1",
    buyer_name: "Emma Chen",
    buyer_email: "emma@example.com",
    preferred_dates: "This Saturday or Sunday",
    preferred_time: "Morning",
    message: "Excited about the Rosedale listing — can we see it this weekend?",
    status: "pending",
    requested_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "mock-2",
    buyer_name: "David Park",
    buyer_email: "david@example.com",
    preferred_dates: "Next Tuesday",
    preferred_time: "Afternoon",
    message: "",
    status: "confirmed",
    requested_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function ShowingInboxWidget({ realtorId }: { realtorId: string }) {
  const [requests, setRequests] = useState<ShowingRequest[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!realtorId) {
      // Not signed in — show mocks
      setRequests(MOCK_SHOWING_REQUESTS);
      setLoaded(true);
      return;
    }
    fetch("/api/showings/list")
      .then((r) => r.json())
      .then((d) => {
        const real = d.requests ?? [];
        setRequests(real.length > 0 ? real : MOCK_SHOWING_REQUESTS);
      })
      .catch(() => setRequests(MOCK_SHOWING_REQUESTS))
      .finally(() => setLoaded(true));
  }, [realtorId]);

  async function updateStatus(id: string, status: "confirmed" | "declined") {
    setUpdating(id);
    try {
      await fetch("/api/showings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch { /* ignore */ }
    setUpdating(null);
  }

  const pending = requests.filter((r) => r.status === "pending");
  const recent = requests.filter((r) => r.status !== "pending").slice(0, 2);

  return (
    <div className="bg-white border border-[#ece8e2] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3.5 border-b border-[#f0ece6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-[#b8a88a]" />
          <p className="text-xs font-bold text-[#2c2825]">Showing Requests</p>
          {pending.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>
      </div>

      {!loaded ? (
        <div className="px-4 py-5 space-y-2">
          {[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-[#f5f2ee] animate-pulse" />)}
        </div>
      ) : (
        <div className="divide-y divide-[#f5f2ee]">
          {pending.map((req) => (
            <div key={req.id} className="px-4 py-3.5 bg-amber-50/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-[#2c2825]">{req.buyer_name || "Buyer"}</p>
                  <p className="text-[10px] text-[#b8a88a] font-medium">{req.preferred_dates}{req.preferred_time ? ` · ${req.preferred_time}` : ""}</p>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">Pending</span>
              </div>
              {req.message && (
                <p className="text-[10px] text-[#8c8580] italic mb-2.5 leading-relaxed">&ldquo;{req.message}&rdquo;</p>
              )}
              <div className="flex gap-2">
                <button
                  disabled={updating === req.id}
                  onClick={() => updateStatus(req.id, "confirmed")}
                  className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-60"
                >
                  <Check size={11} /> Confirm
                </button>
                <button
                  disabled={updating === req.id}
                  onClick={() => updateStatus(req.id, "declined")}
                  className="flex-1 flex items-center justify-center gap-1 border border-[#e8e4de] text-[#8c8580] text-[11px] font-medium py-2 rounded-lg hover:border-rose-300 hover:text-rose-500 transition-colors disabled:opacity-60"
                >
                  <X size={11} /> Decline
                </button>
              </div>
            </div>
          ))}
          {recent.map((req) => (
            <div key={req.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${req.status === "confirmed" ? "bg-emerald-400" : "bg-slate-300"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-[#2c2825] truncate">{req.buyer_name}</p>
                <p className="text-[10px] text-[#8c8580]">{req.preferred_dates}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${req.status === "confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                {req.status === "confirmed" ? "Confirmed" : "Declined"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Smart Insights Bar ───────────────────────────────────────────────────────
function SmartInsightsBar({ leads, onScoreFilter, onStatusFilter, onSearch }: {
  leads: Lead[];
  onScoreFilter: (f: LeadScore | "All") => void;
  onStatusFilter: (f: LeadStatus | "All") => void;
  onSearch: (q: string) => void;
}) {
  const now = Date.now();

  const coldLeads = leads.filter((l) => {
    if (l.score !== "Hot" && l.score !== "Warm") return false;
    if (l.status === "Closed") return false;
    const submitted = new Date(l.submittedAt ?? "").getTime();
    return (now - submitted) / (1000 * 60 * 60 * 24) > 7;
  });

  const offerLeads = leads.filter((l) => l.status === "Offer Stage");
  const hotLeads = leads.filter((l) => l.score === "Hot" && l.status !== "Closed");

  const atRiskCommission = coldLeads.reduce((sum, l) => {
    const avg = ((l.answers.budgetMin || 0) + (l.answers.budgetMax || 0)) / 2;
    return sum + avg * 0.025;
  }, 0);

  const insights: { icon: React.ReactNode; text: string; sub: string; color: string; bg: string; action: string; onClick: () => void }[] = [];

  if (coldLeads.length > 0) {
    const fmt = atRiskCommission >= 1000 ? `$${Math.round(atRiskCommission / 1000)}K` : `$${Math.round(atRiskCommission)}`;
    insights.push({
      icon: <ShieldAlert size={14} className="text-[#8c8580]" />,
      text: `${coldLeads.length} lead${coldLeads.length > 1 ? "s" : ""} going cold`,
      sub: `${fmt} commission at risk`,
      color: "text-[#2c2825]",
      bg: "bg-white border-[#e8e4de]",
      action: "Show them →",
      onClick: () => { onScoreFilter(coldLeads[0].score as LeadScore); onStatusFilter("All"); },
    });
  }

  if (offerLeads.length > 0) {
    insights.push({
      icon: <Target size={14} className="text-emerald-500" />,
      text: `${offerLeads.length} lead${offerLeads.length > 1 ? "s" : ""} at Offer Stage`,
      sub: "You're close — keep momentum",
      color: "text-[#2c2825]",
      bg: "bg-emerald-50 border-emerald-200",
      action: "View leads →",
      onClick: () => { onStatusFilter("Offer Stage"); onScoreFilter("All"); },
    });
  }

  if (hotLeads.length > 0 && coldLeads.length === 0) {
    insights.push({
      icon: <Flame size={14} className="text-[#8c8580]" />,
      text: `${hotLeads.length} hot lead${hotLeads.length > 1 ? "s" : ""} need attention`,
      sub: "Reach out before they go elsewhere",
      color: "text-[#2c2825]",
      bg: "bg-white border-[#e8e4de]",
      action: "Show hot leads →",
      onClick: () => { onScoreFilter("Hot"); onStatusFilter("All"); },
    });
  }

  const urgentTimeline = leads.find((l) =>
    l.status !== "Closed" && ["1-3 months", "ASAP"].includes(l.answers.timeline ?? "")
  );
  if (urgentTimeline) {
    insights.push({
      icon: <Clock size={14} className="text-[#8c8580]" />,
      text: `${urgentTimeline.answers.firstName} needs to move fast`,
      sub: `Timeline: ${urgentTimeline.answers.timeline} · ${urgentTimeline.answers.preferredCity || "local"}`,
      color: "text-[#2c2825]",
      bg: "bg-white border-[#e8e4de]",
      action: "Find them →",
      onClick: () => { onSearch(urgentTimeline.answers.firstName ?? ""); onScoreFilter("All"); onStatusFilter("All"); },
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: <Activity size={14} className="text-emerald-500" />,
      text: "Pipeline looking healthy",
      sub: "No urgent actions right now",
      color: "text-[#2c2825]",
      bg: "bg-emerald-50 border-emerald-200",
      action: "View all →",
      onClick: () => { onScoreFilter("All"); onStatusFilter("All"); },
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {insights.map((ins, i) => (
        <button
          key={i}
          onClick={ins.onClick}
          className={`flex items-start gap-2.5 shrink-0 border rounded-xl px-4 py-3 min-w-[220px] max-w-[260px] text-left cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.99] transition-all duration-150 ${ins.bg}`}
        >
          <div className="mt-0.5 shrink-0">{ins.icon}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${ins.color}`}>{ins.text}</p>
            <p className="text-[10px] text-[#8c8580] mt-0.5 leading-relaxed">{ins.sub}</p>
            <p className="text-[11px] font-bold mt-2 text-[#b8a88a]">{ins.action}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Gift Reminder Widget ─────────────────────────────────────────────────────
const MOCK_GIFT_REMINDERS = [
  {
    id: "g1",
    buyerName: "Sarah & Mike Liu",
    address: "42 Rosedale Valley Rd",
    closedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    giftSent: false,
    suggestion: "Personalized door knocker or premium wine set",
  },
  {
    id: "g2",
    buyerName: "Emma Chen",
    address: "18 Forest Hill Ave",
    closedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    giftSent: true,
    suggestion: "Custom address stamp",
  },
];

function GiftReminderWidget({ leads }: { leads: Lead[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState<Set<string>>(new Set());

  const closedLeads = leads.filter((l) => l.status === "Closed");
  const reminders = closedLeads.length > 0
    ? closedLeads.slice(0, 3).map((l, i) => ({
        id: l.id,
        buyerName: `${l.answers.firstName} ${l.answers.lastName}`.trim(),
        address: l.answers.preferredCity || "their new home",
        closedDate: l.submittedAt ?? new Date().toISOString(),
        giftSent: false,
        suggestion: ["Personalized door knocker", "Premium wine & cheese set", "Custom address stamp"][i % 3],
      }))
    : MOCK_GIFT_REMINDERS;

  const visible = reminders.filter((r) => !dismissed.has(r.id));
  if (visible.length === 0) return null;

  function daysSince(dateStr: string) {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="bg-white border border-[#ece8e2] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3.5 border-b border-[#f0ece6] flex items-center gap-2">
        <span className="text-base">💌</span>
        <p className="text-xs font-bold text-[#2c2825]">Send a Closing Gift</p>
        <span className="ml-auto text-[10px] text-[#b8b4b0]">Builds referrals</span>
      </div>
      <div className="divide-y divide-[#f5f2ee]">
        {visible.map((r) => {
          const days = daysSince(r.closedDate);
          const isSent = sent.has(r.id) || r.giftSent;
          return (
            <div key={r.id} className={`px-4 py-3.5 ${isSent ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#2c2825] truncate">{r.buyerName}</p>
                  <p className="text-[10px] text-[#8c8580] truncate">📍 {r.address}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {days <= 7 && !isSent && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">New close</span>
                  )}
                  <button onClick={() => setDismissed((p) => new Set([...p, r.id]))} className="text-[#c4bfb9] hover:text-[#8c8580] transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#b8a88a] italic mb-2.5">💡 {r.suggestion}</p>
              {isSent ? (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><Check size={11} /> Gift sent · Great for referrals</p>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSent((p) => new Set([...p, r.id]))}
                    className="flex-1 text-[11px] font-semibold bg-[#2c2825] text-white py-1.5 rounded-lg hover:bg-[#1a1714] transition-colors"
                  >
                    Mark as sent ✓
                  </button>
                  <a
                    href={`mailto:?subject=Congratulations on your new home!&body=Hi ${r.buyerName.split(" ")[0]},%0A%0ACongratulations on closing on ${r.address}! It was such a pleasure working with you.%0A%0AI wanted to send a small gift to welcome you home.%0A%0AWarmly,%0A`}
                    className="flex-1 text-[11px] font-semibold bg-[#f5f2ee] text-[#5c5550] py-1.5 rounded-lg hover:bg-[#ece8e2] transition-colors text-center"
                  >
                    ✉️ Send note
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Revenue Forecast Widget ─────────────────────────────────────────────────

function formatCommission(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

function RevenueWidget({ leads }: { leads: Lead[] }) {
  const COMMISSION_RATE = 0.025;

  const activeLeads = leads.filter((l) => l.status !== "Closed");
  const hotLeads = activeLeads.filter((l) => l.score === "Hot");
  const warmLeads = activeLeads.filter((l) => l.score === "Warm");

  function calcCommission(group: Lead[]): number {
    return group.reduce((sum, lead) => {
      const min = lead.answers.budgetMin ?? 0;
      const max = lead.answers.budgetMax ?? 0;
      if (!min && !max) return sum;
      const avg = (min + max) / 2;
      return sum + avg * COMMISSION_RATE;
    }, 0);
  }

  const totalCommission = calcCommission(activeLeads);
  const hotCommission = calcCommission(hotLeads);
  const warmCommission = calcCommission(warmLeads);

  const hasData = activeLeads.some(
    (l) => (l.answers.budgetMin ?? 0) > 0 || (l.answers.budgetMax ?? 0) > 0
  );

  return (
    <div className="bg-white border border-[#ece8e2] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-[#2c2825] px-4 py-3.5 flex items-center gap-2">
        <DollarSign size={13} className="text-[#b8a88a]" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8a88a]">Revenue Forecast</p>
      </div>

      {!hasData ? (
        <div className="px-4 py-8 text-center">
          <p className="text-[#b8b4b0] text-xs">No budget data available.</p>
          <p className="text-[#c4bfb9] text-[10px] mt-0.5">Budgets from leads will appear here.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Total pipeline */}
          <div className="bg-[#faf9f7] border border-[#ece8e2] rounded-xl px-4 py-3">
            <p className="text-[10px] text-[#8c8580] font-medium uppercase tracking-wider mb-1">Total Pipeline @ 2.5%</p>
            <p className="text-2xl font-bold text-[#2c2825]">{formatCommission(totalCommission)}</p>
            <p className="text-[10px] text-[#b8a88a] mt-0.5">{activeLeads.length} active lead{activeLeads.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Hot + Warm side by side */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Flame size={10} className="text-rose-400" />
                <p className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">Hot</p>
              </div>
              <p className="text-lg font-bold text-[#2c2825]">{formatCommission(hotCommission)}</p>
              <p className="text-[10px] text-rose-400 mt-0.5">{hotLeads.length} lead{hotLeads.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Zap size={10} className="text-amber-400" />
                <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">Warm</p>
              </div>
              <p className="text-lg font-bold text-[#2c2825]">{formatCommission(warmCommission)}</p>
              <p className="text-[10px] text-amber-400 mt-0.5">{warmLeads.length} lead{warmLeads.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [scoreFilter, setScoreFilter] = useState<LeadScore | "All">("All");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [realLeads, setRealLeads] = useState<Lead[]>([]);
  const [realtorName, setRealtorName] = useState<string>("");
  const [realtorId, setRealtorId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [emailCopied, setEmailCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const demoLeads = mockLeads;
  const allLeads = loading ? [] : realLeads.length > 0 ? realLeads : demoLeads;

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setRealtorId(user.id);
      setRealtorName((user.user_metadata?.first_name as string) ?? "");
      const { data } = await supabase.from("leads").select("*").eq("realtor_id", user.id).order("submitted_at", { ascending: false });
      if (data) setRealLeads(data.map(mapSupabaseLead));
      setLoading(false);
    }
    load();
  }, []);

  const shareableLink = realtorId
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app"}/questionnaire?r=${realtorId}`
    : "";

  function copyLink() {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function filterLead(lead: Lead): boolean {
    if (scoreFilter !== "All" && lead.score !== scoreFilter) return false;
    if (statusFilter !== "All" && lead.status !== statusFilter) return false;
    if (priorityOnly && !lead.isPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${lead.answers.firstName} ${lead.answers.lastName}`.toLowerCase();
      if (!name.includes(q) && !lead.answers.preferredCity.toLowerCase().includes(q) && !lead.answers.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }

  const showingDemos = !loading && realLeads.length === 0;
  const filteredReal = realLeads.filter(filterLead);
  const filteredDemo = showingDemos ? demoLeads.filter(filterLead) : [];
  const filtered = showingDemos ? filteredDemo : filteredReal;

  const hot = allLeads.filter((l) => l.score === "Hot").length;
  const warm = allLeads.filter((l) => l.score === "Warm").length;
  const newLeads = allLeads.filter((l) => l.status === "New Lead").length;
  const actionQueue = buildActionQueue(allLeads);

  const activeItems = actionQueue.filter((item) => !checkedItems.has(item.id));
  const doneItems = actionQueue.filter((item) => checkedItems.has(item.id));

  function toggleCheck(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  void router;

  function toggleLeadSelect(id: string) {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function copySelectedEmails() {
    const emails = Array.from(selectedLeads)
      .map((id) => allLeads.find((l) => l.id === id)?.answers.email)
      .filter(Boolean)
      .join(", ");
    navigator.clipboard.writeText(emails).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    });
  }

  function openGmailForSelected() {
    for (const id of selectedLeads) {
      const lead = allLeads.find((l) => l.id === id);
      if (!lead) continue;
      openGmailPopup(
        lead.answers.email,
        "Checking in | HomeMatch",
        `Hi ${lead.answers.firstName}, just wanted to follow up on your home search. I have some great options I'd love to share with you. Would you be available for a quick call this week?`
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">

      {/* ── Warm ivory header ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#faf7f3] via-[#f5f0e8] to-[#ede8df] px-5 lg:px-8 pt-10 pb-16 border-b border-[#e8e2d8]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-[#b8a88a]" />
                <span className="text-[#b8a88a] text-xs font-medium tracking-wide">{formatDate()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1714] mb-1">{getGreeting(realtorName)}</h1>
              <p className="text-[#8c8580] text-sm">
                {activeItems.length > 0
                  ? `You have ${activeItems.length} priority action${activeItems.length !== 1 ? "s" : ""} today`
                  : "You're all caught up. Great work!"}
              </p>
            </div>

            {/* Pipeline commission — motivating number */}
            <div className="shrink-0 text-right">
              {(() => {
                const active = allLeads.filter(l => l.status !== "Closed");
                const commission = active.reduce((sum, l) => {
                  const avg = ((l.answers.budgetMin || 0) + (l.answers.budgetMax || 0)) / 2;
                  return sum + avg * 0.025;
                }, 0);
                const fmt = (n: number) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n/1000)}K` : `$${Math.round(n)}`;
                return commission > 0 ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b8a88a] mb-0.5">Est. Commission</p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#2c2825] leading-none">{fmt(commission)}</p>
                    <p className="text-[10px] text-[#b8b4b0] mt-1">{active.length} active lead{active.length !== 1 ? "s" : ""} · 2.5%</p>
                    <button
                      onClick={() => exportLeads(filtered)}
                      className="mt-2 flex items-center gap-1.5 border border-[#d8d2c8] text-[#8c8580] text-xs px-3 py-1.5 rounded-full hover:border-[#2c2825] hover:text-[#2c2825] transition-colors bg-white/60 ml-auto"
                    >
                      <Download size={11} /> Export
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => exportLeads(filtered)}
                    className="flex items-center gap-1.5 border border-[#d8d2c8] text-[#8c8580] text-xs px-4 py-2 rounded-full hover:border-[#2c2825] hover:text-[#2c2825] transition-colors bg-white/60"
                  >
                    <Download size={12} /> Export
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Stat pills — horizontal scroll on mobile, row on desktop */}
          <div className="flex overflow-x-auto gap-2 mt-8 -mx-1 px-1 pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:gap-3">
            {[
              { label: "Total Leads", value: allLeads.length, icon: <Users size={13} className="text-[#b8a88a]" /> },
              { label: "Hot",         value: hot,             icon: <Flame size={13} className="text-[#b8a88a]" /> },
              { label: "Warm",        value: warm,            icon: <Zap size={13} className="text-[#b8a88a]" /> },
              { label: "New",         value: newLeads,        icon: <TrendingUp size={13} className="text-[#b8a88a]" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm shrink-0 bg-white border border-[#e8e2d8]">
                {stat.icon}
                <div>
                  <p className="text-base sm:text-xl font-bold leading-none text-[#2c2825]">{stat.value}</p>
                  <p className="text-[10px] mt-0.5 text-[#8c8580]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content (pulled up to overlap header) ───────────────── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 -mt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: Action Queue ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Section header card */}
            <div className="bg-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm border border-[#ece8e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-[#2c2825]">Today&apos;s Priority Actions</h2>
                {activeItems.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    {activeItems.length} remaining
                  </span>
                )}
              </div>
              <Link href="/pipeline" className="text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors flex items-center gap-1">
                Full pipeline <ChevronRight size={11} />
              </Link>
            </div>

            {/* Action items */}
            {actionQueue.length === 0 ? (
              <div className="bg-white rounded-2xl px-5 py-10 text-center shadow-sm border border-[#ece8e2]">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-700 font-semibold text-sm mb-1">You&apos;re all caught up</p>
                <p className="text-[#8c8580] text-xs">Share your buyer link to grow your pipeline.</p>
              </div>
            ) : (
              <>
                {activeItems.length === 0 && doneItems.length > 0 ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-5 py-10 text-center">
                    <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-3" />
                    <p className="text-emerald-700 font-semibold text-sm">All done for today ✓</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeItems.map((item) => (
                      <ActionQueueItem
                        key={item.id}
                        item={item}
                        isChecked={checkedItems.has(item.id)}
                        isExpanded={expandedItems.has(item.id)}
                        realtorName={realtorName}
                        onToggleCheck={() => toggleCheck(item.id)}
                        onToggleExpand={() => toggleExpand(item.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Completed items */}
                {doneItems.length > 0 && (
                  <div className="bg-white/60 border border-[#ece8e2] rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#e8e4de]" />
                      <span className="text-[10px] text-[#b8b4b0] font-medium whitespace-nowrap">
                        Completed today ({doneItems.length})
                      </span>
                      <div className="flex-1 h-px bg-[#e8e4de]" />
                    </div>
                    <div className="divide-y divide-[#f5f3f0]">
                      {doneItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 opacity-50">
                          <button
                            onClick={() => toggleCheck(item.id)}
                            className="shrink-0 w-5 h-5 rounded border border-emerald-300 bg-emerald-50 flex items-center justify-center"
                          >
                            <Check size={11} className="text-emerald-600" />
                          </button>
                          <p className="text-xs text-[#8c8580] line-through truncate">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Smart Insights ────────────────────────────────────────── */}
            {!loading && allLeads.length > 0 && (
              <SmartInsightsBar
                leads={allLeads}
                onScoreFilter={setScoreFilter}
                onStatusFilter={setStatusFilter}
                onSearch={setSearch}
              />
            )}

            {/* ── All Leads ─────────────────────────────────────────────── */}
            <div className="bg-white border border-[#ece8e2] rounded-2xl overflow-hidden shadow-sm mt-2">
              <div className="px-5 py-4 border-b border-[#f0ece6] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#2c2825] flex items-center gap-2">
                  <Users size={14} className="text-[#b8a88a]" /> All Leads
                  <span className="text-[10px] font-normal text-[#8c8580]">({allLeads.length})</span>
                </h2>
              </div>

              <div className="px-5 pt-4">
                {/* Search */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, city…"
                  className="w-full border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7] mb-3"
                />

                {/* Mobile: two compact selects */}
                <div className="flex gap-2 mb-3 sm:hidden">
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value as LeadScore | "All")}
                    className="flex-1 border border-[#e8e4de] rounded-xl px-3 py-2 text-xs text-[#2c2825] bg-[#faf9f7] focus:outline-none focus:border-[#2c2825]"
                  >
                    {SCORE_FILTERS.map((f) => <option key={f} value={f}>{f === "All" ? "All Scores" : f}</option>)}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "All")}
                    className="flex-1 border border-[#e8e4de] rounded-xl px-3 py-2 text-xs text-[#2c2825] bg-[#faf9f7] focus:outline-none focus:border-[#2c2825]"
                  >
                    {STATUS_FILTERS.map((f) => <option key={f} value={f}>{f === "All" ? "All Stages" : f}</option>)}
                  </select>
                  <button
                    onClick={() => setPriorityOnly((v) => !v)}
                    className={`px-3 py-2 rounded-xl border text-xs transition-all flex items-center gap-1 shrink-0 ${priorityOnly ? "bg-[#b8a88a]/20 text-[#8c6a3e] border-[#b8a88a]" : "bg-white text-[#8c8580] border-[#e8e4de]"}`}
                  >
                    <Star size={10} />
                  </button>
                </div>

                {/* Desktop: chip buttons */}
                <div className="hidden sm:block">
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {SCORE_FILTERS.map((f) => (
                      <button key={f} onClick={() => setScoreFilter(f)}
                        className={`text-xs px-3 py-2 rounded-xl border transition-all ${scoreFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"}`}>
                        {f}
                      </button>
                    ))}
                    <button onClick={() => setPriorityOnly((v) => !v)}
                      className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-1 ${priorityOnly ? "bg-[#b8a88a]/20 text-[#8c6a3e] border-[#b8a88a]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825]"}`}>
                      <Star size={10} /> Priority
                    </button>
                  </div>
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {STATUS_FILTERS.map((f) => (
                      <button key={f} onClick={() => setStatusFilter(f)}
                        className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all shrink-0 ${statusFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:text-[#2c2825]"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[#b8b4b0] text-xs mb-4">{filtered.length} of {allLeads.length} leads</p>
              </div>

              <div className="px-5 pb-5">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-40 rounded-2xl bg-[#f0ece6] animate-pulse" />
                    ))}
                  </div>
                ) : filtered.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {showingDemos
                      ? filteredDemo.map((lead) => (
                          <div key={lead.id} className="relative">
                            <div className="absolute top-0 left-0 z-10 p-1">
                              <button
                                onClick={() => toggleLeadSelect(lead.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  selectedLeads.has(lead.id)
                                    ? "bg-[#2c2825] border-[#2c2825]"
                                    : "bg-white/80 border-[#c4bfb9] hover:border-[#2c2825]"
                                }`}
                                aria-label={selectedLeads.has(lead.id) ? "Deselect lead" : "Select lead"}
                              >
                                {selectedLeads.has(lead.id) && <Check size={11} className="text-white" />}
                              </button>
                            </div>
                            <LeadCard lead={lead} isDemo />
                          </div>
                        ))
                      : filteredReal.map((lead) => (
                          <div key={lead.id} className="relative">
                            <div className="absolute top-0 left-0 z-10 p-1">
                              <button
                                onClick={() => toggleLeadSelect(lead.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  selectedLeads.has(lead.id)
                                    ? "bg-[#2c2825] border-[#2c2825]"
                                    : "bg-white/80 border-[#c4bfb9] hover:border-[#2c2825]"
                                }`}
                                aria-label={selectedLeads.has(lead.id) ? "Deselect lead" : "Select lead"}
                              >
                                {selectedLeads.has(lead.id) && <Check size={11} className="text-white" />}
                              </button>
                            </div>
                            <LeadCard lead={lead} />
                          </div>
                        ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-[#e8e4de] rounded-2xl">
                    <p className="text-[#2c2825] font-medium mb-1">No leads match</p>
                    <p className="text-[#8c8580] text-sm">Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ─────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Buyer link card */}
            <div className="bg-gradient-to-br from-[#f5f0e8] to-[#ede6d8] border border-[#ddd6c8] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={13} className="text-[#b8a88a]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8a88a]">Your Buyer Link</p>
              </div>
              <p className="text-[#6b6560] text-xs mb-4 leading-relaxed">
                Share this link. Buyers fill out the questionnaire and land directly in your dashboard.
              </p>
              {shareableLink ? (
                <>
                  <div className="bg-white/80 border border-[#ddd6c8] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-[10px] text-[#8c8580] truncate">{shareableLink}</p>
                  </div>
                  <button
                    onClick={copyLink}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-all ${
                      copied
                        ? "bg-emerald-500 text-white"
                        : "bg-[#2c2825] text-white hover:bg-[#1a1714]"
                    }`}
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                  </button>
                </>
              ) : (
                <div className="bg-white/60 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-[#8c8580]">Sign in to get your link</p>
                </div>
              )}
            </div>

            {/* Showing Request Inbox */}
            <ShowingInboxWidget realtorId={realtorId} />

            {/* Schedule widget */}
            <ScheduleWidget leads={allLeads} />

            {/* Revenue forecast */}
            {/* Thank You Gift Reminder */}
            <GiftReminderWidget leads={allLeads} />

            {/* Quick access */}
            <div className="bg-white border border-[#ece8e2] rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8a88a] mb-3">Quick Access</p>
              <div className="space-y-1">
                {[
                  { label: "Pipeline Board", href: "/pipeline", icon: <TrendingUp size={13} />, color: "text-sky-500" },
                  { label: "Listings", href: "/listings", icon: <Eye size={13} />, color: "text-emerald-500" },
                  { label: "Integrations", href: "/integrations", icon: <AlertCircle size={13} />, color: "text-amber-500" },
                ].map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f5f3f0] transition-colors group">
                    <div className="flex items-center gap-2.5 text-xs text-[#5c5550]">
                      <span className={item.color}>{item.icon}</span>
                      {item.label}
                    </div>
                    <ChevronRight size={11} className="text-[#c4bfb9] group-hover:text-[#2c2825] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bulk Outreach Floating Bar ───────────────────────────────── */}
      {selectedLeads.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#2c2825] rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4 text-sm">
            <span className="text-white font-semibold whitespace-nowrap">
              {selectedLeads.size} lead{selectedLeads.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setSelectedLeads(new Set())}
              className="text-white/60 hover:text-white transition-colors whitespace-nowrap"
            >
              Clear
            </button>
            <button
              onClick={copySelectedEmails}
              className="flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-xl whitespace-nowrap"
            >
              <Copy size={12} />
              {emailCopied ? "Copied!" : "Copy emails"}
            </button>
            <button
              onClick={openGmailForSelected}
              className="flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-xl whitespace-nowrap"
            >
              <Mail size={12} /> Open in Gmail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
