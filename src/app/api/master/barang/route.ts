import { NextResponse } from 'next/server';
import { taxMasterBarang, taxDb } from '@/lib/db';


export async function GET() { 
    try {
        const refMasterBarang = await taxDb.select().from(taxMasterBarang);
        return NextResponse.json(refMasterBarang);
    } catch (error) {
        console.error('Error fetching kode master barang:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kode master barang' },
            { status: 500 }
        );
    }
}