// app/api/faktur/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { desc, eq, like } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Base query
    let query = taxDb.select().from(faktur);
    
    // Apply filters if they exist
    if (search) {
      query = query.where(
        like(faktur.nama_pembeli, `%${search}%`)
      );
    }
    
    if (startDate && endDate) {
      query = query.where(
        faktur.tanggal_faktur >= new Date(startDate) &&
        faktur.tanggal_faktur <= new Date(endDate)
      );
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const totalRows = await taxDb
      .select({ count: faktur.id })
      .from(faktur)
      .execute();
    
    // Get data with pagination
    const fakturs = await query
      .orderBy(desc(faktur.tanggal_faktur))
      .limit(limit)
      .offset(offset)
      .execute();
    
    return NextResponse.json({
      fakturs,
      pagination: {
        total: totalRows.length,
        page,
        limit,
        totalPages: Math.ceil(totalRows.length / limit)
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