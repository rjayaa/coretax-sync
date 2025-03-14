// src/app/api/faktur/process-amendments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processInvoiceAmendments } from '@/lib/utils/invoice-amendment-handler';
import * as XLSX from 'xlsx';

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
    
    // Process the Excel file
    const { invoiceRelations, totalRecords, amendedRecords, uniqueReferences } = 
      await processInvoiceAmendments(fileBuffer);

    // Build invoice chains for better visualization
    const chains = buildInvoiceChains(invoiceRelations);

    return NextResponse.json({
      totalRecords,
      amendedRecords,
      uniqueReferences,
      invoiceChains: chains
    });
  } catch (error) {
    console.error('Error processing amendments:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred while processing the file' },
      { status: 500 }
    );
  }
}

function buildInvoiceChains(relations: InvoiceRelation[]): InvoiceChain[] {
  // First, group by reference
  const referenceGroups = new Map<string, InvoiceRelation[]>();
  
  for (const relation of relations) {
    if (!referenceGroups.has(relation.reference)) {
      referenceGroups.set(relation.reference, []);
    }
    referenceGroups.get(relation.reference)!.push(relation);
  }
  
  // Build amendment chains
  const chains: InvoiceChain[] = [];
  
  for (const [reference, invoices] of referenceGroups.entries()) {
    // Create forward map (invoice -> amended invoice)
    const forwardMap = new Map<string, string>();
    
    for (const invoice of invoices) {
      if (invoice.amendedInvoiceNumber) {
        forwardMap.set(invoice.invoiceNumber, invoice.amendedInvoiceNumber);
      }
    }
    
    // Create reverse map (amended invoice -> original invoice)
    const reverseMap = new Map<string, string>();
    
    for (const [original, amended] of forwardMap.entries()) {
      reverseMap.set(amended, original);
    }
    
    // Find the root invoices (not amendments of anything)
    const roots = invoices
      .filter(inv => !reverseMap.has(inv.invoiceNumber))
      .map(inv => inv.invoiceNumber);
    
    // For each root, build its amendment chain
    for (const root of roots) {
      const chain: string[] = [root];
      let current = root;
      
      // Follow the chain forward
      while (forwardMap.has(current)) {
        current = forwardMap.get(current)!;
        chain.push(current);
      }
      
      // Create the chain object
      const invoiceChain: InvoiceChain = {
        reference,
        invoices: chain.map((invoiceNumber, index) => {
          const invoiceData = invoices.find(inv => inv.invoiceNumber === invoiceNumber)!;
          return {
            invoiceNumber,
            status: invoiceData.status,
            date: invoiceData.date,
            isLatest: index === chain.length - 1
          };
        }).reverse() // Newest first
      };
      
      chains.push(invoiceChain);
    }
  }
  
  // Sort chains: longest chains first, then by reference
  return chains.sort((a, b) => {
    const lengthDiff = b.invoices.length - a.invoices.length;
    if (lengthDiff !== 0) return lengthDiff;
    return a.reference.localeCompare(b.reference);
  });
}
