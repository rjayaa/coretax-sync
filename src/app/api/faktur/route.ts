//src/app/api/faktur/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { desc, sql, and, eq, like, or, isNull, not, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';


export async function GET(req: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const synced = url.searchParams.get('synced');
    const search = url.searchParams.get('search');
    
    // Get company NPWP filter
    const npwpPenjual = url.searchParams.get('npwp_penjual') || 
                        url.searchParams.get('npwp_company') ||
                        url.searchParams.get('company_npwp');
    
    // Parse date range parameters (check multiple possible parameter names)
    const startDate = url.searchParams.get('tanggalMulai') || 
                      url.searchParams.get('startDate') || 
                      url.searchParams.get('start_date') ||
                      url.searchParams.get('tanggal_faktur_start');
                      
    const endDate = url.searchParams.get('tanggalAkhir') || 
                    url.searchParams.get('endDate') || 
                    url.searchParams.get('end_date') ||
                    url.searchParams.get('tanggal_faktur_end');
    
    // Log all parameters for debugging
    // console.log('Filter parameters:', {
    //   page, limit, status, synced, search, 
    //   startDate, endDate, npwpPenjual,
    //   rawParams: Object.fromEntries(url.searchParams.entries())
    // });
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [] as any[];
    
    if (status) {
      conditions.push(eq(faktur.status_faktur, status));
    }
    
    if (synced === 'yes') {
      conditions.push(not(isNull(faktur.coretax_record_id)));
    } else if (synced === 'no') {
      conditions.push(isNull(faktur.coretax_record_id));
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(faktur.referensi, searchTerm),
          like(faktur.nama_pembeli, searchTerm),
          like(faktur.npwp_nik_pembeli, searchTerm)
        )
      );
    }
    
    // Filter by company NPWP
    if (npwpPenjual) {
      conditions.push(eq(faktur.npwp_penjual, npwpPenjual));
    }
    
    // Add date range conditions
    if (startDate) {
      try {
        // Use native SQL for more reliable date comparison
        conditions.push(sql`DATE(${faktur.tanggal_faktur}) >= ${startDate}`);
      } catch (err) {
        console.error('Error with start date filter:', err);
      }
    }
    
    if (endDate) {
      try {
        // Use native SQL for more reliable date comparison
        conditions.push(sql`DATE(${faktur.tanggal_faktur}) <= ${endDate}`);
      } catch (err) {
        console.error('Error with end date filter:', err);
      }
    }
    
    // Log the final conditions for debugging
    console.log('Query conditions:', conditions);
    
    // Count total records with filters
    const totalQuery = db.select({ count: sql`COUNT(*)` }).from(faktur);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    const totalResult = await totalQuery;
    const total = totalResult[0].count;
    
    // Fetch records with pagination
    const query = db.select({
      id: faktur.id,
      referensi: faktur.referensi,
      tanggal_faktur: faktur.tanggal_faktur,
      nama_pembeli: faktur.nama_pembeli,
      npwp_nik_pembeli: faktur.npwp_nik_pembeli,
      kode_transaksi: faktur.kode_transaksi,
      status_faktur: faktur.status_faktur,
      nomor_faktur_pajak: faktur.nomor_faktur_pajak,
      is_uploaded_to_coretax: faktur.is_uploaded_to_coretax
    }).from(faktur);
    
    // Apply filters
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    // Apply pagination
    const fakturs = await query
      .orderBy(desc(faktur.tanggal_faktur)) // Changed to order by tanggal_faktur instead of createdAt
      .limit(limit)
      .offset(offset);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      fakturs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Error fetching faktur list:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received faktur data:', JSON.stringify(data, null, 2));
    
    // Enhanced validation with more specific error messages
    const requiredFields = [
      'tanggal_faktur', 'kode_transaksi', 'nama_pembeli',
      'alamat_pembeli', 'npwp_nik_pembeli', 'id_tku_penjual',
      'id_tku_pembeli'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Data faktur tidak lengkap', 
          missingFields: missingFields.join(', ') 
        },
        { status: 400 }
      );
    }
    
    // Generate UUID for faktur baru
    const newId = uuidv4();
    
    // Ensure date is properly parsed
    let tanggalFaktur;
    try {
      tanggalFaktur = new Date(data.tanggal_faktur);
      if (isNaN(tanggalFaktur.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Format tanggal faktur tidak valid' },
        { status: 400 }
      );
    }
    
    // Ensure enum values match the schema
    const tipeTransaksi = ['Uang Muka', 'Pelunasan'].includes(data.tipe_transaksi)
      ? data.tipe_transaksi
      : 'Uang Muka'; // Default with correct case
    
    // Ensure jenis_faktur is valid  
    const jenisFaktur = ['Normal', 'Pengganti'].includes(data.jenis_faktur)
      ? data.jenis_faktur
      : 'Normal';
    
    // Prepare data with proper types and defaults
    const fakturData = {
      id: newId,
      npwp_penjual: data.npwp_penjual || '',
      tanggal_faktur: tanggalFaktur,
      jenis_faktur: jenisFaktur,
      kode_transaksi: data.kode_transaksi,
      keterangan_tambahan: data.keterangan_tambahan || '',
      dokumen_pendukung: data.dokumen_pendukung || '',
      referensi: data.referensi || '',
      cap_fasilitas: data.cap_fasilitas || '',
      id_tku_penjual: data.id_tku_penjual,
      npwp_nik_pembeli: data.npwp_nik_pembeli,
      jenis_id_pembeli: data.jenis_id_pembeli || 'TIN',
      negara_pembeli: data.negara_pembeli || 'IDN',
      nomor_dokumen_pembeli: data.nomor_dokumen_pembeli || '',
      nama_pembeli: data.nama_pembeli,
      alamat_pembeli: data.alamat_pembeli,
      id_tku_pembeli: data.id_tku_pembeli,
      nomor_faktur_pajak: data.nomor_faktur_pajak || '',
      status_faktur: 'CREATED',
      tipe_transaksi: tipeTransaksi,
      is_uploaded_to_coretax: false,
    };
    
    console.log('Inserting faktur data:', JSON.stringify(fakturData, null, 2));
    
    // Insert data ke database
    await db.insert(faktur).values(fakturData);
    
    // Format tanggal untuk respon
    const responseData = {
      ...fakturData,
      tanggal_faktur: fakturData.tanggal_faktur.toISOString().split('T')[0],
    };
    
    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating faktur:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat faktur' },
      { status: 500 }
    );
  }
}