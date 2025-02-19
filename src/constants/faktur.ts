import { DetailFakturData, FakturData } from "@/types/faktur";

export const INITIAL_FAKTUR_STATE: FakturData = {
  tanggal_faktur: '',
  jenis_faktur: 'Normal',
  kode_transaksi: '',
  keterangan_tambahan: '',
  dokumen_pendukung: '',
  referensi: '',
  cap_fasilitas: '',
  npwp_penjual: '',
  id_tku_penjual: '',
  npwp_nik_pembeli: '',
  jenis_id_pembeli: 'TIN',
  negara_pembeli: 'IDN',
  nomor_dokumen_pembeli: '',
  nama_pembeli: '',
  alamat_pembeli: '',
  email_pembeli: '',
  id_tku_pembeli: ''
};

export const INITIAL_DETAIL_STATE: DetailFakturData = {
  id_faktur: '',
  barang_or_jasa: '',
  kode_barang_jasa: '',
  nama_barang_or_jasa: '',
  nama_satuan_ukur: '',
  harga_satuan: '',
    jumlah_barang_jasa: '',
    jumlah_barang: '',
    jumlah_jasa: '',
  total_diskon: '0.00',
  dpp: '0.00',
  dpp_nilai_lain: '0.00',
  tarif_ppn: '12.00',
  ppn: '0.00',
  tarif_ppnbm: '0.00',
  ppnbm: '0.00'
};
