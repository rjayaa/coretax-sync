import { NextResponse } from 'next/server';
import {  satuanUkur, db } from '@/lib/db';



export async function GET() {
    try {
        const refSatuanUkur = await db.select().from(satuanUkur);
        return NextResponse.json(refSatuanUkur);
    } catch (error) {
        console.error('Error fetching kode satuan ukur:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kode satuan ukur' },
            { status: 500 }
        );
    }
}