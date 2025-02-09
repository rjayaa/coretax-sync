// src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { taxMasterCustomer } from '@/lib/db/schema/master';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Debug: log untuk memastikan koneksi DB
    // console.log('Fetching customers...');

    const customers = await taxDb
      .select()
      .from(taxMasterCustomer)
      .orderBy(desc(taxMasterCustomer.nama));

    // console.log('Customers fetched:', customers); // Debug log

    if (!customers) {
      return NextResponse.json({ 
        success: false,
        error: 'No customers found',
        data: [] 
      });
    }

    return NextResponse.json({ 
      success: true,
      data: customers 
    });

  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch customers',
        data: [] 
      },
      { status: 500 }
    );
  }
}