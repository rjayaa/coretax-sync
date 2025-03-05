// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"
// import { format, parseISO } from 'date-fns';
// import { id } from 'date-fns/locale';


// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }



// /**
//  * Format a number as Indonesian Rupiah currency
//  * @param amount - Number to format as currency
//  * @param options - Formatting options
//  * @returns Formatted currency string
//  */
// export function formatCurrency(amount: number | string | null | undefined, options?: {
//   currency?: string;
//   minimumFractionDigits?: number;
//   maximumFractionDigits?: number;
// }): string {
//   if (amount === null || amount === undefined || amount === '') {
//     return 'Rp 0';
//   }
  
//   const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
//   if (isNaN(numAmount)) {
//     return 'Rp 0';
//   }
  
//   const {
//     currency = 'IDR',
//     minimumFractionDigits = 0,
//     maximumFractionDigits = 0,
//   } = options || {};
  
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency,
//     minimumFractionDigits,
//     maximumFractionDigits,
//   }).format(numAmount);
// }

// /**
//  * Format a date string or Date object to a readable format
//  * @param date - Date to format (string in ISO format or Date object)
//  * @param formatStr - Format string to use (defaults to dd-MM-yyyy)
//  * @returns Formatted date string
//  */
// export function formatDate(
//   date: string | Date | null | undefined,
//   formatStr: string = 'dd-MM-yyyy'
// ): string {
//   if (!date) {
//     return '-';
//   }

// export function formatDateTime(date: string | Date | null | undefined): string {
//   return formatDate(date, 'dd-MM-yyyy HH:mm');
// }

// /**
//  * Get the month name in Indonesian from a date
//  * @param date - Date to extract month from
//  * @returns Month name in Indonesian (Januari - Desember)
//  */
// export function getMonth(date: string | Date | null | undefined): string {
//   if (!date) {
//     return '-';
//   }
  
//   try {
//     const dateObj = typeof date === 'string' ? parseISO(date) : date;
//     return format(dateObj, 'MMMM', { locale: id });
//   } catch (err) {
//     console.error('Error getting month:', err);
//     return '-';
//   }
// }

// /**
//  * Get the year from a date
//  * @param date - Date to extract year from
//  * @returns Year as a string
//  */
// export function getYear(date: string | Date | null | undefined): string {
//   if (!date) {
//     return '-';
//   }
  
//   try {
//     const dateObj = typeof date === 'string' ? parseISO(date) : date;
//     return format(dateObj, 'yyyy', { locale: id });
//   } catch (err) {
//     console.error('Error getting year:', err);
//     return '-';
//   }
// }
//   try {
//     const dateObj = typeof date === 'string' ? parseISO(date) : date;
//     return format(dateObj, formatStr, { locale: id });
//   } catch (err) {
//     console.error('Error formatting date:', err);
//     return '-';
//   }
// }

// /**
//  * Format a date as a full date with day name (e.g., "Senin, 05 Juni 2023")
//  * @param date - Date to format
//  * @returns Formatted date string
//  */
// export function formatFullDate(date: string | Date | null | undefined): string {
//   return formatDate(date, 'EEEE, dd MMMM yyyy');
// }

// /**
//  * Format a date with time (e.g., "05-06-2023 14:30")
//  * @param date - Date to format
//  * @returns Formatted date with time
//  */
// export function formatDateTime(date: string | Date | null | undefined): string {
//   return formatDate(date, 'dd-MM-yyyy HH:mm');
// }

// /**
//  * Truncate a string to a maximum length and add ellipsis if needed
//  * @param str - String to truncate
//  * @param maxLength - Maximum allowed length
//  * @returns Truncated string
//  */
// export function truncateString(str: string, maxLength: number): string {
//   if (!str) return '';
//   if (str.length <= maxLength) return str;
//   return str.substring(0, maxLength) + '...';
// }

// /**
//  * Generate a short ID (useful for temporary IDs)
//  * @returns A randomly generated short ID
//  */
// export function generateShortId(): string {
//   return Math.random().toString(36).substring(2, 10);
// }

// /**
//  * Format a phone number consistently
//  * @param phone - Phone number to format
//  * @returns Formatted phone number
//  */
// export function formatPhoneNumber(phone: string | null | undefined): string {
//   if (!phone) return '-';
  
