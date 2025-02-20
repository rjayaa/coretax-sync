import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { taxMasterCompany } from '@/lib/db/schema';

export async function GET() {
  try {
    const company = await taxDb.select().from(taxMasterCompany);
    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}