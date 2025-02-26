// Format date strings for display
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '-';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return '-';
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Format currency for display
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Rp 0';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

// Format NPWP for display
export function formatNPWP(npwp: string): string {
  if (!npwp) return '-';
  
  // Remove all non-numeric characters
  const numbers = npwp.replace(/\D/g, '');
  
  if (numbers.length !== 15) return npwp; // Return original if not 15 digits
  
  // Format as XX.XXX.XXX.X-XXX.XXX
  return `${numbers.substring(0, 2)}.${numbers.substring(2, 5)}.${numbers.substring(5, 8)}.${numbers.substring(8, 9)}-${numbers.substring(9, 12)}.${numbers.substring(12)}`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}

// Format percentage
export function formatPercentage(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0%';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) return '0%';
  
  return `${numericValue.toFixed(2)}%`;
}

// Convert ISO date to form input date format (YYYY-MM-DD)
export function dateToInputFormat(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
}

// Format faktur status
export function formatFakturStatus(status: string): string {
  switch (status) {
    case 'Normal':
      return 'Normal';
    case 'Pengganti':
      return 'Pengganti';
    case 'Batal':
      return 'Dibatalkan';
    default:
      return status;
  }
}

// Convert string to number safely
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return isNaN(numericValue) ? 0 : numericValue;
}

// Format diskon
export function formatDiskon(diskon: string | number | null | undefined): string {
  if (diskon === null || diskon === undefined || diskon === '') return '0%';
  
  const numericValue = typeof diskon === 'string' ? parseFloat(diskon) : diskon;
  
  if (isNaN(numericValue)) return '0%';
  
  return `${numericValue.toFixed(2)}%`;
}