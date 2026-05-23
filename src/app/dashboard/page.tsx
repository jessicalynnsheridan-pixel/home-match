"use client";

import { useState, useEffect } from "react";
import { mapSupabaseLead } from "@/lib/mapSupabaseLead";
import { mockLeads } from "@/data/mockLeads";
import LeadCard from "@/components/dashboard/LeadCard";
import { Lead, LeadScore, LeadStatus } from "@/types";
import { Download, Flame, Zap, Eye, AlertCircle, Copy, Check, Link2, Phone, Mail, ChevronRight, Star, Users, TrendingUp, ChevronDown, CheckCircle2, ExternalLink, Sparkles, Calendar, Clock, MapPin, Bell, DollarSign, CalendarDays, X, MessageSquare, ShieldAlert, Activity, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import AutomationsWidget from "@/components/dashboard/AutomationsWidget";

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
    return `New profile submitted: ${name} is looking for a ${propType} in ${city}. Budget and timeline look ${timeline === "ASAP" || timeline === "1-3 months" ? "urgent" : "solid"}. Open their profile to review and reach out.`;
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
    const isASAP = lead.answers.timeline === "ASAP" || lead.answers.timeline === "1-3 months";
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
    cardBg: "bg-[#fdf7f5]",
    border: "border border-[#e8d5ce]",
    leftBar: "bg-[#c4785c]",
    badge: "bg-[#f2e9e5] text-[#8b4a38] border border-[#dcc8be]",
    badgeLabel: "Urgent",
    iconBg: "bg-[#f2e9e5] text-[#8b4a38]",
    ctaBg: "bg-[#8b4a38] hover:bg-[#7a3f31] text-white",
    expandBg: "bg-[#fdf7f5]",
  },
  high: {
    cardBg: "bg-[#fdf9f0]",
    border: "border border-[#e0d4b8]",
    leftBar: "bg-[#c4924a]",
    badge: "bg-[#f2ede0] text-[#8b6a30] border border-[#e0d0b0]",
    badgeLabel: "Today",
    iconBg: "bg-[#f2ede0] text-[#8b6a30]",
    ctaBg: "bg-[#8b6a30] hover:bg-[#7a5a28] text-white",
    expandBg: "bg-[#fdf9f0]",
  },
  medium: {
    cardBg: "bg-[#f5f6f8]",
    border: "border border-[#d4d8e0]",
    leftBar: "bg-[#7888a8]",
    badge: "bg-[#eaecf0] text-[#4a5468] border border-[#c4c8d4]",
    badgeLabel: "This week",
    iconBg: "bg-[#eaecf0] text-[#4a5468]",
    ctaBg: "bg-[#4a5468] hover:bg-[#3c4458] text-white",
    expandBg: "bg-[#f5f6f8]",
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
                className="shrink-0 w-6 h-6 rounded-lg border-2 border-white/70 flex items-center justify-center hover:border-[#5e8860] transition-colors bg-white/50"
                aria-label={isChecked ? "Mark incomplete" : "Mark complete"}
              >
                {isChecked && <Check size={12} className="text-[#4a6648]" />}
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

  // NOTE: Showings are only added to the schedule when a showing request is
  // explicitly confirmed via the Showing Requests widget — not inferred from lead status.

  // Hot leads that are "New Lead" → suggest a call today
  leads
    .filter((l) => l.score === "Hot" && l.status === "New Lead")
    .slice(0, 1)
    .forEach((lead) => {
      events.push({
        id: `call-${lead.id}`,
        type: "call",
        label: `Call ${lead.answers.firstName} ${lead.answers.lastName}`,
        sub: "Hot lead. Reach out today",
        time: "ASAP",
        leadId: lead.id,
      });
    });

  return events;
}

