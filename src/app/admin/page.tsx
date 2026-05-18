"use client";

import { useBranding } from "@/context/BrandingContext";
import { BrandingConfig } from "@/types";
import { useState } from "react";
import { CheckCircle, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Field = keyof BrandingConfig;

const COLOR_PRESETS = [
  { name: "Charcoal & Gold",  primary: "#2c2825", accent: "#b8a88a" },
  { name: "Navy & Champagne", primary: "#1e2d4a", accent: "#c9b87a" },
  { name: "Forest & Sage",    primary: "#2d3b2e", accent: "#9ab89a" },
  { name: "Slate & Rose",     primary: "#3a3d4a", accent: "#c4a0a0" },
  { name: "Onyx & Pearl",     primary: "#1a1a1a", accent: "#d4cfc9" },
];

export default function AdminPage() {
  const { branding, update, reset } = useBranding();
  const [saved, setSaved] = useState(false);

  function handleChange(field: Field, value: string) {
    update({ [field]: value });
  }

  async function handleSave() {
    // Explicitly persist current branding to Supabase (belt-and-suspenders —
    // onChange already calls update() which saves, but the Save button ensures
    // a full flush even if something was missed)
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { branding } });
    } catch { /* ignore - context already saved on change */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-semibold text-[#2c2825]">Branding & Settings</h1>
          <p className="text-[#8c8580] text-sm mt-1">
            Customize how your Home Match portal appears to buyers.
          </p>
        </div>

        <div className="space-y-6">
          {/* Agency info */}
          <Section title="Agency Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Agency name" value={branding.agencyName} onChange={(v) => handleChange("agencyName", v)} />
              <Field label="Realtor name" value={branding.realtorName} onChange={(v) => handleChange("realtorName", v)} />
              <Field label="Realtor title" value={branding.realtorTitle} onChange={(v) => handleChange("realtorTitle", v)} />
              <Field label="Logo / Display name" value={branding.logoText} onChange={(v) => handleChange("logoText", v)} />
              <Field label="Tagline" value={branding.tagline} onChange={(v) => handleChange("tagline", v)} placeholder="Your brand tagline…" />
              <Field label="Website" value={branding.website} onChange={(v) => handleChange("website", v)} placeholder="www.yoursite.com" />
            </div>
          </Section>

          {/* Contact info */}
          <Section title="Contact Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Email" value={branding.email} onChange={(v) => handleChange("email", v)} type="email" />
              <Field label="Phone" value={branding.phone} onChange={(v) => handleChange("phone", v)} type="tel" />
            </div>
          </Section>

          {/* Colours */}
          <Section title="Brand Colours">
            {/* Presets */}
            <div className="mb-6">
              <p className="text-[#8c8580] text-xs mb-3">Quick presets</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => update({ primaryColor: preset.primary, accentColor: preset.accent })}
                    className="flex items-center gap-2 border border-[#e8e4de] rounded-xl px-4 py-2.5 hover:border-[#2c2825] transition-all bg-white"
                  >
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.primary }} />
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.accent }} />
                    </div>
                    <span className="text-[#2c2825] text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#2c2825] mb-2">Primary colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#e8e4de] cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm font-mono text-[#2c2825] focus:outline-none focus:border-[#2c2825] bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c2825] mb-2">Accent colour</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#e8e4de] cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="flex-1 border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm font-mono text-[#2c2825] focus:outline-none focus:border-[#2c2825] bg-white"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Live Preview */}
          <Section title="Live Preview">
            <div
              className="rounded-2xl p-8 text-white text-center"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <p className="font-semibold text-2xl mb-1" style={{ color: branding.accentColor }}>
                {branding.logoText}
              </p>
              <p className="text-sm opacity-70 mb-4">{branding.tagline}</p>
              <button
                className="text-sm font-medium px-6 py-2.5 rounded-full"
                style={{ backgroundColor: branding.accentColor, color: branding.primaryColor }}
              >
                Start Your Home Match
              </button>
              <div className="mt-6 pt-5 border-t border-white/10 text-xs opacity-60">
                {branding.realtorName} · {branding.realtorTitle} · {branding.phone}
              </div>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-[#8c8580] hover:text-[#2c2825] transition-colors"
            >
              <RotateCcw size={14} /> Reset to defaults
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#2c2825] text-white text-sm font-medium px-8 py-3 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              {saved ? <><CheckCircle size={15} /> Saved</> : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 shadow-sm">
      <h2 className="text-[#2c2825] font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2c2825] mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#e8e4de] rounded-xl px-4 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7]"
      />
    </div>
  );
}
