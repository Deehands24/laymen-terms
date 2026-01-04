import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return "Invalid Date"
  }
  return dateFormatter.format(d)
}