const EVENT_CONFIG = {
  showing: { icon: MapPin,  bg: "bg-[#f0f2f5]",  border: "border-[#d4d8e0]",  dot: "bg-[#7888a8]",  text: "text-[#4a5468]"  },
  call:    { icon: Phone,   bg: "bg-[#fdf5f3]",  border: "border-[#e8d5ce]",  dot: "bg-[#c4785c]",  text: "text-[#8b4a38]"  },
  reminder:{ icon: Bell,    bg: "bg-[#fdf9f0]",  border: "border-[#e0d4b8]",  dot: "bg-[#c4924a]",  text: "text-[#8b6a30]"  },
  followup:{ icon: Mail,    bg: "bg-[#f5f0fa]",  border: "border-[#dcd4e8]",  dot: "bg-[#9880b0]",  text: "text-[#6a5878]"  },
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
        // Never fall back to mock data for authenticated realtors — show real requests only
        setRequests(d.requests ?? []);
      })
      .catch(() => setRequests([]))
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
            <span className="bg-[#c4785c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>
      </div>

      {!loaded ? (
        <div className="px-4 py-5 space-y-2">
          {[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-[#f5f2ee] animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-[#b8b4b0] text-xs">No showing requests yet.</p>
          <p className="text-[#c4bfb9] text-[11px] mt-1">Requests from buyers will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#f5f2ee]">
          {pending.map((req) => (
            <div key={req.id} className="px-4 py-3.5 bg-[#fdf9f0]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-[#2c2825]">{req.buyer_name || "Buyer"}</p>
                  <p className="text-[10px] text-[#b8a88a] font-medium">{req.preferred_dates}{req.preferred_time ? ` · ${req.preferred_time}` : ""}</p>
                </div>
                <span className="text-[10px] bg-[#f2ede0] text-[#8b6a30] px-2 py-0.5 rounded-full font-medium shrink-0">Pending</span>
              </div>
              {req.message && (
                <p className="text-[10px] text-[#8c8580] italic mb-2.5 leading-relaxed">&ldquo;{req.message}&rdquo;</p>
              )}
              <div className="flex gap-2">
                <button
                  disabled={updating === req.id}
                  onClick={() => updateStatus(req.id, "confirmed")}
                  className="flex-1 flex items-center justify-center gap-1 bg-[#4a6648] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[#3c5840] transition-colors disabled:opacity-60"
                >
                  <Check size={11} /> Confirm
                </button>
                <button
                  disabled={updating === req.id}
                  onClick={() => updateStatus(req.id, "declined")}
                  className="flex-1 flex items-center justify-center gap-1 border border-[#e8e4de] text-[#8c8580] text-[11px] font-medium py-2 rounded-lg hover:border-[#c4785c] hover:text-[#8b4a38] transition-colors disabled:opacity-60"
                >
                  <X size={11} /> Decline
                </button>
              </div>
            </div>
          ))}
          {recent.map((req) => (
            <div key={req.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${req.status === "confirmed" ? "bg-[#5e8860]" : "bg-[#c8c4be]"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-[#2c2825] truncate">{req.buyer_name}</p>
                <p className="text-[10px] text-[#8c8580]">{req.preferred_dates}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${req.status === "confirmed" ? "bg-[#eaf0e8] text-[#4a6648]" : "bg-[#f0eeea] text-[#7a7268]"}`}>
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
function SmartInsightsBar({ leads, onStatusFilter, onSearch }: {
  leads: Lead[];
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
      onClick: () => { onStatusFilter("All"); },
    });
  }

  if (offerLeads.length > 0) {
    insights.push({
      icon: <Target size={14} className="text-[#4a6648]" />,
      text: `${offerLeads.length} lead${offerLeads.length > 1 ? "s" : ""} at Offer Stage`,
      sub: "You're close. Keep momentum",
      color: "text-[#2c2825]",
      bg: "bg-[#eaf0e8] border-[#c0d0be]",
      action: "View leads →",
      onClick: () => { onStatusFilter("Offer Stage"); },
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
      onClick: () => { onStatusFilter("All"); },
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
      onClick: () => { onSearch(urgentTimeline.answers.firstName ?? ""); onStatusFilter("All"); },
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: <Activity size={14} className="text-[#4a6648]" />,
      text: "Pipeline looking healthy",
      sub: "No urgent actions right now",
      color: "text-[#2c2825]",
      bg: "bg-[#eaf0e8] border-[#c0d0be]",
      action: "View all →",
      onClick: () => { onStatusFilter("All"); },
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
            <p className={`text-xs font-semibold leading-snug ${ins.color}`}>{ins.text}</p>
            <p className="text-xs text-[#8c8580] mt-1 leading-relaxed">{ins.sub}</p>
            <p className="text-xs font-bold mt-2 text-[#b8a88a]">{ins.action}</p>
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
                    <span className="text-[10px] bg-[#f2ede0] text-[#8b6a30] px-1.5 py-0.5 rounded-full font-bold">New close</span>
                  )}
                  <button onClick={() => setDismissed((p) => new Set([...p, r.id]))} className="text-[#c4bfb9] hover:text-[#8c8580] transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[#b8a88a] italic mb-2.5">💡 {r.suggestion}</p>
              {isSent ? (
                <p className="text-[11px] text-[#4a6648] font-semibold flex items-center gap-1"><Check size={11} /> Gift sent · Great for referrals</p>
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
            <div className="bg-[#f5efed] border border-[#e8d5ce] rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Flame size={10} className="text-[#c4785c]" />
                <p className="text-[10px] text-[#8b4a38] font-semibold uppercase tracking-wider">Hot</p>
              </div>
              <p className="text-lg font-bold text-[#2c2825]">{formatCommission(hotCommission)}</p>
              <p className="text-[10px] text-[#c4785c] mt-0.5">{hotLeads.length} lead{hotLeads.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-[#faf5ec] border border-[#e0d4b8] rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1">
                <Zap size={10} className="text-[#c4924a]" />
                <p className="text-[10px] text-[#8b6a30] font-semibold uppercase tracking-wider">Warm</p>
              </div>
              <p className="text-lg font-bold text-[#2c2825]">{formatCommission(warmCommission)}</p>
              <p className="text-[10px] text-[#c4924a] mt-0.5">{warmLeads.length} lead{warmLeads.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {

  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [search, setSearch] = useState("");
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
      const firstName = (user.user_metadata?.first_name as string) ?? "";
      const lastName = (user.user_metadata?.last_name as string) ?? "";
      setRealtorName(firstName);
      const { data } = await supabase.from("leads").select("*").eq("realtor_id", user.id).order("submitted_at", { ascending: false });
      if (data) setRealLeads(data.map(mapSupabaseLead));
      setLoading(false);
    }
    load();
  }, []);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://home-match-six.vercel.app";
  // Generate a branded invite link using the realtor's name slug — e.g. /invite/sarah-mitchell?r=<uuid>
  // Falls back to the direct questionnaire link if realtorName is not available
  const realtorSlug = realtorName
    ? realtorName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    : null;
  const shareableLink = realtorId
    ? realtorSlug
      ? `${APP_URL}/invite/${realtorSlug}?r=${realtorId}`
      : `${APP_URL}/questionnaire?r=${realtorId}`
    : "";

  function copyLink() {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function filterLead(lead: Lead): boolean {
    if (statusFilter !== "All" && lead.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${lead.answers.firstName} ${lead.answers.lastName}`.toLowerCase();
      if (!name.includes(q) && !lead.answers.preferredCity?.toLowerCase().includes(q) && !lead.answers.email?.toLowerCase().includes(q)) return false;
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

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="px-5 lg:px-8 pt-10 pb-16 border-b border-[#e8e2d8]">
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

            {/* Pipeline commission */}
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
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#b8a88a] mb-0.5">Est. Commission</p>
                    <p className="text-3xl sm:text-4xl font-bold text-[#2c2825] leading-none">{fmt(commission)}</p>
                    <p className="text-xs text-[#b8b4b0] mt-1">{active.length} active lead{active.length !== 1 ? "s" : ""} · 2.5%</p>
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

          {/* Stat pills */}
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
                  <p className="text-xs mt-0.5 text-[#8c8580]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 -mt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: Action Queue ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Section header card */}
            <div className="bg-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm border border-[#ece8e2]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#c4785c] animate-pulse" />
                <h2 className="text-sm font-semibold text-[#2c2825]">Today&apos;s Priority Actions</h2>
                {activeItems.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2e9e5] text-[#8b4a38] border border-[#dcc8be]">
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
                <CheckCircle2 size={28} className="text-[#5e8860] mx-auto mb-3" />
                <p className="text-[#4a6648] font-semibold text-sm mb-1">You&apos;re all caught up</p>
                <p className="text-[#8c8580] text-xs">Share your buyer link to grow your pipeline.</p>
              </div>
            ) : (
              <>
                {activeItems.length === 0 && doneItems.length > 0 ? (
                  <div className="bg-[#eaf0e8] border border-[#c0d0be] rounded-2xl px-5 py-10 text-center">
                    <CheckCircle2 size={28} className="text-[#5e8860] mx-auto mb-3" />
                    <p className="text-[#4a6648] font-semibold text-sm">All done for today ✓</p>
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
                            className="shrink-0 w-5 h-5 rounded border border-[#c0d0be] bg-[#eaf0e8] flex items-center justify-center"
                          >
                            <Check size={11} className="text-[#4a6648]" />
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

                {/* Mobile: status select only */}
                <div className="flex gap-2 mb-3 sm:hidden">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "All")}
                    className="flex-1 border border-[#e8e4de] rounded-xl px-3 py-2 text-xs text-[#2c2825] bg-[#faf9f7] focus:outline-none focus:border-[#2c2825]"
                  >
                    {STATUS_FILTERS.map((f) => <option key={f} value={f}>{f === "All" ? "All Stages" : f}</option>)}
                  </select>
                </div>

                {/* Desktop: status chips only */}
                <div className="hidden sm:block">
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {STATUS_FILTERS.map((f) => (
                      <button key={f} onClick={() => setStatusFilter(f)}
                        className={`text-xs px-3 py-2 rounded-xl border whitespace-nowrap transition-all shrink-0 ${statusFilter === f ? "bg-[#2c2825] text-white border-[#2c2825]" : "bg-white text-[#8c8580] border-[#e8e4de] hover:border-[#2c2825] hover:text-[#2c2825]"}`}>
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
            <div className="rounded-2xl overflow-hidden shadow-sm border border-[#2c2825]/10">
              {/* Dark header */}
              <div className="bg-[#2c2825] px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={13} className="text-[#b8a88a]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#b8a88a]">Your Buyer Link</p>
                </div>
                <p className="text-white text-base font-semibold leading-snug mb-1">Turn your link into leads</p>
                <p className="text-[#b8a88a] text-xs leading-relaxed">Share it anywhere. Buyers complete a personalised quiz and land straight in your pipeline.</p>
              </div>

              {/* Feature pills */}
              <div className="bg-[#3a3430] px-5 py-3 flex flex-wrap gap-2">
                {["📋 Smart quiz", "📬 Auto-emails", "🔥 Lead scoring", "📊 Pipeline view"].map(f => (
                  <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-[#e8e0d4]">{f}</span>
                ))}
              </div>

              {/* Link + CTA */}
              <div className="bg-white px-5 py-4">
                {shareableLink ? (
                  <>
                    <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-3 py-2.5 mb-3">
                      <p className="text-[10px] text-[#8c8580] truncate">{shareableLink}</p>
                    </div>
                    <button
                      onClick={copyLink}
                      className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all ${
                        copied
                          ? "bg-[#4a6648] text-white"
                          : "bg-[#2c2825] text-white hover:bg-[#1a1714]"
                      }`}
                    >
                      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                    </button>
                  </>
                ) : (
                  <div className="bg-[#f5f3f0] rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-[#8c8580]">Sign in to get your link</p>
                  </div>
                )}
              </div>
            </div>

            {/* Automations */}
            <AutomationsWidget leads={allLeads} realtorName={realtorName} />

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
                  { label: "Pipeline Board", href: "/pipeline", icon: <TrendingUp size={13} />, color: "text-[#4a5468]" },
                  { label: "Listings", href: "/listings", icon: <Eye size={13} />, color: "text-[#4a6648]" },
                  { label: "Integrations", href: "/integrations", icon: <AlertCircle size={13} />, color: "text-[#8b6a30]" },
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
