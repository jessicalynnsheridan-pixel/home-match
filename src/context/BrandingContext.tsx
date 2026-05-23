"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrandingConfig } from "@/types";
import { getRealtorAttribution, attributionToBrandingPatch } from "@/lib/realtorAttribution";
import { createClient } from "@/lib/supabase/client";

const DEFAULTS: BrandingConfig = {
  agencyName: "HomeMatch Realty",
  realtorName: "Your Realtor",
  realtorTitle: "Real Estate Advisor",
  email: "",
  phone: "",
  logoText: "HomeMatch",
  primaryColor: "#2c2825",
  accentColor: "#b8a88a",
  tagline: "A boutique real estate experience built around your life.",
  website: "",
};

interface BrandingContextValue {
  branding: BrandingConfig;
  update: (patch: Partial<BrandingConfig>) => void;
  reset: () => void;
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: DEFAULTS,
  update: () => {},
  reset: () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULTS);

  // Hydrate on mount.
  // Priority: Supabase user metadata > localStorage fallback > realtor attribution > defaults.
  useEffect(() => {
    const timer = setTimeout(async () => {
      let resolved: BrandingConfig = DEFAULTS;

      // 1. Layer in realtor attribution if present (invite link, QR, etc.)
      const attribution = getRealtorAttribution();
      if (attribution) {
        resolved = { ...resolved, ...attributionToBrandingPatch(attribution) };
      }

      // 2. Layer in localStorage fallback (for unauthenticated or offline)
      const stored = localStorage.getItem("homematch_branding");
      if (stored) {
        try { resolved = { ...resolved, ...JSON.parse(stored) }; } catch { /* ignore */ }
      }

      // 3. Layer in Supabase user metadata (authoritative for logged-in realtors)
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.branding) {
          resolved = { ...resolved, ...user.user_metadata.branding };
        }
      } catch { /* ignore - not logged in */ }

      setBranding(resolved);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function update(patch: Partial<BrandingConfig>) {
    setBranding((prev) => {
      const next = { ...prev, ...patch };
      // Always save to localStorage as immediate fallback
      try { localStorage.setItem("homematch_branding", JSON.stringify(next)); } catch { /* quota exceeded or private browsing */ }
      // Persist to Supabase user metadata (best-effort, non-blocking)
      createClient().auth.updateUser({ data: { branding: next } }).catch(() => { /* ignore */ });
      return next;
    });
  }

  function reset() {
    try { localStorage.removeItem("homematch_branding"); } catch { /* ignore */ }
    createClient().auth.updateUser({ data: { branding: null } }).catch(() => { /* ignore */ });
    setBranding(DEFAULTS);
  }

  return (
    <BrandingContext.Provider value={{ branding, update, reset }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
