export const calculateDetailValues = (
  hargaSatuan: number,
  jumlah: number,
  diskonPersen: number
) => {
  const subtotal = hargaSatuan * jumlah;
  const diskon = (subtotal * diskonPersen) / 100;
  const dpp = subtotal - diskon;
  // const dppNilaiLain = (dpp * 11) / 12;
  const dppNilaiLain = dpp * 0.71875;
  const ppn = dppNilaiLain * 0.12;

  return {
    dpp: dpp.toFixed(2),
    dpp_nilai_lain: dppNilaiLain.toFixed(2),
    ppn: ppn.toFixed(2)
  };
};
