"use client";

import { useState } from "react";
import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Mail, Copy, CheckCheck } from "lucide-react";

interface Template {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  subject: (lead: Lead) => string;
  body: (lead: Lead) => string;
}

const TEMPLATES: Template[] = [
  {
    id: "intro",
    label: "First Touch: Introduction",
    badge: "All leads",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    subject: (l) => `${l.answers.firstName}, I've reviewed your Home Match profile`,
    body: (l) => `Hi ${l.answers.firstName},

Thank you for completing your Home Match profile. I've had a chance to review your preferences, and I'm excited to start curating homes for you.

Based on your profile, I can see you're looking for a ${l.answers.propertyType?.toLowerCase() || "home"} in ${l.answers.preferredCity} with a budget of ${formatCurrency(l.answers.budgetMin)} – ${formatCurrency(l.answers.budgetMax)}.

I'll be in touch shortly with a personalized shortlist of homes that fit your must-haves and lifestyle priorities.

In the meantime, if you have any questions or want to chat before I send recommendations, feel free to reply to this email or give me a call.

Looking forward to helping you find the right home.

Warmly,`,
  },
  {
    id: "hot-followup",
    label: "Hot Lead: Move Fast",
    badge: "Hot leads",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    subject: (l) => `${l.answers.firstName}: a few homes I think you'll love`,
    body: (l) => `Hi ${l.answers.firstName},

I've found ${l.answers.propertyType?.toLowerCase() || "properties"} in ${l.answers.preferredNeighbourhoods || l.answers.preferredCity} that are a strong match for your profile. Based on your ${l.answers.timeline} timeline, I'd love to book showings before these move.

A few things from your profile stood out to me: ${l.answers.mustHaves.slice(0, 3).join(", ")}. The homes I have in mind check all of those boxes.

Are you available for a quick 15-minute call this week? I'd love to walk through my top picks with you before we book showings.

With your ${l.answers.preApprovalStatus === "Yes, fully approved" || l.answers.preApprovalStatus === "Paying cash" ? "financing in order" : "financing underway"}, we're in a great position to move quickly when the right property comes up.

Looking forward to speaking,`,
  },
  {
    id: "warm-nurture",
    label: "Warm Lead: Stay Connected",
    badge: "Warm leads",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    subject: (l) => `Checking in on your search, ${l.answers.firstName}`,
    body: (l) => `Hi ${l.answers.firstName},

I wanted to check in on your search and let you know I've been keeping an eye on ${l.answers.preferredCity}, specifically in ${l.answers.preferredNeighbourhoods || "your preferred areas"}.

The market has had some activity recently that's relevant to what you're looking for, and I want to make sure you're in the loop as we get closer to your ${l.answers.timeline} timeline.

A few quick questions to help me refine the search:
- Has anything changed in terms of your budget or timeline?
- Are there any new must-haves or deal breakers I should know about?
- Would you be open to a 20-minute call to review what's available right now?

I'm here whenever you're ready to move forward, no pressure at all.

Best,`,
  },
  {
    id: "browsing",
    label: "Browsing Lead: Build Trust",
    badge: "Browsing",
    badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    subject: (l) => `${l.answers.firstName}, a few thoughts on your search`,
    body: (l) => `Hi ${l.answers.firstName},

Thank you for taking the time to complete your Home Match profile. I loved learning more about what you're looking for.

I know you're still in the early stages of your search, and I think that's actually the best place to be. The more time we have to look, the more strategic we can be about finding the right fit in ${l.answers.preferredCity}.

There's no rush or pressure from my end. But I'd love to start building a relationship so that when you're ready (whether that's in 3 months or 12) we're already aligned on exactly what you want.

Some things I'd love to do for you right now:
- Set up a custom market alert for ${l.answers.preferredCity}
- Share some recent comparable sales in ${l.answers.preferredNeighbourhoods || "your preferred neighbourhoods"}
- Answer any questions you have about the buying process

Feel free to reach out any time.

Best,`,
  },
  {
    id: "post-showing",
    label: "Post-Showing Follow-Up",
    badge: "After showing",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    subject: (l) => `${l.answers.firstName}: thoughts on today's showing?`,
    body: (l) => `Hi ${l.answers.firstName},

It was great spending time with you today. I hope the showing gave you a good sense of what's possible in ${l.answers.preferredCity}.

I'd love to hear your honest thoughts:
- How did it feel compared to what you had in mind?
- Was there anything that stood out, positively or negatively?
- Did it confirm any of your must-haves or surface new priorities?

Based on your feedback, I'll continue refining the search. I have a couple of other properties in mind that I think could be a strong fit, and I'd love to book those showings next.

Let me know the best time to connect.

Warmly,`,
  },
];

export default function EmailTemplates({ lead }: { lead: Lead }) {
  const [selected, setSelected] = useState<string>("intro");
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const template = TEMPLATES.find((t) => t.id === selected)!;
  const subject = template.subject(lead);
  const body = template.body(lead);
  // fullEmail kept for potential future "copy all" feature

  function copy(type: "subject" | "body") {
    navigator.clipboard.writeText(type === "subject" ? subject : `${body}\n\nYour Realtor\n   Home Match`);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e8e4de]">
        <Mail size={15} className="text-[#b8a88a]" />
        <p className="text-[#2c2825] font-semibold">Email Copy Templates</p>
      </div>

      {/* Template selector */}
      <div className="flex gap-2 flex-wrap px-5 py-3 border-b border-[#e8e4de] bg-[#faf9f7]">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
              selected === t.id
                ? "bg-[#2c2825] text-white border-[#2c2825]"
                : "bg-white text-[#2c2825] border-[#e8e4de] hover:border-[#2c2825]"
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${t.badgeColor.includes("rose") ? "bg-rose-400" : t.badgeColor.includes("amber") ? "bg-amber-400" : t.badgeColor.includes("teal") ? "bg-teal-400" : t.badgeColor.includes("blue") ? "bg-blue-400" : "bg-slate-300"}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Email preview */}
      <div className="p-5 space-y-4">
        {/* Subject */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[#8c8580] text-xs uppercase tracking-wider">Subject</p>
            <button
              onClick={() => copy("subject")}
              className="flex items-center gap-1 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
            >
              {copied === "subject" ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied === "subject" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] font-medium">
            {subject}
          </div>
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[#8c8580] text-xs uppercase tracking-wider">Body</p>
            <button
              onClick={() => copy("body")}
              className="flex items-center gap-1 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
            >
              {copied === "body" ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied === "body" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="bg-[#f5f3f0] border border-[#e8e4de] rounded-xl px-4 py-4 text-xs text-[#2c2825] leading-relaxed whitespace-pre-wrap font-sans overflow-auto max-h-64">
            {body}
          </pre>
        </div>

        {/* Personalization note */}
        <p className="text-[#8c8580] text-xs">
          This template is pre-personalized with {lead.answers.firstName}&apos;s profile data. Add your name and contact details before sending.
        </p>
      </div>
    </div>
  );
}
