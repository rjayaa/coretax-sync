// // Format utilities
// export const formatCurrency = (value: string): string => {
//   // Hapus karakter non-digit
//   const numericValue = value.replace(/\D/g, '')
//   if (!numericValue) return ''
  
//   // Format dengan pemisah ribuan
//   return new Intl.NumberFormat('id-ID').format(Number(numericValue))
// }

// export const formatTaxResult = (value: number): string => {
//   return new Intl.NumberFormat('id-ID', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }).format(value)
// }


// export const parseCurrency = (formattedValue: string): number => {
//   // Hapus semua karakter non-digit
//   return Number(formattedValue.replace(/[^\d]/g, ''))
// }


// lib/utils/formatCurrency.ts

// Format angka menjadi format currency Indonesia tanpa simbol mata uang
export const formatCurrency = (value: string): string => {
  // Hapus karakter non-digit
  const numericValue = value.replace(/\D/g, '')
  if (!numericValue) return ''
  
  // Format dengan pemisah ribuan
  return new Intl.NumberFormat('id-ID').format(Number(numericValue))
}

// Format khusus untuk hasil kalkulasi pajak (dengan 2 desimal)
export const formatTaxResult = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Parse string format currency menjadi number
export const parseCurrency = (formattedValue: string): number => {
  // Hapus semua karakter non-digit
  return Number(formattedValue.replace(/[^\d]/g, ''))
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