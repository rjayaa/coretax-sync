// lib/utils/index.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Session utilities
export function isSessionExpired(expiryTime: number): boolean {
  return Date.now() > expiryTime;
}

// Company utilities
export function formatCompanyName(name: string): string {
  return name.length > 30 ? `${name.substring(0, 27)}...` : name;
}