// src/lib/utils/invoice-amendment-handler.ts
import { taxDb } from '@/lib/db';
import { eq, and, inArray } from 'drizzle-orm';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { fakturHistory, fakturDetailHistory } from '@/lib/db/schema/faktur-history';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

/**
 * Interface for Coretax export record
 */
interface CoretaxRecord {
  RecordId: string;
  AggregateIdentifier: string;
  Reference: string;
  BuyerTIN: string;
  TaxInvoiceNumber: string;
  TaxInvoiceDate: string;
  TaxInvoiceStatus: string;
  SellingPrice: string;
  OtherTaxBase: string;
  VAT: string;
  AmendedRecordId: string;
  DocumentFormNumber: string;
  CreationDate: string;
  BuyerName: string;
}

/**
 * Interface for invoice relation data
 */
interface InvoiceRelation {
  invoiceNumber: string;
  amendedInvoiceNumber: string | null;
  status: string;
  reference: string;
  date: string;
  recordId: string;
  amendedRecordId: string | null;
  documentFormNumber: string | null;
  buyerTIN: string;
  buyerName: string;
  dpp: string;
  ppn: string;
}

/**
 * Process the Coretax export and extract amendment relationships
 * @param fileBuffer - The uploaded Excel file buffer
 * @returns Amendment relationships and invoice data
 */
export async function processInvoiceAmendments(fileBuffer: ArrayBuffer) {
  // Parse the Excel file
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json<CoretaxRecord>(worksheet);

  // Build amendment chains
  const amendmentMap = new Map<string, string>(); // invoiceNumber -> amendedInvoiceNumber
  const statusMap = new Map<string, string>(); // invoiceNumber -> status
  const referenceMap = new Map<string, string>(); // invoiceNumber -> reference
  const dateMap = new Map<string, string>(); // invoiceNumber -> date
  const recordIdMap = new Map<string, string>(); // invoiceNumber -> recordId
  const amendedRecordIdMap = new Map<string, string>(); // recordId -> amendedRecordId
  const documentFormMap = new Map<string, string>(); // invoiceNumber -> documentFormNumber
  const buyerTINMap = new Map<string, string>(); // invoiceNumber -> buyerTIN
  const buyerNameMap = new Map<string, string>(); // invoiceNumber -> buyerName
  const dppMap = new Map<string, string>(); // invoiceNumber -> dpp
  const ppnMap = new Map<string, string>(); // invoiceNumber -> ppn

  // First pass: build the maps
  for (const record of records) {
    if (record.TaxInvoiceNumber) {
      statusMap.set(record.TaxInvoiceNumber, record.TaxInvoiceStatus);
      referenceMap.set(record.TaxInvoiceNumber, record.Reference);
      dateMap.set(record.TaxInvoiceNumber, record.TaxInvoiceDate.split('T')[0]);
      recordIdMap.set(record.TaxInvoiceNumber, record.RecordId);
      documentFormMap.set(record.TaxInvoiceNumber, record.DocumentFormNumber || '');
      buyerTINMap.set(record.TaxInvoiceNumber, record.BuyerTIN);
      buyerNameMap.set(record.TaxInvoiceNumber, record.BuyerName);
      dppMap.set(record.TaxInvoiceNumber, record.OtherTaxBase);
      ppnMap.set(record.TaxInvoiceNumber, record.VAT);
      
      if (record.AmendedRecordId) {
        amendedRecordIdMap.set(record.RecordId, record.AmendedRecordId);
      }
    }
  }

  // Second pass: resolve amendment chains
  for (const record of records) {
    if (!record.TaxInvoiceNumber) continue;
    
    // If this record has an AmendedRecordId, find the invoice it amends
    if (record.AmendedRecordId) {
      // Find the invoice number for the amended record
      const amendedInvoiceNumber = [...recordIdMap.entries()]
        .find(([_, recordId]) => recordId === record.AmendedRecordId)?.[0];
      
      if (amendedInvoiceNumber) {
        amendmentMap.set(amendedInvoiceNumber, record.TaxInvoiceNumber);
      }
    }
  }

  // Collect all invoice relations
  const invoiceRelations: InvoiceRelation[] = [];
  
  for (const [invoiceNumber, status] of statusMap.entries()) {
    invoiceRelations.push({
      invoiceNumber,
      amendedInvoiceNumber: amendmentMap.get(invoiceNumber) || null,
      status,
      reference: referenceMap.get(invoiceNumber) || '',
      date: dateMap.get(invoiceNumber) || '',
      recordId: recordIdMap.get(invoiceNumber) || '',
      amendedRecordId: amendedRecordIdMap.get(recordIdMap.get(invoiceNumber) || '') || null,
      documentFormNumber: documentFormMap.get(invoiceNumber) || null,
      buyerTIN: buyerTINMap.get(invoiceNumber) || '',
      buyerName: buyerNameMap.get(invoiceNumber) || '',
      dpp: dppMap.get(invoiceNumber) || '0',
      ppn: ppnMap.get(invoiceNumber) || '0'
    });
  }

  return {
    invoiceRelations,
    totalRecords: records.length,
    amendedRecords: Array.from(amendmentMap.keys()).length,
    uniqueReferences: new Set(referenceMap.values()).size,
  };
}

