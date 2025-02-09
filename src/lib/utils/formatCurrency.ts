

// lib/utils/formatCurrency.ts

// Format angka menjadi format currency Indonesia tanpa simbol mata uang
// src/lib/utils/formatCurrency.ts
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Konversi ke number jika input string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Handle NaN
  if (isNaN(numValue)) {
    return '';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Hapus semua karakter non-digit
  const numStr = value.replace(/[^\d-]/g, '');
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed;
};
// Format khusus untuk hasil kalkulasi pajak (dengan 2 desimal)
export const formatTaxResult = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}


// Pembulatan ke 2 angka desimal
export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

// Format untuk tampilan di tabel atau display (dengan simbol mata uang)
export const formatDisplayCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format untuk export ke CSV (tanpa simbol mata uang, dengan desimal)
export const formatExportCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false // Tanpa pemisah ribuan
  }).format(value)
}