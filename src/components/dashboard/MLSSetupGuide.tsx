"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Copy, Check, ExternalLink } from "lucide-react";

const STEPS = [
  {
    number: 1,
    title: "Sign in to the PropTx portal",
    body: "Go to syndication.ampre.ca/sso/start and sign in using your board credentials — the same login you use for Matrix or your MLS board tools.",
    action: {
      label: "Open PropTx Portal",
      href: "https://syndication.ampre.ca/sso/start",
    },
  },
  {
    number: 2,
    title: "Create a new IDX Agreement",
    body: 'Click "New Agreement" → select "Internet Data Exchange (IDX) Agreement". On the vendor selection page, search for and select "Home Match" as your vendor.',
  },
  {
    number: 3,
    title: "Add your website URL",
    body: 'In the agreement under Schedule B, add your website URL: yourhomematch.org. Check all acknowledgement boxes, then click "Sign Agreement".',
  },
  {
    number: 4,
    title: "Get your broker to sign",
    body: "Your broker will receive a notification to co-sign the agreement. If they need a nudge, copy the message below and send it to them.",
    copyable: `Hi, I need you to sign an IDX agreement on the PropTx syndication portal so my website can display MLS listings.

Log in at syndication.ampre.ca/sso/start with your board credentials and look for a pending agreement under Agreements. Takes 2 minutes.`,
  },
  {
    number: 5,
    title: "Wait for PropTx approval",
    body: "Once your broker signs, PropTx reviews and activates the agreement. This usually takes 1–2 business days (Mon–Fri). You'll get an email confirmation when it's done.",
  },
  {
    number: 6,
    title: "Contact us to activate your feed",
    body: "Once approved, email us so we can connect your MLS feed to your HomeMatch account. Live listings will appear in your portal within 24 hours.",
    copyable: `Hi HomeMatch team,

My IDX agreement has been approved on PropTx and I'd like to activate my MLS feed.

Realtor name: [Your Name]
Board: [Your Board, e.g. TRREB / Niagara]
MLS member ID: [Your ID]

Thanks!`,
    action: {
      label: "Email HomeMatch",
      href: "mailto:hello@yourhomematch.org?subject=Activate my MLS feed",
    },
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[10px] font-medium text-[#8b6a30] bg-[#f5eedd] border border-[#e0d0b0] px-2.5 py-1.5 rounded-lg hover:bg-[#ede0c8] transition-colors mt-3"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "Copy message"}
    </button>
  );
}

export default function MLSSetupGuide() {
  const [open, setOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="bg-white border border-[#e8d8c0] rounded-2xl overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#fdf9f5] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#f5eedd] flex items-center justify-center shrink-0">
            <span className="text-sm">🏠</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#2c2825]">Connect your MLS feed</p>
            <p className="text-[10px] text-[#b8a88a]">Show live listings to your buyers — 6 simple steps</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-medium bg-[#f5eedd] text-[#8b6a30] border border-[#e0d0b0] px-2 py-0.5 rounded-full">
            Not connected
          </span>
          {open ? <ChevronUp size={14} className="text-[#8c8580]" /> : <ChevronDown size={14} className="text-[#8c8580]" />}
        </div>
      </button>

      {/* Steps — expandable */}
      {open && (
        <div className="border-t border-[#f0ece6] px-4 pb-4 pt-3 space-y-2">
          <p className="text-[11px] text-[#8c8580] mb-3 leading-relaxed">
            Your buyers can already use HomeMatch. Connecting your MLS feed lets them see{" "}
            <span className="font-medium text-[#2c2825]">real, live listings</span> matched to their profile.
          </p>

          {STEPS.map((step) => {
            const isExpanded = expandedStep === step.number;
            return (
              <div key={step.number} className="border border-[#ece8e2] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-[#faf9f7] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#f0ece6] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#8c8580]">{step.number}</span>
                  </div>
                  <p className="text-xs font-medium text-[#2c2825] flex-1">{step.title}</p>
                  {isExpanded
                    ? <ChevronUp size={12} className="text-[#b8a88a] shrink-0" />
                    : <ChevronDown size={12} className="text-[#b8a88a] shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-3.5 pb-3.5 border-t border-[#f5f2ee]">
                    <p className="text-[11px] text-[#5c5550] leading-relaxed mt-2.5">{step.body}</p>

                    {step.copyable && (
                      <div className="mt-3 bg-[#faf9f7] border border-[#ece8e2] rounded-lg p-3">
                        <p className="text-[10px] text-[#8c8580] whitespace-pre-line leading-relaxed font-mono">{step.copyable}</p>
                        <CopyButton text={step.copyable} />
                      </div>
                    )}

                    {step.action && (
                      <a
                        href={step.action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-medium text-[#2c2825] bg-[#f0ece6] border border-[#e0dbd4] px-3 py-2 rounded-lg hover:bg-[#e8e4de] transition-colors"
                      >
                        <ExternalLink size={11} />
                        {step.action.label}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-start gap-2 mt-3 bg-[#eaf0e8] border border-[#c0d0be] rounded-xl px-3.5 py-3">
            <CheckCircle2 size={13} className="text-[#5e8860] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#3c5840] leading-relaxed">
              <span className="font-semibold">Already done?</span> Email{" "}
              <a href="mailto:hello@yourhomematch.org" className="underline underline-offset-2">
                hello@yourhomematch.org
              </a>{" "}
              and we&apos;ll activate your feed within 24 hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
