// src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { taxMasterCustomer } from '@/lib/db/schema/master';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const refMasterCustomer = await taxDb.select().from(taxMasterCustomer).orderBy(desc(taxMasterCustomer.id));
        return NextResponse.json(refMasterCustomer);
    } catch (error) {
        console.error('Error fetching kode master customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kode master customer' },
            { status: 500 }
        );
    }
}