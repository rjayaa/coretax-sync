
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq , inArray} from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get faktur ID from query params
    const { searchParams } = new URL(request.url);
    const fakturId = searchParams.get('fakturId');
    
    console.log("GET - Fetching details for fakturId:", fakturId);
    
    if (!fakturId) {
      return NextResponse.json(
        { error: 'Missing fakturId parameter' },
        { status: 400 }
      );
    }
    
    // Query detail records for this faktur
    const details = await db
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, fakturId))
      .execute();
    
    console.log(`Found ${details.length} detail records for faktur ${fakturId}`);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error in detail-faktur GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch detail faktur' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // console.log('Received request for faktur details:', body);

    // Validate the request body
    if (!body.fakturIds || !Array.isArray(body.fakturIds) || body.fakturIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing fakturIds. Expected non-empty array.' },
        { status: 400 }
      );
    }

    // Query detail records for these fakturs
    const details = await db
      .select()
      .from(fakturDetail)
      .where(inArray(fakturDetail.id_faktur, body.fakturIds))
      .execute();
    
    console.log(`Found ${details.length} detail records for ${body.fakturIds.length} fakturs`);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error in faktur/details POST:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch faktur details' },
      { status: 500 }
    );
  }
}