// src/app/api/faktur/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { detailFaktur } from '@/lib/db/schema/detail-faktur';
import { desc, eq, between, and, sql } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query builder
    let query = taxDb.select().from(faktur);

    // Apply date filters if provided
    if (startDate && endDate) {
      query = query.where(
        and(
          between(faktur.tanggalFaktur, new Date(startDate), new Date(endDate))
        )
      );
    }

    // Get total count for pagination
    const countQuery = taxDb.select({ 
      count: sql<number>`cast(count(*) as unsigned)` 
    }).from(faktur);
    
    if (startDate && endDate) {
      countQuery.where(
        and(
          between(faktur.tanggalFaktur, new Date(startDate), new Date(endDate))
        )
      );
    }

    // Execute queries
    const [fakturs, [{ count }]] = await Promise.all([
      query
        .orderBy(desc(faktur.tanggalFaktur))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    return NextResponse.json({
      data: fakturs,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { header, details } = body;

    // Start transaction
    const result = await taxDb.transaction(async (tx) => {
      const fakturId = uuidv4();
      
      // Calculate totals
      const dppTotal = details.reduce((sum, item) => sum + Number(item.dpp), 0);
      const ppnTotal = details.reduce((sum, item) => sum + Number(item.ppn), 0);
      const ppnbmTotal = details.reduce((sum, item) => sum + (Number(item.ppnbm) || 0), 0);

      // Prepare faktur data
      const fakturData = {
        id: fakturId,
        nomorFaktur: header.nomorFaktur,
        npwpPenjual: header.npwpPenjual,
        tanggalFaktur: new Date(header.tanggalFaktur),
        jenisFaktur: header.jenisFaktur || 'Normal',
        kodeTransaksi: header.kodeTransaksi,
        keteranganTambahanKode: header.keteranganTambahanKode,
        capFasilitasKode: header.capFasilitasKode,
        nomorInvoice: header.nomorInvoice,
        idTkuPenjual: header.idTkuPenjual,
        npwpPembeli: header.npwpPembeli,
        jenisIdPembeli: header.jenisIdPembeli || 'TIN',
        namaPembeli: header.namaPembeli,
        alamatPembeli: header.alamatPembeli,
        emailPembeli: header.emailPembeli,
        idTkuPembeli: header.idTkuPembeli,
        dppTotal,
        ppnTotal,
        ppnbmTotal,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert faktur
      await tx.insert(faktur).values(fakturData);

      // Prepare and insert details
      const detailsData = details.map((detail, index) => ({
        id: uuidv4(),
        fakturId,
        nomorUrut: index + 1,
        barangJasa: detail.barangJasa,
        kodeBarangJasa: detail.kodeBarangJasa,
        namaBarangJasa: detail.namaBarangJasa,
        namaSatuanUkur: detail.namaSatuanUkur,
        hargaSatuan: detail.hargaSatuan,
        jumlah: detail.jumlah,
        hargaTotal: detail.hargaSatuan * detail.jumlah,
        diskon: detail.diskon || 0,
        dpp: detail.dpp,
        ppn: detail.ppn,
        tarifPpnbm: detail.tarifPpnbm || 0,
        ppnbm: detail.ppnbm || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await tx.insert(detailFaktur).values(detailsData);

      return {
        success: true,
        data: {
          id: fakturId,
          nomorFaktur: header.nomorFaktur,
          dppTotal,
          ppnTotal,
          ppnbmTotal
        }
      };
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create invoice'
      },
      { status: 500 }
    );
  }
}