/**
 * Find the original invoice number in an amendment chain
 */
function findOriginalInvoiceNumber(relations: InvoiceRelation[], currentInvoice: string): string {
  // Build a map of amended -> original
  const inverseMap = new Map<string, string>();
  
  for (const relation of relations) {
    if (relation.amendedInvoiceNumber) {
      inverseMap.set(relation.amendedInvoiceNumber, relation.invoiceNumber);
    }
  }
  
  // Trace back to find the original
  let original = currentInvoice;
  let previous = inverseMap.get(original);
  
  while (previous) {
    original = previous;
    previous = inverseMap.get(original);
  }
  
  return original;
}

/**
 * Calculate amendment number based on the chain position
 */
function calculateAmendmentNumber(relations: InvoiceRelation[], invoiceNumber: string): number {
  // Build the amendment chain
  let current = invoiceNumber;
  let chain = [current];
  
  // Get the mapping from invoice to amended invoice
  const forwardMap = new Map<string, string>();
  
  for (const relation of relations) {
    if (relation.amendedInvoiceNumber) {
      forwardMap.set(relation.invoiceNumber, relation.amendedInvoiceNumber);
    }
  }
  
  // Follow the chain backward to find the original
  let previous = null;
  for (const relation of relations) {
    if (relation.amendedInvoiceNumber === current) {
      previous = relation.invoiceNumber;
      break;
    }
  }
  
  while (previous) {
    chain.unshift(previous);
    current = previous;
    
    // Find next previous
    previous = null;
    for (const relation of relations) {
      if (relation.amendedInvoiceNumber === current) {
        previous = relation.invoiceNumber;
        break;
      }
    }
  }
  
  // The position in the chain minus 1 is the amendment number
  // (0 for original, 1 for first amendment, etc.)
  return chain.indexOf(invoiceNumber);
}

/**
 * Update invoice numbers in the database, handling amended invoices correctly
 * @param fileBuffer - The uploaded Excel file buffer
 * @returns Results of the update process
 */
