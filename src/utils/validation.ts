import { DetailFakturData, FakturData } from "@/types/faktur";

export const validateFakturData = (data: FakturData) => {
  const errors: Partial<Record<keyof FakturData, string>> = {};
  
  const requiredFields: (keyof FakturData)[] = [
    'npwp_penjual',
    'tanggal_faktur',
    'kode_transaksi',
    'id_tku_penjual',
    'npwp_nik_pembeli',
    'nama_pembeli',
    'alamat_pembeli'
  ];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors[field] = `${field.replace(/_/g, ' ')} harus diisi`;
    }
  });

  return errors;
};

export const validateDetailData = (data: DetailFakturData) => {
  const errors: Partial<Record<keyof DetailFakturData, string>> = {};

  if (!data.barang_or_jasa) {
    errors.barang_or_jasa = 'Pilih jenis barang/jasa';
  }

  if (!data.nama_barang_jasa) {
    errors.nama_barang_jasa = 'Nama barang/jasa harus diisi';
  }

  if (!data.nama_satuan_ukur) {
    errors.nama_satuan_ukur = 'Satuan ukur harus diisi';
  }

  if (!data.harga_satuan || parseFloat(data.harga_satuan) <= 0) {
    errors.harga_satuan = 'Harga satuan harus lebih dari 0';
  }

  if (!data.jumlah_barang_jasa || parseFloat(data.jumlah_barang_jasa) <= 0) {
    errors.jumlah_barang_jasa = 'Jumlah harus lebih dari 0';
  }

  return errors;
};