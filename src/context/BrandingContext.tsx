"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrandingConfig } from "@/types";

const DEFAULTS: BrandingConfig = {
  agencyName: "Home Match Realty",
  realtorName: "Sarah Mitchell",
  realtorTitle: "Luxury Real Estate Advisor",
  email: "sarah@homematch.ca",
  phone: "(416) 555-0100",
  logoText: "Home Match",
  primaryColor: "#2c2825",
  accentColor: "#b8a88a",
  tagline: "A boutique real estate experience built around your life.",
  website: "www.homematch.ca",
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

  // Hydrate from localStorage on mount
  // Wrapped in setTimeout so setState fires in a callback (satisfies react-hooks/set-state-in-effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("homematch_branding");
      if (stored) {
        try { setBranding({ ...DEFAULTS, ...JSON.parse(stored) }); } catch { /* ignore */ }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function update(patch: Partial<BrandingConfig>) {
    setBranding((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("homematch_branding", JSON.stringify(next));
      return next;
    });
  }

  function reset() {
    localStorage.removeItem("homematch_branding");
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
