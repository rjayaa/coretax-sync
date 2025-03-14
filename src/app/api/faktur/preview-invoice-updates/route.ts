// src/app/api/faktur/preview-invoice-updates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { previewInvoiceNumberUpdates } from '@/lib/utils/advanced-invoice-updater';

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
    
    // Preview the updates
    const previewResult = await previewInvoiceNumberUpdates(fileBuffer);

    return NextResponse.json(previewResult);
  } catch (error) {
    console.error('Error previewing invoice updates:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred while processing the file' },
      { status: 500 }
    );
  }
}
