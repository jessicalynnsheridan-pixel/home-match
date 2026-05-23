"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#2c2825] mb-2">Set a new password</h1>
          <p className="text-[#8c8580] text-sm">Choose something strong and memorable.</p>
        </div>

        {done ? (
          <div className="bg-[#eaf0e8] border border-[#c0d0be] rounded-2xl p-6 text-center">
            <p className="text-[#3c5840] font-medium">Password updated!</p>
            <p className="text-[#5e8860] text-sm mt-1">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#e8e4de] rounded-2xl p-6 space-y-4">
            {error && (
              <p className="text-sm text-[#8b4a38] bg-[#f2e9e5] border border-[#dcc8be] rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-[#6b6560] mb-2">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full bg-white border border-[#e0dbd4] rounded-xl px-4 py-3.5 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8580] hover:text-[#2c2825]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6b6560] mb-2">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full bg-white border border-[#e0dbd4] rounded-xl px-4 py-3.5 text-sm text-[#2c2825] placeholder:text-[#b8b4b0] focus:outline-none focus:border-[#b8a88a]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-[#1a1512] font-semibold text-sm py-4 rounded-2xl transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #c9a870 0%, #a07840 100%)" }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-[#1a1512]/30 border-t-[#1a1512] rounded-full animate-spin" /> Updating…</>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
