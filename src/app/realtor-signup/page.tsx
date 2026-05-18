"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Shield, Users, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PLAN_FEATURES = [
  "Unlimited buyer questionnaire links",
  "AI-powered match scores for every lead",
  "Full buyer readiness breakdown",
  "Affordability snapshot per listing",
  "Realtor dashboard with pipeline view",
  "Email templates for every stage",
  "Mortgage checklist per buyer",
  "PDF buyer profile export",
];

type Step = "plan" | "details" | "confirm";

export default function RealtorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("plan");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    brokerageName: "",
    licenseNumber: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form> & { auth?: string }>({});
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateDetails() {
    const next: Partial<typeof form> & { auth?: string; password?: string } = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) next.email = "Valid email required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.brokerageName.trim()) next.brokerageName = "Required";
    if (!password || password.length < 8) next.password = "Must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleNext() {
    if (step === "plan") { setStep("details"); return; }
    if (step === "details" && validateDetails()) {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
            brokerage: form.brokerageName,
            license: form.licenseNumber,
            city: form.city,
          },
        },
      });
      setLoading(false);
      if (error) {
        setErrors({ auth: error.message });
        return;
      }
      if (data.session) {
        router.push("/dashboard");
      } else {
        setStep("confirm");
      }
    }
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2c2825] mb-3">You&apos;re all set.</h1>
          <p className="text-[#8c8580] leading-relaxed mb-8">
            Thanks, {form.firstName}. We&apos;ll activate your account and send your login link to{" "}
            <strong className="text-[#2c2825]">{form.email}</strong> within the hour.
          </p>
          <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 text-left mb-8 space-y-3">
            <p className="text-xs text-[#8c8580] uppercase tracking-wider mb-3">What happens next</p>
            {[
              "You'll receive a welcome email with your personal login link",
              "Your dashboard will be pre-configured for the Niagara region",
              "Share your questionnaire link with your first buyer and go",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#f5f3f0] border border-[#e8e4de] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-[#8c8580] font-medium">{i + 1}</span>
                </div>
                <p className="text-sm text-[#5c5550]">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#2c2825] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#1a1714] transition-colors"
            >
              Sign in to your dashboard
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-[#e8e4de] bg-white text-[#2c2825] text-sm px-6 py-2.5 rounded-full hover:border-[#2c2825] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <div className="bg-[#2c2825] py-14 px-6 text-center">
        <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-3">For Realtors</p>
        <h1 className="text-3xl font-light text-white mb-3">
          {step === "plan" ? "Start your free account" : "Your details"}
        </h1>
        <p className="text-[#a09890] text-base max-w-md mx-auto">
          {step === "plan"
            ? "Give every buyer a guided, intelligent experience. Look more organized from day one."
            : "Fill in your information and we'll have you set up within the hour."}
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#b8a88a] flex items-center justify-center">
              <span className="text-[#2c2825] text-xs font-semibold">1</span>
            </div>
            <span className={`text-xs ${step === "plan" ? "text-white" : "text-[#a09890]"}`}>Your plan</span>
          </div>
          <div className="w-8 h-px bg-white/20" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "details" ? "bg-[#b8a88a]" : "bg-white/10"}`}>
              <span className={`text-xs font-semibold ${step === "details" ? "text-[#2c2825]" : "text-white/40"}`}>2</span>
            </div>
            <span className={`text-xs ${step === "details" ? "text-white" : "text-[#a09890]"}`}>Your details</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
        {/* Step: Plan */}
        {step === "plan" && (
          <div className="space-y-6">
            {/* Value props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Users, title: "Smarter intake", body: "Replace your intake questionnaire with a guided buyer profile buyers actually complete." },
                { icon: BarChart3, title: "AI match scores", body: "Every buyer gets compatibility and readiness scores your team can act on instantly." },
                { icon: Shield, title: "Private and secure", body: "Buyer data is only visible to you and your assigned clients." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-white border border-[#e8e4de] rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-xl bg-[#f5f3f0] border border-[#e8e4de] flex items-center justify-center mb-4">
                    <Icon size={16} className="text-[#b8a88a]" />
                  </div>
                  <p className="text-[#2c2825] font-medium text-sm mb-1">{title}</p>
                  <p className="text-[#8c8580] text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            {/* Plan card */}
            <div className="bg-white border border-[#2c2825] rounded-2xl overflow-hidden">
              <div className="bg-[#2c2825] px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Home Match Pro</p>
                  <p className="text-[#e8e4de]/60 text-sm">Everything you need, all in one place</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-2xl">Free</p>
                  <p className="text-[#e8e4de]/60 text-xs">during early access</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLAN_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-[#5c5550]">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#2c2825] text-white font-medium py-3.5 rounded-full hover:bg-[#1a1714] transition-colors flex items-center justify-center gap-2"
            >
              Continue to Create Account
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <form
            noValidate
            onSubmit={(e) => { e.preventDefault(); handleNext(); }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 md:p-8 space-y-5">
              <p className="text-[#2c2825] font-semibold mb-2">Your information</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First name" error={errors.firstName}>
                  <input
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    placeholder="Sarah"
                    className={inputClass(!!errors.firstName)}
                  />
                </Field>
                <Field label="Last name" error={errors.lastName}>
                  <input
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Chen"
                    className={inputClass(!!errors.lastName)}
                  />
                </Field>
              </div>

              <Field label="Email address" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="sarah@chenrealty.ca"
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <Field label="Phone" error={errors.phone}>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="905-555-0100"
                  className={inputClass(!!errors.phone)}
                />
              </Field>

              <div className="border-t border-[#f0ece6] pt-5">
                <p className="text-[#2c2825] font-semibold mb-4">Brokerage details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Brokerage name" error={errors.brokerageName}>
                    <input
                      autoComplete="organization"
                      value={form.brokerageName}
                      onChange={(e) => update("brokerageName", e.target.value)}
                      placeholder="RE/MAX Niagara"
                      className={inputClass(!!errors.brokerageName)}
                    />
                  </Field>
                  <Field label="License number" sublabel="optional" error={undefined}>
                    <input
                      autoComplete="off"
                      value={form.licenseNumber}
                      onChange={(e) => update("licenseNumber", e.target.value)}
                      placeholder="4012345"
                      className={inputClass(false)}
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Primary city" error={undefined}>
                    <input
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="St. Catharines"
                      className={inputClass(false)}
                    />
                  </Field>
                </div>

                {/* Password */}
                <div className="mt-4">
                  <Field label="Create a password" error={(errors as Record<string, string>).password}>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((e) => { const n = { ...e }; delete (n as Record<string, string>).password; return n; }); }}
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                      className={inputClass(!!(errors as Record<string, string>).password)}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {errors.auth && (
              <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                {errors.auth}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="flex-shrink-0 border border-[#e8e4de] bg-white text-[#2c2825] text-sm px-6 py-3 rounded-full hover:border-[#2c2825] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#2c2825] text-white font-medium py-3 rounded-full hover:bg-[#1a1714] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={15} /></>}
              </button>
            </div>

            <p className="text-center text-[#8c8580] text-xs leading-relaxed">
              By submitting, you agree to our Terms of Service and Privacy Policy.
              Your RECO license number is used to verify registration.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, sublabel, error, children }: { label: string; sublabel?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-[#8c8580] font-medium mb-1.5">
        {label}
        {sublabel && <span className="text-[#c4bfb9] font-normal">({sublabel})</span>}
      </label>
      {children}
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full border ${hasError ? "border-rose-400" : "border-[#e8e4de]"} rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] transition-colors bg-white`;
}
