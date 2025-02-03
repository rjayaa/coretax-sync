//src/app/api/faktur/export/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { detailFaktur } from '@/lib/db/schema/detail-faktur';
import { between, and, inArray as inSql } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    // Validasi session
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Fetch faktur data
    const fakturs = await taxDb.select()
      .from(faktur)
      .where(
        and(
          between(faktur.tanggalFaktur, new Date(startDate), new Date(endDate))
        )
      );

    if (fakturs.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the selected date range' },
        { status: 404 }
      );
    }

    // Fetch details data
    const details = await taxDb.select()
      .from(detailFaktur)
      .where(
        inSql(
          detailFaktur.fakturId,
          fakturs.map(f => f.id)
        )
      );

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Faktur
    const fakturHeaders = {
      A1: { 
        v: 'NPWP Penjual',
        s: { font: { bold: true } }
      },
      C1: { v: fakturs[0]?.npwpPenjual || '' },
      A3: { v: 'Baris' },
      B3: { v: 'Tanggal Faktur' },
      C3: { v: 'Jenis Faktur' },
      D3: { v: 'Kode Transaksi' },
      E3: { v: 'Keterangan Tambahan' },
      F3: { v: 'Nomor Invoice' },
      G3: { v: 'Cap Fasilitas' },
      H3: { v: 'ID TKU Penjual' },
      I3: { v: 'NPWP Pembeli' },
      J3: { v: 'Jenis ID Pembeli' },
      K3: { v: 'Nama Pembeli' },
      L3: { v: 'Alamat Pembeli' },
      M3: { v: 'Email Pembeli' },
      N3: { v: 'ID TKU Pembeli' }
    };

    // Configure merges
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
    ];

    // Create Faktur data rows
    const fakturData = fakturs.reduce((acc, f, index) => {
      const rowNum = index + 4;
      return {
        ...acc,
        [`A${rowNum}`]: { v: (index + 1).toString() },
        [`B${rowNum}`]: { v: f.tanggalFaktur },
        [`C${rowNum}`]: { v: f.jenisFaktur },
        [`D${rowNum}`]: { v: f.kodeTransaksi },
        [`E${rowNum}`]: { v: f.keteranganTambahanKode || '' },
        [`F${rowNum}`]: { v: f.nomorInvoice },
        [`G${rowNum}`]: { v: f.capFasilitasKode || '' },
        [`H${rowNum}`]: { v: f.idTkuPenjual || '' },
        [`I${rowNum}`]: { v: f.npwpPembeli },
        [`J${rowNum}`]: { v: f.jenisIdPembeli },
        [`K${rowNum}`]: { v: f.namaPembeli },
        [`L${rowNum}`]: { v: f.alamatPembeli },
        [`M${rowNum}`]: { v: f.emailPembeli || '' },
        [`N${rowNum}`]: { v: f.idTkuPembeli || '' }
      };
    }, {});

    // Add END marker
    const endRow = fakturs.length + 4;
    fakturData[`A${endRow}`] = { v: 'END' };

    // Combine headers and data
    const wsFaktur = {
      ...fakturHeaders,
      ...fakturData,
      '!ref': `A1:N${endRow}`,
      '!merges': merges
    };

    XLSX.utils.book_append_sheet(workbook, wsFaktur, 'Faktur');

    // Sheet 2: DetailFaktur
    const detailHeaders = {
      A1: { v: 'Baris' },
      B1: { v: 'Barang/Jasa' },
      C1: { v: 'Kode Barang/Jasa' },
      D1: { v: 'Nama Barang/Jasa' },
      E1: { v: 'Satuan' },
      F1: { v: 'Harga Satuan' },
      G1: { v: 'Jumlah' },
      H1: { v: 'Total Harga' },
      I1: { v: 'Diskon' },
      J1: { v: 'DPP' },
      K1: { v: 'PPN' },
      L1: { v: 'Tarif PPnBM' },
      M1: { v: 'PPnBM' }
    };

    // Create DetailFaktur data rows
    const detailData = details.reduce((acc, d, index) => {
      const rowNum = index + 2;
      return {
        ...acc,
        [`A${rowNum}`]: { v: (index + 1).toString() },
        [`B${rowNum}`]: { v: d.barangJasa },
        [`C${rowNum}`]: { v: d.kodeBarangJasa },
        [`D${rowNum}`]: { v: d.namaBarangJasa },
        [`E${rowNum}`]: { v: d.namaSatuanUkur },
        [`F${rowNum}`]: { v: d.hargaSatuan },
        [`G${rowNum}`]: { v: d.jumlah },
        [`H${rowNum}`]: { v: d.hargaTotal },
        [`I${rowNum}`]: { v: d.diskon || 0 },
        [`J${rowNum}`]: { v: d.dpp },
        [`K${rowNum}`]: { v: d.ppn },
        [`L${rowNum}`]: { v: d.tarifPpnbm || 0 },
        [`M${rowNum}`]: { v: d.ppnbm || 0 }
      };
    }, {});

    // Add END marker
    const detailEndRow = details.length + 2;
    detailData[`A${detailEndRow}`] = { v: 'END' };

    // Combine headers and data
    const wsDetail = {
      ...detailHeaders,
      ...detailData,
      '!ref': `A1:M${detailEndRow}`
    };

    XLSX.utils.book_append_sheet(workbook, wsDetail, 'DetailFaktur');

    // Load template untuk REF dan Keterangan
    const templatePath = path.join(process.cwd(), 'public', 'template', 'template.xlsx');
    const templateFile = await fs.readFile(templatePath);
    const template = XLSX.read(templateFile);

    // Copy REF sheet
    const wsRef = template.Sheets['REF'];
    XLSX.utils.book_append_sheet(workbook, wsRef, 'REF');

    // Copy Keterangan sheet
    const wsKeterangan = template.Sheets['Keterangan'];
    XLSX.utils.book_append_sheet(workbook, wsKeterangan, 'Keterangan');

    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false
    });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Faktur_${startDate}_${endDate}.xlsx`
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}