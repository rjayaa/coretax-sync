// src/lib/utils/calculations.ts

export const calculateDetailValues = (
  hargaSatuan: number,
  jumlahBarangJasa: number,
  totalDiskon: number = 0
) => {
  // Hitung total harga sebelum diskon
  const totalHarga = hargaSatuan * jumlahBarangJasa;
  
  // Hitung diskon (dalam persentase)
  const diskonNilai = (totalHarga * totalDiskon) / 100;
  
  // Hitung DPP (setelah diskon)
  const dpp = totalHarga - diskonNilai;
  
  // DPP Nilai Lain (defaultnya 0)
  const dpp_nilai_lain = 0;
  
  // Hitung PPN (12% dari DPP)
  const ppn = dpp * 0.12;
  
  return {
    dpp: parseFloat(dpp.toFixed(2)),
    dpp_nilai_lain: parseFloat(dpp_nilai_lain.toFixed(2)),
    ppn: parseFloat(ppn.toFixed(2))
  };
};

export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  
  // Jika tidak valid, kembalikan 0
  if (isNaN(value)) {
    return '0';
  }
  
  // Format dengan 2 desimal
  return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};