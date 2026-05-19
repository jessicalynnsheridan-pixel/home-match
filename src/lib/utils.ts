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
      return "bg-[#f2e9e5] text-[#8b4a38] border-[#dcc8be]";
    case "Warm":
      return "bg-[#f2ede0] text-[#8b6a30] border-[#e0d0b0]";
    case "Browsing":
      return "bg-[#f0eeea] text-[#7a7268] border-[#dbd6ce]";
    default:
      return "bg-[#f0eeea] text-[#7a7268] border-[#dbd6ce]";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "New Lead":       return "bg-[#eaecf0] text-[#4a5468] border-[#c4c8d4]";
    case "Qualified":      return "bg-[#ede8f0] text-[#6a5878] border-[#c8bcd4]";
    case "Showing Booked": return "bg-[#e8eeec] text-[#3c6460] border-[#b8ccc8]";
    case "Offer Stage":    return "bg-[#f0e8e4] text-[#7a5040] border-[#d4c0b8]";
    case "Closed":         return "bg-[#eaf0e8] text-[#4a6648] border-[#c0d0be]";
    default:               return "bg-[#f0eeea] text-[#7a7268] border-[#dbd6ce]";
  }
}

export function isOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}
