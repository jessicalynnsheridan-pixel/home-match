"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam === "auth" ? "That link has expired. Please sign in." : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password. Try again.");
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
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
          <h1 className="text-xl font-semibold text-[#2c2825] mb-6">Sign in</h1>

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

            <div>
              <label className="block text-sm font-medium text-[#6b6560] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-[#e0dbd4] rounded-xl px-4 py-3 pr-11 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8b4b0] hover:text-[#8c8580] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl transition-all btn-press disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)", color: "#1a1512" }}
            >
              {loading ? "Signing in..." : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8c8580] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/realtor-signup" className="text-[#2c2825] font-medium hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
