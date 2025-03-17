// src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { taxMasterCustomer } from '@/lib/db/schema/master';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const refMasterCustomer = await db.select().from(taxMasterCustomer).orderBy(desc(taxMasterCustomer.id));
        return NextResponse.json(refMasterCustomer);
    } catch (error) {
        console.error('Error fetching kode master customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kode master customer' },
            { status: 500 }
        );
    }
}