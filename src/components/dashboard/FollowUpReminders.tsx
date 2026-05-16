"use client";

import { useState } from "react";
import { FollowUpReminder } from "@/types";
import { formatDate, isOverdue } from "@/lib/utils";
import { Bell, Trash2, CheckCircle, Plus } from "lucide-react";

interface Props {
  reminders: FollowUpReminder[];
  onChange: (reminders: FollowUpReminder[]) => void;
}

export default function FollowUpReminders({ reminders, onChange }: Props) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");

  function addReminder() {
    if (!text.trim() || !dueDate) return;
    const newReminder: FollowUpReminder = {
      id: `rem-${Date.now()}`,
      text: text.trim(),
      dueDate,
      completed: false,
    };
    onChange([...reminders, newReminder]);
    setText("");
    setDueDate("");
  }

  function toggleComplete(id: string) {
    onChange(reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  }

  function deleteReminder(id: string) {
    onChange(reminders.filter((r) => r.id !== id));
  }

  const pending = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  return (
    <div className="bg-white border border-[#e8e4de] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={15} className="text-[#b8a88a]" />
        <p className="text-[#2c2825] font-semibold">Follow-Up Reminders</p>
        {pending.filter((r) => isOverdue(r.dueDate)).length > 0 && (
          <span className="ml-auto text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            {pending.filter((r) => isOverdue(r.dueDate)).length} overdue
          </span>
        )}
      </div>

      {/* Pending reminders */}
      {pending.length > 0 && (
        <div className="space-y-2 mb-4">
          {pending.map((r) => {
            const overdue = isOverdue(r.dueDate);
            return (
              <div
                key={r.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border group ${
                  overdue ? "bg-rose-50 border-rose-200" : "bg-[#f5f3f0] border-[#e8e4de]"
                }`}
              >
                <button onClick={() => toggleComplete(r.id)} className="mt-0.5 shrink-0">
                  <CheckCircle
                    size={15}
                    className={overdue ? "text-rose-300 hover:text-rose-500" : "text-[#e8e4de] hover:text-emerald-500"}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2c2825] text-sm">{r.text}</p>
                  <p className={`text-xs mt-0.5 ${overdue ? "text-rose-600 font-medium" : "text-[#8c8580]"}`}>
                    {overdue ? "Overdue · " : "Due "}{formatDate(r.dueDate)}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#8c8580] hover:text-rose-500 transition-all shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div className="space-y-1.5 mb-4 opacity-60">
          {done.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-2.5">
              <button onClick={() => toggleComplete(r.id)}>
                <CheckCircle size={15} className="text-emerald-500" />
              </button>
              <p className="text-[#8c8580] text-sm line-through">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add reminder */}
      <div className="border-t border-[#e8e4de] pt-4 space-y-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a follow-up reminder…"
          onKeyDown={(e) => e.key === "Enter" && addReminder()}
          className="w-full border border-[#e8e4de] rounded-xl px-3.5 py-2.5 text-sm text-[#2c2825] placeholder:text-[#c4bfb9] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7]"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 border border-[#e8e4de] rounded-xl px-3.5 py-2.5 text-sm text-[#2c2825] focus:outline-none focus:border-[#2c2825] bg-[#faf9f7]"
          />
          <button
            onClick={addReminder}
            disabled={!text.trim() || !dueDate}
            className="flex items-center gap-1.5 bg-[#2c2825] text-white text-sm px-4 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1714] transition-colors"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
