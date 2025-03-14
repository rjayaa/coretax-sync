
// src/app/api/faktur/apply-invoice-updates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applyInvoiceNumberUpdates } from '@/lib/utils/advanced-invoice-updater';

export async function POST(request: NextRequest) {
  try {
    const { records } = await request.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { message: 'No records provided for update' },
        { status: 400 }
      );
    }

    // Apply the updates
    const updateResult = await applyInvoiceNumberUpdates(records);

    return NextResponse.json(updateResult);
  } catch (error) {
    console.error('Error applying invoice updates:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred while updating records' },
      { status: 500 }
    );
  }
}