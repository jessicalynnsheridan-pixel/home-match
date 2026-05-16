"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const TEMPLATES = [
  {
    id: "invite",
    label: "Invite a Buyer",
    subject: "A smarter way to start your home search (takes 8 minutes)",
    body: `Hi [First Name],

I'm so glad we connected, and I want to make sure your home search starts off the right way.

I use a tool called Home Match that lets me understand exactly what you're looking for before we even get on a call. Instead of asking you the same questions over and over, you fill out one thoughtful profile (your budget, timeline, must-haves, deal breakers, neighbourhood preferences) and I get everything I need to start curating homes specifically for you.

It takes about 8 minutes and the experience is actually quite good.

Here's your personal link to get started:
→ [Your Home Match Link]

Once you've submitted, I'll review your profile and send you a personally selected shortlist. No generic listings, no noise. Just homes that actually fit your life.

Looking forward to working with you.

[Your Name]
[Your Title] | [Agency]
[Phone] | [Email]`,
  },
  {
    id: "followup",
    label: "After Profile Submitted",
    subject: "Got your profile. Here's what happens next.",
    body: `Hi [First Name],

Thank you for completing your Home Match profile. I've had a chance to review everything and I'm already thinking about some properties that could be a strong fit.

A few things I noticed from your profile:
- Your budget of [Budget Range] puts you in a competitive position in [Preferred City]
- Your timeline of [Timeline] means we should be ready to move quickly when the right home appears
- Your must-haves ([2–3 Must-Haves]) narrow the field in a useful way

I'll be putting together a curated shortlist for you over the next 24–48 hours.

In the meantime, if anything has changed or you'd like to add to your profile, just let me know and I can update it on my end.

Talk soon,

[Your Name]
[Your Title] | [Agency]
[Phone] | [Email]`,
  },
  {
    id: "recommendations",
    label: "Sending Recommendations",
    subject: "Your matched homes: [X] properties I think you'll love",
    body: `Hi [First Name],

I've been through the current market with your profile in mind, and I've put together [X] homes I think are worth a closer look.

I've shared them directly to your Home Match portal. You can view photos, details, and why each one was chosen for you:
→ [Portal Link]

Quick notes on my top pick:
[Property Address] | [Price]
[1–2 sentences on why it fits their specific criteria]

I'd love to book showings for any that feel right. A few things to keep in mind:
• [City/Market] is moving [fast/steadily] right now. Good properties don't sit long.
• Your pre-approval puts you in a strong position to move quickly if we find the one
• I've flagged [Property X] as worth seeing in person even if the photos don't fully sell it

What days work best for you this week or next?

[Your Name]
[Your Title] | [Agency]
[Phone] | [Email]`,
  },
  {
    id: "checkin",
    label: "Post-Showing Check-In",
    subject: "Thoughts on what we saw today?",
    body: `Hi [First Name],

Thanks for making the time today. It's always useful to walk through properties together, even the ones that don't end up being the right fit.

I'd love to hear your honest reaction:

1. Did anything today shift what you're looking for?
2. Was [Property Address] closer or further from what you had in mind?
3. Anything you saw, good or bad, that you want me to factor in going forward?

The more I understand about what resonated (and what didn't), the sharper the next round of recommendations will be.

I'll keep my eyes on new listings that match your profile and reach out as soon as something worth seeing hits the market.

Talk soon,

[Your Name]
[Your Title] | [Agency]
[Phone] | [Email]`,
  },
  {
    id: "reengagement",
    label: "Re-Engagement",
    subject: "Checking in: how's the search feeling?",
    body: `Hi [First Name],

It's been a little while since we last connected and I wanted to reach out, not to push, just to check in on where you're at.

The market in [City] has shifted a bit since we last spoke:
[One honest sentence about current conditions, e.g. "Inventory is up slightly, which means more time to make considered decisions." or "Competition has eased in the $X-$Y range."]

If your situation or timeline has changed, I'd love to update your Home Match profile so my recommendations stay relevant. If you're still looking, I may have a few new properties worth discussing.

And if the timing just isn't right yet, completely understood. I'll be here when you're ready.

No pressure either way. Just wanted you to know I'm still thinking about your search.

[Your Name]
[Your Title] | [Agency]
[Phone] | [Email]`,
  },
];

export default function RealtorEmailTemplates() {
  const [activeId, setActiveId] = useState("invite");
  const [copiedField, setCopiedField] = useState<"subject" | "body" | null>(null);

  const active = TEMPLATES.find((t) => t.id === activeId)!;

  function copy(field: "subject" | "body") {
    const text = field === "subject" ? active.subject : active.body;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl overflow-hidden shadow-sm">
      {/* Template tabs */}
      <div className="flex overflow-x-auto border-b border-[#e8e4de] bg-[#faf9f7]">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`shrink-0 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
              activeId === t.id
                ? "border-[#2c2825] text-[#2c2825] bg-white"
                : "border-transparent text-[#8c8580] hover:text-[#2c2825]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">
        {/* Subject line */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#8c8580] uppercase tracking-wider">Subject line</p>
            <button
              onClick={() => copy("subject")}
              className="flex items-center gap-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
            >
              {copiedField === "subject" ? (
                <><Check size={12} className="text-emerald-500" /> Copied</>
              ) : (
                <><Copy size={12} /> Copy</>
              )}
            </button>
          </div>
          <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-3 text-sm text-[#2c2825] font-medium">
            {active.subject}
          </div>
        </div>

        {/* Body */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#8c8580] uppercase tracking-wider">Email body</p>
            <button
              onClick={() => copy("body")}
              className="flex items-center gap-1.5 text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
            >
              {copiedField === "body" ? (
                <><Check size={12} className="text-emerald-500" /> Copied</>
              ) : (
                <><Copy size={12} /> Copy</>
              )}
            </button>
          </div>
          <div className="bg-[#faf9f7] border border-[#e8e4de] rounded-xl px-4 py-4 text-sm text-[#5c5550] leading-relaxed whitespace-pre-wrap font-mono text-xs">
            {active.body}
          </div>
        </div>

        <p className="text-xs text-[#8c8580] pt-1">
          Replace all <span className="font-medium text-[#2c2825]">[bracketed text]</span> before sending. These templates are starting points, so personalise freely.
        </p>
      </div>
    </div>
  );
}
