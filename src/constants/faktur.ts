// src/constants/faktur.ts
import { FakturData, DetailFakturData } from '@/types/faktur';

export const INITIAL_FAKTUR_STATE: FakturData = {
  npwp_penjual: '',
  tanggal_faktur: new Date().toISOString().split('T')[0],
  jenis_faktur: 'Normal',
  kode_transaksi: '',
  keterangan_tambahan: '',
  dokumen_pendukung: '',
  referensi: '',
  cap_fasilitas: '',
  id_tku_penjual: '',
  npwp_nik_pembeli: '',
  jenis_id_pembeli: 'TIN',
  negara_pembeli: 'IDN',
  nomor_dokumen_pembeli: '',
  nama_pembeli: '',
  alamat_pembeli: '',
  id_tku_pembeli: '',
  nomor_faktur_pajak: '',
  tipe_transaksi: 'uang_muka'
};

export const INITIAL_DETAIL_STATE: DetailFakturData = {
  id_faktur: '',
  barang_or_jasa: '',
  kode_barang_or_jasa: '',
  nama_barang_or_jasa: '',
  nama_satuan_ukur: '',
  harga_satuan: '0',
  jumlah_barang_jasa: '0',
  jumlah_barang: '0',
  jumlah_jasa: '0',
  total_diskon: '0',
  dpp: '0',
  dpp_nilai_lain: '0',
  tarif_ppn: '12.00',
  ppn: '0',
  tarif_ppnbm: '0',
  ppnbm: '0'
};