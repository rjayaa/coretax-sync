// src/lib/utils/validation.ts
import { FakturData, DetailFakturData } from '@/types/faktur';

export const validateFakturData = (data: FakturData) => {
  const errors: Partial<Record<keyof FakturData, string>> = {};

  // Enhanced validation - check all required fields
  if (!data.npwp_penjual) {
    errors.npwp_penjual = 'NPWP Penjual harus diisi';
  }

  if (!data.tanggal_faktur) {
    errors.tanggal_faktur = 'Tanggal faktur harus diisi';
  }

  if (!data.kode_transaksi) {
    errors.kode_transaksi = 'Kode transaksi harus diisi';
  }

  if (!data.npwp_nik_pembeli) {
    errors.npwp_nik_pembeli = 'NPWP/NIK Pembeli harus diisi';
  }

  if (!data.nama_pembeli) {
    errors.nama_pembeli = 'Nama Pembeli harus diisi';
  }

  if (!data.alamat_pembeli) {
    errors.alamat_pembeli = 'Alamat Pembeli harus diisi';
  }

  if (!data.id_tku_penjual) {
    errors.id_tku_penjual = 'ID TKU Penjual harus diisi';
  }

  if (!data.id_tku_pembeli) {
    errors.id_tku_pembeli = 'ID TKU Pembeli harus diisi';
  }

  if (!data.jenis_faktur) {
    errors.jenis_faktur = 'Jenis Faktur harus diisi';
  }

  if (!data.jenis_id_pembeli) {
    errors.jenis_id_pembeli = 'Jenis ID Pembeli harus diisi';
  }

  if (!data.negara_pembeli) {
    errors.negara_pembeli = 'Negara Pembeli harus diisi';
  }

  if (!data.tipe_transaksi) {
    errors.tipe_transaksi = 'Tipe Transaksi harus diisi';
  }

  // Add proper format validation for specific fields
  if (data.npwp_penjual && !/^\d{15,16}$/.test(data.npwp_penjual.replace(/[.-]/g, ''))) {
    errors.npwp_penjual = 'Format NPWP tidak valid';
  }

  return errors;
};

export const validateDetailData = (data: DetailFakturData) => {
  const errors: Partial<Record<keyof DetailFakturData, string>> = {};

  // Validasi field wajib
  if (!data.barang_or_jasa) {
    errors.barang_or_jasa = 'Pilih tipe barang atau jasa';
  }

  if (!data.nama_barang_or_jasa) {
    errors.nama_barang_or_jasa = 'Nama barang/jasa harus diisi';
  }

  if (!data.nama_satuan_ukur) {
    errors.nama_satuan_ukur = 'Satuan ukur harus diisi';
  }

  if (!data.harga_satuan || parseFloat(data.harga_satuan) <= 0) {
    errors.harga_satuan = 'Harga satuan harus lebih dari 0';
  }

  if (!data.jumlah_barang_jasa || parseFloat(data.jumlah_barang_jasa) <= 0) {
    errors.jumlah_barang_jasa = 'Kuantitas harus lebih dari 0';
  }

  return errors;
};