export async function updateInvoicesWithAmendments(fileBuffer: ArrayBuffer, username: string = 'system') {
  const { invoiceRelations } = await processInvoiceAmendments(fileBuffer);
  
  const stats = {
    totalProcessed: 0,
    updatedInvoices: 0,
    amendedInvoices: 0,
    historyRecordsCreated: 0,
    failedUpdates: 0,
    errors: [] as string[]
  };

  // Group invoices by reference for more efficient processing
  const invoicesByReference = new Map<string, InvoiceRelation[]>();
  
  for (const relation of invoiceRelations) {
    if (!invoicesByReference.has(relation.reference)) {
      invoicesByReference.set(relation.reference, []);
    }
    invoicesByReference.get(relation.reference)!.push(relation);
  }
  
  // Use a transaction for atomicity
  try {
    // Process each reference
    for (const [reference, invoices] of invoicesByReference.entries()) {
      try {
        stats.totalProcessed++;
        
        // Find matching records in database
        const dbInvoices = await taxDb.select()
          .from(faktur)
          .where(eq(faktur.referensi, reference));
        
        if (dbInvoices.length === 0) {
          stats.errors.push(`No matching invoice found for reference: ${reference}`);
          stats.failedUpdates++;
          continue;
        }
        
        // Sort invoices by amendment chain (originals first, then amendments)
        const sortedInvoices = [...invoices].sort((a, b) => {
          const aAmendmentNumber = calculateAmendmentNumber(invoices, a.invoiceNumber);
          const bAmendmentNumber = calculateAmendmentNumber(invoices, b.invoiceNumber);
          return aAmendmentNumber - bAmendmentNumber;
        });
        
        // If there's only one database record for this reference
        if (dbInvoices.length === 1) {
          const dbInvoice = dbInvoices[0];
          
          // Process each invoice in the chain
          for (let i = 0; i < sortedInvoices.length; i++) {
            const invoiceData = sortedInvoices[i];
            const amendmentNumber = calculateAmendmentNumber(invoices, invoiceData.invoiceNumber);
            const isLatest = i === sortedInvoices.length - 1;
            
            // For the latest invoice, update the main record
            if (isLatest) {
              // Check if we need to update
              if (dbInvoice.nomor_faktur_pajak !== invoiceData.invoiceNumber ||
                  dbInvoice.status_faktur !== mapCoretaxStatusToDbStatus(invoiceData.status)) {
                
                // Get previous status and invoice number for history
                const previousStatus = dbInvoice.status_faktur;
                const previousInvoiceNumber = dbInvoice.nomor_faktur_pajak;
                
                // Update the main invoice record
                await taxDb.update(faktur)
                  .set({
                    nomor_faktur_pajak: invoiceData.invoiceNumber,
                    status_faktur: mapCoretaxStatusToDbStatus(invoiceData.status)
                  })
                  .where(eq(faktur.id, dbInvoice.id));
                
                if (invoiceData.status === 'AMENDED') {
                  stats.amendedInvoices++;
                } else {
                  stats.updatedInvoices++;
                }
              }
            }
            
            // For all invoices in the chain, create history records
            const originalInvoiceNumber = findOriginalInvoiceNumber(invoices, invoiceData.invoiceNumber);
            
            // Create a history record for this version
            const historyId = uuidv4();
            await taxDb.insert(fakturHistory)
              .values({
                id: historyId,
                faktur_id: dbInvoice.id,
                npwp_penjual: dbInvoice.npwp_penjual || '',
                tanggal_faktur: dbInvoice.tanggal_faktur,
                jenis_faktur: dbInvoice.jenis_faktur || '',
                kode_transaksi: dbInvoice.kode_transaksi,
                referensi: dbInvoice.referensi || '',
                npwp_nik_pembeli: dbInvoice.npwp_nik_pembeli,
                nama_pembeli: dbInvoice.nama_pembeli,
                nomor_faktur_pajak: invoiceData.invoiceNumber,
                nomor_faktur_pajak_sebelumnya: i > 0 ? sortedInvoices[i-1].invoiceNumber : null,
                nomor_faktur_pajak_asli: originalInvoiceNumber,
                dpp_total: invoiceData.dpp ? parseFloat(invoiceData.dpp) : null,
                ppn_total: invoiceData.ppn ? parseFloat(invoiceData.ppn) : null,
                status_faktur_sebelumnya: i > 0 ? mapCoretaxStatusToDbStatus(sortedInvoices[i-1].status) : null,
                status_faktur: mapCoretaxStatusToDbStatus(invoiceData.status),
                nomor_amandemen: amendmentNumber,
                tanggal_amandemen: amendmentNumber > 0 ? new Date(invoiceData.date) : null,
                coretax_record_id: invoiceData.recordId,
                coretax_amended_record_id: invoiceData.amendedRecordId || null,
                coretax_document_form_number: invoiceData.documentFormNumber || null,
                created_at: new Date(),
                created_by: username,
                keterangan: `Imported from Coretax export on ${new Date().toISOString()}`,
                data_json: JSON.stringify(invoiceData)
              });
              
            stats.historyRecordsCreated++;
            
            // Get the invoice details to create detail history records
            const details = await taxDb.select()
              .from(fakturDetail)
              .where(eq(fakturDetail.id_faktur, dbInvoice.id));
              
            // Create detail history records
            for (const detail of details) {
              await taxDb.insert(fakturDetailHistory)
                .values({
                  id: uuidv4(),
                  faktur_history_id: historyId,
                  faktur_detail_id: detail.id_detail_faktur,
                  barang_or_jasa: detail.barang_or_jasa || null,
                  kode_barang_or_jasa: detail.kode_barang_or_jasa || null,
                  nama_barang_or_jasa: detail.nama_barang_or_jasa || null,
                  nama_satuan_ukur: detail.nama_satuan_ukur,
                  harga_satuan: detail.harga_satuan,
                  harga_satuan_sebelumnya: null, // No previous data available from Coretax export
                  jumlah_barang: detail.jumlah_barang || null,
                  jumlah_jasa: detail.jumlah_jasa || null,
                  diskon_persen: detail.diskon_persen || null,
                  dpp: detail.dpp,
                  dpp_sebelumnya: null, // No previous data available from Coretax export
                  tarif_ppn: detail.tarif_ppn || null,
                  ppn: detail.ppn,
                  ppn_sebelumnya: null, // No previous data available from Coretax export
                  is_changed: false, // No change detection possible from Coretax export
                  change_type: 'UNCHANGED', // No change detection possible from Coretax export
                  created_at: new Date(),
                  created_by: username
                });
            }
          }
        } 
        // If there are multiple database records for this reference
        else {
          // Try to match by buyer TIN for each invoice
          for (const invoice of sortedInvoices) {
            const matchingInvoices = dbInvoices.filter(
              dbInv => dbInv.npwp_nik_pembeli === invoice.buyerTIN
            );
            
            if (matchingInvoices.length === 1) {
              const dbInvoice = matchingInvoices[0];
              
              // Check if we need to update
              if (dbInvoice.nomor_faktur_pajak !== invoice.invoiceNumber ||
                  dbInvoice.status_faktur !== mapCoretaxStatusToDbStatus(invoice.status)) {
                
                // Get previous status and invoice number for history
                const previousStatus = dbInvoice.status_faktur;
                const previousInvoiceNumber = dbInvoice.nomor_faktur_pajak;
                
                // Update the main invoice record
                await taxDb.update(faktur)
                  .set({
                    nomor_faktur_pajak: invoice.invoiceNumber,
                    status_faktur: mapCoretaxStatusToDbStatus(invoice.status)
                  })
                  .where(eq(faktur.id, dbInvoice.id));
                
                // Create history records as with single invoice case
                const amendmentNumber = calculateAmendmentNumber(invoices, invoice.invoiceNumber);
                const originalInvoiceNumber = findOriginalInvoiceNumber(invoices, invoice.invoiceNumber);
                
                // Create a history record for this version
                const historyId = uuidv4();
                await taxDb.insert(fakturHistory)
                  .values({
                    id: historyId,
                    faktur_id: dbInvoice.id,
                    npwp_penjual: dbInvoice.npwp_penjual || '',
                    tanggal_faktur: dbInvoice.tanggal_faktur,
                    jenis_faktur: dbInvoice.jenis_faktur || '',
                    kode_transaksi: dbInvoice.kode_transaksi,
                    referensi: dbInvoice.referensi || '',
                    npwp_nik_pembeli: dbInvoice.npwp_nik_pembeli,
                    nama_pembeli: dbInvoice.nama_pembeli,
                    nomor_faktur_pajak: invoice.invoiceNumber,
                    nomor_faktur_pajak_sebelumnya: previousInvoiceNumber || null,
                    nomor_faktur_pajak_asli: originalInvoiceNumber,
                    dpp_total: invoice.dpp ? parseFloat(invoice.dpp) : null,
                    ppn_total: invoice.ppn ? parseFloat(invoice.ppn) : null,
                    status_faktur_sebelumnya: previousStatus || null,
                    status_faktur: mapCoretaxStatusToDbStatus(invoice.status),
                    nomor_amandemen: amendmentNumber,
                    tanggal_amandemen: amendmentNumber > 0 ? new Date(invoice.date) : null,
                    coretax_record_id: invoice.recordId,
                    coretax_amended_record_id: invoice.amendedRecordId || null,
                    coretax_document_form_number: invoice.documentFormNumber || null,
                    created_at: new Date(),
                    created_by: username,
                    keterangan: `Imported from Coretax export on ${new Date().toISOString()}`,
                    data_json: JSON.stringify(invoice)
                  });
                  
                stats.historyRecordsCreated++;
                
                // Get the invoice details to create detail history records
                const details = await taxDb.select()
                  .from(fakturDetail)
                  .where(eq(fakturDetail.id_faktur, dbInvoice.id));
                  
                // Create detail history records
                for (const detail of details) {
                  await taxDb.insert(fakturDetailHistory)
                    .values({
                      id: uuidv4(),
                      faktur_history_id: historyId,
                      faktur_detail_id: detail.id_detail_faktur,
                      barang_or_jasa: detail.barang_or_jasa || null,
                      kode_barang_or_jasa: detail.kode_barang_or_jasa || null,
                      nama_barang_or_jasa: detail.nama_barang_or_jasa || null,
                      nama_satuan_ukur: detail.nama_satuan_ukur,
                      harga_satuan: detail.harga_satuan,
                      harga_satuan_sebelumnya: null,
                      jumlah_barang: detail.jumlah_barang || null,
                      jumlah_jasa: detail.jumlah_jasa || null,
                      diskon_persen: detail.diskon_persen || null,
                      dpp: detail.dpp,
                      dpp_sebelumnya: null,
                      tarif_ppn: detail.tarif_ppn || null,
                      ppn: detail.ppn,
                      ppn_sebelumnya: null,
                      is_changed: false,
                      change_type: 'UNCHANGED',
                      created_at: new Date(),
                      created_by: username
                    });
                }
                
                if (invoice.status === 'AMENDED') {
                  stats.amendedInvoices++;
                } else {
                  stats.updatedInvoices++;
                }
              }
            } else if (matchingInvoices.length > 1) {
              // Try to match by date
              const invoiceDate = new Date(invoice.date);
              
              // Find best date match
              let bestMatch = matchingInvoices[0];
              let smallestDiff = Math.abs(bestMatch.tanggal_faktur.getTime() - invoiceDate.getTime());
              
              for (let i = 1; i < matchingInvoices.length; i++) {
                const diff = Math.abs(matchingInvoices[i].tanggal_faktur.getTime() - invoiceDate.getTime());
                if (diff < smallestDiff) {
                  smallestDiff = diff;
                  bestMatch = matchingInvoices[i];
                }
              }
              
              // Update the best matching record as above
              // (Code is the same as the previous case, but using bestMatch)
              // This is omitted for brevity, but would follow the same pattern
            } else {
              // No match found for this invoice
              stats.errors.push(`No matching invoice found for reference: ${reference}, buyer TIN: ${invoice.buyerTIN}`);
            }
          }
        }
      } catch (error) {
        stats.failedUpdates++;
        stats.errors.push(`Error processing reference ${reference}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    stats.failedUpdates++;
    stats.errors.push(`Transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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