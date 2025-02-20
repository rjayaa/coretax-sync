import { NextResponse } from 'next/server';
import { taxMasterJasa, taxDb } from '@/lib/db';


export async function GET() { 
    try {
        const refMasterJasa = await taxDb.select().from(taxMasterJasa);
        return NextResponse.json(refMasterJasa);
    } catch (error) {
        console.error('Error fetching kode master jasa:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kode master jasa' },
            { status: 500 }
        );
    }
}