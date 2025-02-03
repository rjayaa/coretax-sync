// src/lib/utils/invoice-export.ts

import { InvoiceHeader, InvoiceExport, ItemExport, Item, Customer } from '@/types/tax-invoice';

export function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatNumber(num: number): string {
  return num.toFixed(2).replace('.', ',');
}

export function prepareInvoiceExport(
  invoice: InvoiceHeader, 
  customer: Customer,
  items: Item[]
): { header: InvoiceExport; details: ItemExport[] } {
  // Prepare header export
  const totalDPP = items.reduce((sum, item) => sum + item.dpp, 0);
  const totalPPN = items.reduce((sum, item) => sum + item.ppn, 0);
  const totalPPNBM = items.reduce((sum, item) => sum + (item.ppnbm || 0), 0);

  const header: InvoiceExport = {
    FK: invoice.transaction_code,
    KD_JENIS_TRANSAKSI: getTransactionCode(invoice.transaction_type),
    FG_PENGGANTI: '0', // Default untuk faktur normal
    NOMOR_FAKTUR: invoice.transaction_code,
    TANGGAL_FAKTUR: formatDate(invoice.invoice_date),
    NPWP: customer.npwp.replace(/[.-]/g, ''),
    NAMA: customer.nama,
    ALAMAT_LENGKAP: customer.alamatLengkap,
    DPP: formatNumber(totalDPP),
    PPN: formatNumber(totalPPN),
    PPNBM: totalPPNBM > 0 ? formatNumber(totalPPNBM) : '',
    IS_CREDITABLE: '1',
    REFERENSI: invoice.reference || ''
  };

  // Prepare detail exports
  const details: ItemExport[] = items.map(item => ({
    FK: invoice.transaction_code,
    KD_JENIS_TRANSAKSI: getTransactionCode(invoice.transaction_type),
    FG_PENGGANTI: '0',
    NOMOR_FAKTUR: invoice.transaction_code,
    NAMA_BARANG: item.item_name,
    HARGA_SATUAN: formatNumber(item.unit_price),
    JUMLAH_BARANG: formatNumber(item.quantity),
    HARGA_TOTAL: formatNumber(item.total_price),
    DISKON: formatNumber(item.discount || 0),
    DPP: formatNumber(item.dpp),
    PPN: formatNumber(item.ppn),
    TARIF_PPNBM: item.ppnbm_rate ? formatNumber(item.ppnbm_rate) : '0',
    PPNBM: item.ppnbm ? formatNumber(item.ppnbm) : '0'
  }));

  return { header, details };
}

function getTransactionCode(type: string): string {
  switch (type) {
    case 'FULL_PAYMENT':
      return '01';
    case 'DOWN_PAYMENT':
      return '02';
    case 'REMAINING_PAYMENT':
      return '03';
    default:
      return '01';
  }
}

export async function exportInvoicesToCSV(invoices: InvoiceHeader[]): Promise<Blob[]> {
  const headerRows: InvoiceExport[] = [];
  const detailRows: ItemExport[] = [];

  for (const invoice of invoices) {
    // Fetch related data
    const [customerRes, itemsRes] = await Promise.all([
      fetch(`/api/customers/${invoice.customer_id}`),
      fetch(`/api/invoices/${invoice.id}/items`)
    ]);

    const customer = await customerRes.json();
    const items = await itemsRes.json();

    const { header, details } = prepareInvoiceExport(invoice, customer.data, items.data);
    headerRows.push(header);
    detailRows.push(...details);
  }

  // Create CSV content for headers
  const headerCSV = [
    Object.keys(headerRows[0]).join(';'),
    ...headerRows.map(row => Object.values(row).join(';'))
  ].join('\n');

  // Create CSV content for details
  const detailCSV = [
    Object.keys(detailRows[0]).join(';'),
    ...detailRows.map(row => Object.values(row).join(';'))
  ].join('\n');

  // Convert to Blobs
  const headerBlob = new Blob([headerCSV], { type: 'text/csv;charset=utf-8;' });
  const detailBlob = new Blob([detailCSV], { type: 'text/csv;charset=utf-8;' });

  return [headerBlob, detailBlob];
}