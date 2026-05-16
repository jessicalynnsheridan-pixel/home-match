import { scoreColor } from "@/lib/matchScore";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function MatchScoreRing({ score, size = "md" }: Props) {
  const { bg, text, border } = scoreColor(score);

  const dim = size === "lg" ? 80 : size === "sm" ? 48 : 64;
  const stroke = size === "lg" ? 6 : 4;
  const r = (dim - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          {/* Track */}
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e8e4de" strokeWidth={stroke} />
          {/* Progress */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            className={
              score >= 80 ? "stroke-rose-400" : score >= 50 ? "stroke-amber-400" : "stroke-slate-300"
            }
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-semibold ${size === "lg" ? "text-xl" : size === "sm" ? "text-xs" : "text-sm"} text-[#2c2825]`}>
            {score}
          </span>
        </div>
      </div>
      {size !== "sm" && (
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${bg} ${text} ${border}`}>
          {score >= 80 ? "Hot" : score >= 50 ? "Warm" : "Browsing"}
        </span>
      )}
    </div>
  );
}
