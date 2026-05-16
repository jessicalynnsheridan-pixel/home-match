"use client";

import { MortgageChecklistItem } from "@/types";
import { CheckCircle, Circle } from "lucide-react";

interface Props {
  items: MortgageChecklistItem[];
  onChange: (items: MortgageChecklistItem[]) => void;
  readonly?: boolean;
}

export default function MortgageChecklist({ items, onChange, readonly }: Props) {
  function toggle(id: string) {
    if (readonly) return;
    onChange(items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));
  }

  const completed = items.filter((i) => i.completed).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[#2c2825] font-semibold">Mortgage Readiness</p>
        <span className="text-sm font-semibold text-[#2c2825]">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#e8e4de] rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            disabled={readonly}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
              item.completed
                ? "bg-emerald-50 border-emerald-200"
                : "bg-[#faf9f7] border-[#e8e4de] hover:border-[#2c2825]"
            } ${readonly ? "cursor-default" : "cursor-pointer"}`}
          >
            {item.completed ? (
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
            ) : (
              <Circle size={15} className="text-[#c4bfb9] shrink-0" />
            )}
            <p
              className={`text-sm ${
                item.completed ? "text-emerald-800 line-through" : "text-[#2c2825]"
              }`}
            >
              {item.label}
            </p>
          </button>
        ))}
      </div>

      <p className="text-[#8c8580] text-xs mt-4">
        {completed} of {items.length} documents ready · {!readonly && "Click to toggle"}
      </p>
    </div>
  );
}
