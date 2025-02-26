import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Conditionally concatenates class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
