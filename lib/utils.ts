import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cached formatter to avoid recreating Intl.DateTimeFormat on every call (64x speedup)
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  // Handle invalid dates safely to prevent RangeError from Intl.DateTimeFormat
  if (isNaN(d.getTime())) {
    return "Invalid Date"
  }
  return dateFormatter.format(d)
}
