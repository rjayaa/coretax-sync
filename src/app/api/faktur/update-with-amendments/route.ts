
// src/app/api/faktur/update-with-amendments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateInvoicesWithAmendments } from '@/lib/utils/invoice-amendment-handler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { message: 'Invalid file format. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Update invoices with amendments
    const updateStats = await updateInvoicesWithAmendments(fileBuffer);

    return NextResponse.json(updateStats);
  } catch (error) {
    console.error('Error updating invoices with amendments:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred while processing the file' },
      { status: 500 }
    );
  }
}
