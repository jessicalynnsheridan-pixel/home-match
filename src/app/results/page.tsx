"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuestionnaireAnswers } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Calendar, Upload, ArrowRight } from "lucide-react";

export default function ResultsPage() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);

  // Read the submitted answers from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("homematch_answers");
    if (raw) {
      try {
        setAnswers(JSON.parse(raw));
      } catch {
        // Malformed data — ignore
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7] px-6 lg:px-8 py-20">
      <div className="max-w-2xl mx-auto">
        {/* Confirmation header */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2c2825] mb-6">
            <CheckCircle className="text-[#b8a88a]" size={28} />
          </div>
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-3">
            Profile Submitted
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#2c2825] mb-4">
            Your Home Profile is Ready.
          </h1>
          <p className="text-[#8c8580] text-lg leading-relaxed max-w-lg mx-auto">
            Your preferences are saved. Explore your affordability insights, matched homes, and buyer tools, or connect with a professional when you&apos;re ready.
          </p>
        </div>

        {/* Preference summary */}
        {answers && (
          <div className="bg-white border border-[#e8e4de] rounded-3xl shadow-sm p-8 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-[#2c2825] font-semibold text-lg mb-6">
              Your profile summary
            </h2>

            <div className="space-y-4">
              {/* Buyer name */}
              <SummaryRow
                label="Name"
                value={`${answers.firstName} ${answers.lastName}`}
              />
              <SummaryRow label="Timeline" value={answers.timeline || "-"} />
              <SummaryRow
                label="Budget"
                value={`${formatCurrency(answers.budgetMin)} – ${formatCurrency(answers.budgetMax)}`}
              />
              <SummaryRow
                label="Location"
                value={
                  [answers.preferredCity, answers.preferredNeighbourhoods]
                    .filter(Boolean)
                    .join(", ") || "-"
                }
              />
              <SummaryRow
                label="Property type"
                value={`${answers.propertyType || "-"} · ${answers.bedrooms} bed · ${answers.bathrooms} bath`}
              />
              <SummaryRow
                label="Pre-approval"
                value={answers.preApprovalStatus || "-"}
              />
              <SummaryRow
                label="School district"
                value={answers.schoolDistrictImportance || "-"}
              />
            </div>

            {/* Must-haves */}
            {answers.mustHaves.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#e8e4de]">
                <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-3">
                  Must-haves
                </p>
                <div className="flex flex-wrap gap-2">
                  {answers.mustHaves.map((item) => (
                    <span
                      key={item}
                      className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle priorities */}
            {answers.lifestylePriorities.length > 0 && (
              <div className="mt-5">
                <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-3">
                  Lifestyle priorities
                </p>
                <div className="flex flex-wrap gap-2">
                  {answers.lifestylePriorities.map((item) => (
                    <span
                      key={item}
                      className="bg-[#f5f3f0] border border-[#e8e4de] text-[#2c2825] text-xs px-3 py-1.5 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional notes */}
            {answers.additionalNotes && (
              <div className="mt-5 pt-5 border-t border-[#e8e4de]">
                <p className="text-[#8c8580] text-xs uppercase tracking-wider mb-2">
                  Your notes
                </p>
                <p className="text-[#2c2825] text-sm leading-relaxed">
                  {answers.additionalNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next steps */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          {/* Book a call */}
          <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-full bg-[#f5f3f0] flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-[#b8a88a]" />
            </div>
            <div className="flex-1">
              <p className="text-[#2c2825] font-medium mb-1">Explore your buyer tools</p>
              <p className="text-[#8c8580] text-sm leading-relaxed">
                See your affordability breakdown, hidden costs, neighbourhood lifestyle matches, and closing checklist, all in your portal.
              </p>
            </div>
            <Link href="/portal" className="text-sm text-[#2c2825] font-medium border border-[#e8e4de] px-4 py-2 rounded-full hover:border-[#2c2825] transition-colors whitespace-nowrap">
              Open Portal
            </Link>
          </div>

          {/* Upload docs */}
          <div className="bg-white border border-[#e8e4de] rounded-2xl p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-full bg-[#f5f3f0] flex items-center justify-center shrink-0">
              <Upload size={18} className="text-[#b8a88a]" />
            </div>
            <div className="flex-1">
              <p className="text-[#2c2825] font-medium mb-1">Upload your pre-approval</p>
              <p className="text-[#8c8580] text-sm leading-relaxed">
                Attach your mortgage pre-approval letter or proof of funds to move
                faster when the right home appears.
              </p>
            </div>
            <button className="text-sm text-[#2c2825] font-medium border border-[#e8e4de] px-4 py-2 rounded-full hover:border-[#2c2825] transition-colors whitespace-nowrap">
              Upload
            </button>
          </div>

          {/* Realtor message */}
          <div className="bg-[#2c2825] rounded-2xl p-6 text-center">
            <p className="text-[#e8e4de] font-medium mb-2">Ready to connect with a professional?</p>
            <p className="text-[#e8e4de]/70 text-sm leading-relaxed mb-5">
              When you feel informed and ready, a real estate professional can review your completed profile and hit the ground running. No introductory back-and-forth needed.
            </p>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 bg-[#b8a88a] text-[#2c2825] text-sm font-medium px-6 py-3 rounded-full hover:bg-[#c9b99b] transition-colors"
            >
              Go to Your Home Hub
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start text-sm gap-4">
      <span className="text-[#8c8580] shrink-0">{label}</span>
      <span className="text-[#2c2825] font-medium text-right">{value}</span>
    </div>
  );
}
