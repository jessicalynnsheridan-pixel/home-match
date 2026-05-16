import { QuestionnaireAnswers } from "@/types";
import { generateDreamHomeProfile } from "@/lib/matchScore";
import { Sparkles } from "lucide-react";

export default function DreamHomeProfile({ answers }: { answers: QuestionnaireAnswers }) {
  const narrative = generateDreamHomeProfile(answers);

  return (
    <div className="bg-[#2c2825] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-[#b8a88a]" />
        <p className="text-white font-semibold text-sm">Dream Home Profile</p>
      </div>
      <p className="text-[#e8e4de]/80 text-sm leading-relaxed italic">
        &ldquo;{narrative}&rdquo;
      </p>

      {/* Neighbourhood vibe tags */}
      {answers.neighbourhoodVibe && answers.neighbourhoodVibe.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/10">
          <p className="text-[#e8e4de]/50 text-xs uppercase tracking-wider mb-3">
            Neighbourhood vibe
          </p>
          <div className="flex flex-wrap gap-2">
            {answers.neighbourhoodVibe.map((v) => (
              <span
                key={v}
                className="text-xs bg-white/10 text-[#e8e4de] border border-white/20 px-3 py-1 rounded-full"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Proximity priorities */}
      {answers.proximityPriorities && answers.proximityPriorities.length > 0 && (
        <div className="mt-4">
          <p className="text-[#e8e4de]/50 text-xs uppercase tracking-wider mb-3">
            Proximity priorities
          </p>
          <div className="flex flex-wrap gap-2">
            {answers.proximityPriorities.map((v) => (
              <span
                key={v}
                className="text-xs bg-[#b8a88a]/20 text-[#b8a88a] border border-[#b8a88a]/30 px-3 py-1 rounded-full"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
