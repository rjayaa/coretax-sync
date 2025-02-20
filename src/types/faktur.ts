export interface FakturData {
npwp_penjual: string;
  tanggal_faktur: string;
  jenis_faktur: string;
  kode_transaksi: string;
  keterangan_tambahan: string;
  dokumen_pendukung: string;
  referensi: string;
  cap_fasilitas: string;
  id_tku_penjual: string;
  npwp_nik_pembeli: string;
  jenis_id_pembeli: string;
  negara_pembeli: string;
  nomor_dokumen_pembeli: string;
  nama_pembeli: string;
  alamat_pembeli: string;
  email_pembeli: string;
  id_tku_pembeli: string;
}

export interface DetailFakturData {
  id_faktur: string;
  barang_or_jasa: string;
  kode_barang_or_jasa: string;
  nama_barang_or_jasa: string;
  nama_satuan_ukur: string;
  harga_satuan: string;
  jumlah_barang_jasa: string;
    jumlah_barang: string;
    jumlah_jasa: string;
  total_diskon: string;
  dpp: string;
  dpp_nilai_lain: string;
  tarif_ppn: string;
  ppn: string;
  tarif_ppnbm: string;
  ppnbm: string;
}