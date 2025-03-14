// src/lib/utils/invoice-updater.ts
import { taxDb } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { faktur } from '@/lib/db/schema/faktur';
import * as XLSX from 'xlsx';

/**
 * Interface for Coretax export record
 */
interface CoretaxRecord {
  RecordId: string;
  Reference: string;
  BuyerTIN: string;
  TaxInvoiceNumber: string;
  TaxInvoiceDate: string;
  TaxInvoiceStatus: string;
  SellingPrice: string;
  OtherTaxBase: string;
  VAT: string;
}

/**
 * Processes the Coretax export Excel file and updates invoice numbers in the database
 * @param fileBuffer - The uploaded Excel file buffer
 * @returns Statistics about the update process
 */
export async function updateInvoiceNumbersFromCoretax(fileBuffer: ArrayBuffer) {
  // Parse the Excel file
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json<CoretaxRecord>(worksheet);

  const stats = {
    totalRecords: records.length,
    recordsWithInvoiceNumber: 0,
    matchedRecords: 0,
    updatedRecords: 0,
    notFoundRecords: 0
  };

  // Process each record with an invoice number
  const recordsToProcess = records.filter(record => record.TaxInvoiceNumber);
  stats.recordsWithInvoiceNumber = recordsToProcess.length;

  for (const record of recordsToProcess) {
    try {
      // Format the date (remove time part)
      const fakturDate = record.TaxInvoiceDate.split('T')[0];

      // Find matching record in database
      // First try with Reference + BuyerTIN
      let matchedRecords = await taxDb.select()
        .from(faktur)
        .where(
          and(
            eq(faktur.referensi, record.Reference),
            eq(faktur.npwp_nik_pembeli, record.BuyerTIN)
          )
        );

      // If multiple matches found, add date to criteria
      if (matchedRecords.length > 1) {
        matchedRecords = matchedRecords.filter(
          row => row.tanggal_faktur.toISOString().split('T')[0] === fakturDate
        );
      }

      // If still multiple matches, try to match by amount
      if (matchedRecords.length > 1) {
        // We might need to join with detail table to get DPP/PPN for matching
        // This is a simplified approach; you may need to adjust based on your data
        // Ideally you would query with a join to fakturDetail
      }

      // If we found exactly one match, update it
      if (matchedRecords.length === 1) {
        stats.matchedRecords++;
        
        // Check if the invoice number already exists and is different
        const existingRecord = matchedRecords[0];
        
        if (existingRecord.nomor_faktur_pajak !== record.TaxInvoiceNumber) {
          await taxDb.update(faktur)
            .set({ 
              nomor_faktur_pajak: record.TaxInvoiceNumber,
              // Optionally update status based on TaxInvoiceStatus
              status_faktur: mapCoretaxStatusToDbStatus(record.TaxInvoiceStatus)
            })
            .where(eq(faktur.id, existingRecord.id));
          
          stats.updatedRecords++;
        }
      } else {
        stats.notFoundRecords++;
        console.log(`No unique match found for Reference: ${record.Reference}, BuyerTIN: ${record.BuyerTIN}`);
      }
    } catch (error) {
      console.error(`Error processing record ${record.Reference}:`, error);
    }
  }

  return stats;
}

/**
 * Maps Coretax status to database status enum
 */
function mapCoretaxStatusToDbStatus(coretaxStatus: string) {
  switch (coretaxStatus) {
    case 'APPROVED': return 'APPROVED';
    case 'AMENDED': return 'AMENDED';
    case 'CANCELED': return 'CANCELLED';
    default: return 'DRAFT';
  }
}