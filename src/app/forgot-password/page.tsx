"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: (process.env.NEXT_PUBLIC_APP_URL ?? "") + "/auth/callback",
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-xl font-semibold text-[#2c2825]">
            Home<span className="text-[#b8a88a]"> Match</span>
          </Link>
          <p className="text-[#8c8580] text-sm mt-2">Realtor dashboard</p>
        </div>

        <div className="bg-white border border-[#e8e4de] rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-[#2c2825] mb-2">Reset your password</h1>
          <p className="text-[#8c8580] text-sm mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-[#2c2825] font-medium mb-1">Check your email</p>
              <p className="text-[#8c8580] text-sm">
                We sent a reset link to <strong className="text-[#2c2825]">{email}</strong>
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6b6560] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full border border-[#e0dbd4] rounded-xl px-4 py-3 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl transition-all btn-press disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", color: "#1a1512" }}
                >
                  {loading ? "Sending..." : <>Send reset link <ArrowRight size={15} /></>}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#8c8580] mt-6">
          Remembered it?{" "}
          <Link href="/login" className="text-[#2c2825] font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
