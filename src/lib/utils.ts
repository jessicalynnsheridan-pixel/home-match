import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function getScoreColor(score: string): string {
  switch (score) {
    case "Hot":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "Warm":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Browsing":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "New Lead":       return "bg-blue-50 text-blue-700 border-blue-200";
    case "Qualified":      return "bg-violet-50 text-violet-700 border-violet-200";
    case "Showing Booked": return "bg-teal-50 text-teal-700 border-teal-200";
    case "Offer Stage":    return "bg-orange-50 text-orange-700 border-orange-200";
    case "Closed":         return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:               return "bg-slate-100 text-slate-600";
  }
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date(new Date().toDateString());
}
