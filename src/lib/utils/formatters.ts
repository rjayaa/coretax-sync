import type { taxMasterCustomer } from '@/lib/db/schema/master'
type Customer = typeof taxMasterCustomer.$inferSelect
export const formatCurrency = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numAmount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const  formatAlamat = (customer: Customer): string => {
  const parts = [];

  // Alamat baris 1: Jalan, Blok, Nomor
  const alamatBaris1 = [
    customer.jalan,
    customer.blok && `Blok ${customer.blok}`,
    customer.nomor && `No. ${customer.nomor}`
  ].filter(Boolean).join(', ');
  if (alamatBaris1) parts.push(alamatBaris1);

  // Alamat baris 2: RT/RW
  if (customer.rt || customer.rw) {
    const rtRw = [
      customer.rt && `RT ${customer.rt}`,
      customer.rw && `RW ${customer.rw}`
    ].filter(Boolean).join('/');
    parts.push(rtRw);
  }

  // Alamat baris 3: Kelurahan, Kecamatan
  const alamatBaris3 = [
    customer.kelurahan && `Kel. ${customer.kelurahan}`,
    customer.kecamatan && `Kec. ${customer.kecamatan}`
  ].filter(Boolean).join(', ');
  if (alamatBaris3) parts.push(alamatBaris3);

  // Alamat baris 4: Kabupaten, Propinsi, Kode Pos
  const alamatBaris4 = [
    customer.kabupaten,
    customer.propinsi,
    customer.kode_pos
  ].filter(Boolean).join(', ');
  if (alamatBaris4) parts.push(alamatBaris4);

  return parts.join('\n');
}