//   // Format the phone number to add spacing
//   // Assuming Indonesian format, normalize to start with +62
//   let normalized = phone.trim();
//   if (normalized.startsWith('0')) {
//     normalized = '+62' + normalized.substring(1);
//   } else if (normalized.startsWith('62')) {
//     normalized = '+62' + normalized.substring(2);
//   } else if (!normalized.startsWith('+')) {
//     normalized = '+' + normalized;
//   }
  
//   return normalized;
// }

// /**
//  * Check if a string is a valid email format
//  * @param email - Email to validate
//  * @returns True if email is valid
//  */
// export function isValidEmail(email: string): boolean {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }

// /**
//  * Convert a value to a boolean 
//  * @param value - Value to convert
//  * @returns Converted boolean
//  */
// export function toBoolean(value: any): boolean {
//   if (typeof value === 'boolean') return value;
//   if (typeof value === 'string') {
//     const lowercased = value.toLowerCase();
//     return lowercased === 'true' || lowercased === 'yes' || lowercased === '1';
//   }
//   return Boolean(value);
// }

// /**
//  * Convert a number to a formatted string with thousands separators
//  * @param num - Number to format
//  * @returns Formatted number string
//  */
// export function formatNumber(num: number | string | null | undefined): string {
//   if (num === null || num === undefined || num === '') {
//     return '0';
//   }
  
//   const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
//   if (isNaN(numValue)) {
//     return '0';
//   }
  
//   return new Intl.NumberFormat('id-ID').format(numValue);
// }
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Combines multiple class names with Tailwind merge support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indonesian Rupiah currency
 * @param amount - Number to format as currency
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null | undefined, options?: {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string {
  if (amount === null || amount === undefined || amount === '') {
    return 'Rp 0';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 'Rp 0';
  }
  
  const {
    currency = 'IDR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options || {};
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numAmount);
}

/**
 * Format a date string or Date object to a readable format
 * @param date - Date to format (string in ISO format or Date object)
 * @param formatStr - Format string to use (defaults to dd-MM-yyyy)
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'dd-MM-yyyy'
): string {
  if (!date) {
    return '-';
  }
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: id });
  } catch (err) {
    console.error('Error formatting date:', err);
    return '-';
  }
}

/**
 * Format a date as a full date with day name (e.g., "Senin, 05 Juni 2023")
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatFullDate(date: string | Date | null | undefined): string {
  return formatDate(date, 'EEEE, dd MMMM yyyy');
}

/**
 * Format a date with time (e.g., "05-06-2023 14:30")
 * @param date - Date to format
 * @returns Formatted date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'dd-MM-yyyy HH:mm');
}

/**
 * Get the month name in Indonesian from a date
 * @param date - Date to extract month from
 * @returns Month name in Indonesian (Januari - Desember)
 */
export function getMonth(date: string | Date | null | undefined): string {
  if (!date) {
    return '-';
  }
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMMM', { locale: id });
  } catch (err) {
    console.error('Error getting month:', err);
    return '-';
  }
}

/**
 * Get the year from a date
 * @param date - Date to extract year from
 * @returns Year as a string
 */
export function getYear(date: string | Date | null | undefined): string {
  if (!date) {
    return '-';
  }
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy', { locale: id });
  } catch (err) {
    console.error('Error getting year:', err);
    return '-';
  }
}

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 * @param str - String to truncate
 * @param maxLength - Maximum allowed length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Generate a short ID (useful for temporary IDs)
 * @returns A randomly generated short ID
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Format a phone number consistently
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';
  
  // Format the phone number to add spacing
  // Assuming Indonesian format, normalize to start with +62
  let normalized = phone.trim();
  if (normalized.startsWith('0')) {
    normalized = '+62' + normalized.substring(1);
  } else if (normalized.startsWith('62')) {
    normalized = '+62' + normalized.substring(2);
  } else if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Check if a string is a valid email format
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Convert a value to a boolean 
 * @param value - Value to convert
 * @returns Converted boolean
 */
export function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    return lowercased === 'true' || lowercased === 'yes' || lowercased === '1';
  }
  return Boolean(value);
}

/**
 * Convert a number to a formatted string with thousands separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') {
    return '0';
  }
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat('id-ID').format(numValue);
}