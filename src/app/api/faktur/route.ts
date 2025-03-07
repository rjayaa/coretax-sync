// app/api/faktur/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { desc, eq, like, and, gte, lte, sql, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    
    // Date filter parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    // Base query
    let query = taxDb.select().from(faktur);
    
    // Apply search filter if it exists
    if (search) {
      query = query.where(
        or(
          like(faktur.referensi, `%${search}%`),
          like(faktur.nama_pembeli, `%${search}%`),
        ) 
      );
    }
    
    // Apply date filters with different scenarios
    if (startDate && endDate) {
      // Case 1: Both start and end dates are provided (date range)
      query = query.where(
        and(
          gte(faktur.tanggal_faktur, new Date(startDate)),
          lte(faktur.tanggal_faktur, new Date(endDate))
        )
      );
    } else if (year && month) {
      // Case 2: Year and month are provided
      const startOfMonth = new Date(`${year}-${month}-01`);
      
      // Calculate the end of month date
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endOfMonth = new Date(`${year}-${month}-${lastDay}`);
      endOfMonth.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          gte(faktur.tanggal_faktur, startOfMonth),
          lte(faktur.tanggal_faktur, endOfMonth)
        )
      );
    } else if (year) {
      // Case 3: Only year is provided (entire year)
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      endOfYear.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          gte(faktur.tanggal_faktur, startOfYear),
          lte(faktur.tanggal_faktur, endOfYear)
        )
      );
    } else if (month) {
      // Case 4: Only month is provided (current year's month)
      const currentYear = new Date().getFullYear();
      const startOfMonth = new Date(`${currentYear}-${month}-01`);
      
      // Calculate the end of month date
      const lastDay = new Date(currentYear, parseInt(month), 0).getDate();
      const endOfMonth = new Date(`${currentYear}-${month}-${lastDay}`);
      endOfMonth.setHours(23, 59, 59, 999);
      
      query = query.where(
        and(
          gte(faktur.tanggal_faktur, startOfMonth),
          lte(faktur.tanggal_faktur, endOfMonth)
        )
      );
    } else if (startDate) {
      // Case 5: Only start date is provided (from this date onwards)
      query = query.where(
        gte(faktur.tanggal_faktur, new Date(startDate))
      );
    } else if (endDate) {
      // Case 6: Only end date is provided (until this date)
      query = query.where(
        lte(faktur.tanggal_faktur, new Date(endDate))
      );
    }
    
    // Get total count for pagination with the same filters
    const countQuery = taxDb.select({ count: sql`COUNT(*)` }).from(faktur);
    
    // Apply the same date filters to the count query
    if (startDate && endDate) {
      countQuery.where(
        and(
          gte(faktur.tanggal_faktur, new Date(startDate)),
          lte(faktur.tanggal_faktur, new Date(endDate))
        )
      );
    } else if (year && month) {
      const startOfMonth = new Date(`${year}-${month}-01`);
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endOfMonth = new Date(`${year}-${month}-${lastDay}`);
      endOfMonth.setHours(23, 59, 59, 999);
      
      countQuery.where(
        and(
          gte(faktur.tanggal_faktur, startOfMonth),
          lte(faktur.tanggal_faktur, endOfMonth)
        )
      );
    } else if (year) {
      const startOfYear = new Date(`${year}-01-01`);
      const endOfYear = new Date(`${year}-12-31`);
      endOfYear.setHours(23, 59, 59, 999);
      
      countQuery.where(
        and(
          gte(faktur.tanggal_faktur, startOfYear),
          lte(faktur.tanggal_faktur, endOfYear)
        )
      );
    } else if (month) {
      const currentYear = new Date().getFullYear();
      const startOfMonth = new Date(`${currentYear}-${month}-01`);
      const lastDay = new Date(currentYear, parseInt(month), 0).getDate();
      const endOfMonth = new Date(`${currentYear}-${month}-${lastDay}`);
      endOfMonth.setHours(23, 59, 59, 999);
      
      countQuery.where(
        and(
          gte(faktur.tanggal_faktur, startOfMonth),
          lte(faktur.tanggal_faktur, endOfMonth)
        )
      );
    } else if (startDate) {
      countQuery.where(gte(faktur.tanggal_faktur, new Date(startDate)));
    } else if (endDate) {
      countQuery.where(lte(faktur.tanggal_faktur, new Date(endDate)));
    }
    
    // Execute count query
    const totalCount = await countQuery.execute();
    const total = totalCount[0]?.count || 0;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(Number(total) / limit);
    
    // Get data with pagination
    const fakturs = await query
      .orderBy(desc(faktur.tanggal_faktur))
      .limit(limit)
      .offset(offset)
      .execute();
    
    return NextResponse.json({
      fakturs,
      pagination: {
        total: Number(total),
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in faktur GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch fakturs' },
      { status: 500 }
    );
  }
}

// POST method remains unchanged
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the required fields
    if (!body.tanggal_faktur || !body.kode_transaksi || 
        !body.id_tku_penjual || !body.npwp_nik_pembeli || 
        !body.nama_pembeli || !body.alamat_pembeli) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a single UUID to use for both insertion and response
    const newId = uuidv4();

    // Insert with the generated ID
    const result = await taxDb.insert(faktur).values({
      id: newId,
      npwp_penjual: body.npwp_penjual,
      tanggal_faktur: new Date(body.tanggal_faktur),
      jenis_faktur: body.jenis_faktur || 'Normal',
      kode_transaksi: body.kode_transaksi,
      keterangan_tambahan: body.keterangan_tambahan || null,
      dokumen_pendukung: body.dokumen_pendukung || null,
      referensi: body.referensi || null,
      cap_fasilitas: body.cap_fasilitas || null,
      id_tku_penjual: body.id_tku_penjual,
      npwp_nik_pembeli: body.npwp_nik_pembeli,
      jenis_id_pembeli: body.jenis_id_pembeli || 'TIN',
      negara_pembeli: body.negara_pembeli || 'IDN',
      nomor_dokumen_pembeli: body.nomor_dokumen_pembeli || null,
      nama_pembeli: body.nama_pembeli,
      alamat_pembeli: body.alamat_pembeli,
      email_pembeli: body.email_pembeli || null,
      nomor_faktur_pajak: body.nomor_faktur_pajak,
      tipe_transaksi: body.tipe_transaksi,
      id_tku_pembeli: body.id_tku_pembeli
    });

    // Return the body with the same ID that was used for insertion
    return NextResponse.json({...body, id: newId});
  } catch (error) {
    console.error('Error in faktur POST:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create faktur' },
      { status: 500 }
    );
  }
}