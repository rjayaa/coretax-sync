import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { taxMasterCompany } from '@/lib/db/schema';

export async function GET() {
  try {
    const company = await db.select().from(taxMasterCompany);
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}