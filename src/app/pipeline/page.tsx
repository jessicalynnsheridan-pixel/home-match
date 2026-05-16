"use client";

import { useState } from "react";
import { mockLeads } from "@/data/mockLeads";
import { Lead, LeadStatus } from "@/types";
import { formatCurrency, getScoreColor } from "@/lib/utils";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

const STAGES: LeadStatus[] = ["New Lead", "Qualified", "Showing Booked", "Offer Stage", "Closed"];

const STAGE_META: Record<LeadStatus, { label: string; description: string; color: string; dot: string }> = {
  "New Lead":       { label: "New Lead",       description: "Just submitted",          color: "border-blue-200 bg-blue-50",   dot: "bg-blue-400" },
  "Qualified":      { label: "Qualified",       description: "Reviewed & engaged",      color: "border-violet-200 bg-violet-50", dot: "bg-violet-400" },
  "Showing Booked": { label: "Showing Booked",  description: "Viewing scheduled",       color: "border-teal-200 bg-teal-50",   dot: "bg-teal-400" },
  "Offer Stage":    { label: "Offer Stage",     description: "Making an offer",         color: "border-orange-200 bg-orange-50", dot: "bg-orange-400" },
  "Closed":         { label: "Closed",          description: "Deal complete",           color: "border-emerald-200 bg-emerald-50", dot: "bg-emerald-400" },
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [dragging, setDragging] = useState<string | null>(null);

  function moveLeadTo(leadId: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  }

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("leadId", leadId);
    setDragging(leadId);
  }

  function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) moveLeadTo(leadId, status);
    setDragging(null);
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#b8a88a] text-sm font-medium tracking-widest uppercase mb-1">
            Lead Pipeline
          </p>
          <h1 className="text-2xl font-semibold text-[#2c2825]">Pipeline Board</h1>
          <p className="text-[#8c8580] text-sm mt-1">
            Drag cards across stages or use the move buttons on each card.
          </p>
        </div>

        {/* Kanban columns */}
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage) => {
            const meta = STAGE_META[stage];
            const stageLeads = leads.filter((l) => l.status === stage);

            return (
              <div
                key={stage}
                className="flex-shrink-0 w-72"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage)}
              >
                {/* Column header */}
                <div className={`rounded-xl border px-4 py-3 mb-3 ${meta.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      <p className="text-[#2c2825] font-semibold text-sm">{meta.label}</p>
                    </div>
                    <span className="text-[#8c8580] text-xs font-medium bg-white/60 rounded-full px-2 py-0.5">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="text-[#8c8580] text-xs mt-1 ml-4">{meta.description}</p>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-24">
                  {stageLeads.map((lead) => (
                    <PipelineCard
                      key={lead.id}
                      lead={lead}
                      stages={STAGES}
                      onMove={moveLeadTo}
                      isDragging={dragging === lead.id}
                      onDragStart={handleDragStart}
                      onDragEnd={() => setDragging(null)}
                    />
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed border-[#e8e4de] rounded-xl h-20 flex items-center justify-center">
                      <p className="text-[#c4bfb9] text-xs">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PipelineCard({
  lead,
  stages,
  onMove,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  stages: LeadStatus[];
  onMove: (id: string, status: LeadStatus) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  const currentIndex = stages.indexOf(lead.status);
  const canAdvance = currentIndex < stages.length - 1;
  const overdueReminders = lead.reminders.filter(
    (r) => !r.completed && new Date(r.dueDate) < new Date()
  );

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      className={`bg-white border border-[#e8e4de] rounded-2xl p-4 shadow-sm cursor-grab transition-all ${
        isDragging ? "opacity-40 scale-95" : "hover:border-[#2c2825] hover:shadow-md"
      }`}
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {lead.isPriority && <Star size={12} className="text-[#b8a88a] fill-[#b8a88a]" />}
          <p className="text-[#2c2825] font-semibold text-sm">
            {lead.answers.firstName} {lead.answers.lastName}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {overdueReminders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" title="Overdue reminder" />
          )}
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getScoreColor(lead.score)}`}>
            {lead.score}
          </span>
        </div>
      </div>

      {/* Match score bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-[#8c8580] mb-1">
          <span>Match Score</span>
          <span className="font-medium text-[#2c2825]">{lead.matchScore}</span>
        </div>
        <div className="h-1.5 bg-[#e8e4de] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              lead.matchScore >= 80 ? "bg-rose-400" : lead.matchScore >= 50 ? "bg-amber-400" : "bg-slate-300"
            }`}
            style={{ width: `${lead.matchScore}%` }}
          />
        </div>
      </div>

      {/* Key info */}
      <div className="text-xs text-[#8c8580] space-y-1 mb-4">
        <p className="text-[#2c2825]">
          {formatCurrency(lead.answers.budgetMin)} – {formatCurrency(lead.answers.budgetMax)}
        </p>
        <p>{lead.answers.preferredCity} · {lead.answers.timeline}</p>
        <p>{lead.answers.propertyType} · {lead.answers.bedrooms} bed</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/${lead.id}`}
          className="text-xs text-[#8c8580] hover:text-[#2c2825] transition-colors"
        >
          View profile
        </Link>
        {canAdvance && (
          <button
            onClick={() => onMove(lead.id, stages[currentIndex + 1])}
            className="flex items-center gap-1 text-xs text-[#2c2825] border border-[#e8e4de] px-2.5 py-1 rounded-full hover:border-[#2c2825] transition-colors"
          >
            Advance <ArrowRight size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
