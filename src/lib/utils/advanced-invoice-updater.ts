// // src/lib/utils/advanced-invoice-updater.ts
// import { taxDb } from '@/lib/db';
// import { eq, and, inArray } from 'drizzle-orm';
// import { faktur } from '@/lib/db/schema/faktur';
// import { fakturDetail } from '@/lib/db/schema/detail-faktur';
// import * as XLSX from 'xlsx';

// /**
//  * Interface for Coretax export record
//  */
// interface CoretaxRecord {
//   RecordId: string;
//   Reference: string;
//   BuyerTIN: string;
//   TaxInvoiceNumber: string;
//   TaxInvoiceDate: string;
//   TaxInvoiceStatus: string;
//   SellingPrice: string;
//   OtherTaxBase: string;
//   VAT: string;
//   BuyerName: string;
// }

// /**
//  * Interface for a database match result
//  */
// interface MatchResult {
//   coretaxRecord: CoretaxRecord;
//   dbRecord: typeof faktur.$inferSelect | null;
//   matchQuality: 'exact' | 'partial' | 'none';
//   matchReason: string;
//   actionNeeded: 'update' | 'ignore' | 'manual';
// }

// /**
//  * Preview changes before applying them
//  */
// export async function previewInvoiceNumberUpdates(fileBuffer: ArrayBuffer) {
//   // Parse the Excel file
//   const workbook = XLSX.read(fileBuffer, { type: 'array' });
//   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//   const records = XLSX.utils.sheet_to_json<CoretaxRecord>(worksheet);

//   const stats = {
//     totalRecords: records.length,
//     recordsWithInvoiceNumber: 0,
//     exactMatches: 0,
//     partialMatches: 0,
//     noMatches: 0,
//     alreadyUpdated: 0
//   };

//   // Process each record with an invoice number
//   const recordsToProcess = records.filter(record => record.TaxInvoiceNumber);
//   stats.recordsWithInvoiceNumber = recordsToProcess.length;

//   // Get unique references to optimize database queries
//   const uniqueReferences = [...new Set(recordsToProcess.map(r => r.Reference))];
  
//   // Fetch all potential matching records in a single query
//   const potentialMatches = await taxDb.select()
//     .from(faktur)
//     .where(inArray(faktur.referensi, uniqueReferences));
  
//   // Create a lookup map for faster access
//   const referenceMap = new Map<string, typeof faktur.$inferSelect[]>();
//   potentialMatches.forEach(match => {
//     const ref = match.referensi;
//     if (!referenceMap.has(ref)) {
//       referenceMap.set(ref, []);
//     }
//     referenceMap.get(ref)!.push(match);
//   });

//   // Match each record
//   const matchResults: MatchResult[] = [];
  
//   for (const record of recordsToProcess) {
//     // Find potential matches by reference
//     const possibleMatches = referenceMap.get(record.Reference) || [];
    
//     if (possibleMatches.length === 0) {
//       // No match found at all
//       matchResults.push({
//         coretaxRecord: record,
//         dbRecord: null,
//         matchQuality: 'none',
//         matchReason: 'No matching reference found in database',
//         actionNeeded: 'manual'
//       });
//       stats.noMatches++;
//       continue;
//     }
    
//     // Try to find exact match by reference + BuyerTIN
//     const exactMatches = possibleMatches.filter(
//       m => m.npwp_nik_pembeli === record.BuyerTIN
//     );
    
//     if (exactMatches.length === 1) {
//       // Exact unique match
//       const dbRecord = exactMatches[0];
      
//       // Check if already updated
//       if (dbRecord.nomor_faktur_pajak === record.TaxInvoiceNumber) {
//         matchResults.push({
//           coretaxRecord: record,
//           dbRecord,
//           matchQuality: 'exact',
//           matchReason: 'Reference and BuyerTIN match, invoice number already updated',
//           actionNeeded: 'ignore'
//         });
//         stats.alreadyUpdated++;
//       } else {
//         matchResults.push({
//           coretaxRecord: record,
//           dbRecord,
//           matchQuality: 'exact',
//           matchReason: 'Reference and BuyerTIN match',
//           actionNeeded: 'update'
//         });
//         stats.exactMatches++;
//       }
//       continue;
//     }
    
//     if (exactMatches.length > 1) {
//       // Multiple exact matches - try date
//       const fakturDate = record.TaxInvoiceDate.split('T')[0];
//       const dateMatches = exactMatches.filter(
//         m => m.tanggal_faktur.toISOString().split('T')[0] === fakturDate
//       );
      
//       if (dateMatches.length === 1) {
//         // Refined to single match with date
//         const dbRecord = dateMatches[0];
        
//         if (dbRecord.nomor_faktur_pajak === record.TaxInvoiceNumber) {
//           matchResults.push({
//             coretaxRecord: record,
//             dbRecord,
//             matchQuality: 'exact',
//             matchReason: 'Reference, BuyerTIN, and date match, invoice number already updated',
//             actionNeeded: 'ignore'
//           });
//           stats.alreadyUpdated++;
//         } else {
//           matchResults.push({
//             coretaxRecord: record,
//             dbRecord,
//             matchQuality: 'exact',
//             matchReason: 'Reference, BuyerTIN, and date match',
//             actionNeeded: 'update'
//           });
//           stats.exactMatches++;
//         }
//       } else {
//         // Still multiple matches or no matches with date
//         matchResults.push({
//           coretaxRecord: record,
//           dbRecord: null,
//           matchQuality: 'partial',
//           matchReason: `Multiple matches found (${exactMatches.length}) with same Reference and BuyerTIN`,
//           actionNeeded: 'manual'
//         });
//         stats.partialMatches++;
//       }
//       continue;
//     }
    
//     // Try partial match by reference and name similarity
//     const partialMatches = possibleMatches.filter(
//       m => m.nama_pembeli.toUpperCase().includes(record.BuyerName.toUpperCase()) ||
//            record.BuyerName.toUpperCase().includes(m.nama_pembeli.toUpperCase())
//     );
    
//     if (partialMatches.length === 1) {
//       const dbRecord = partialMatches[0];
//       matchResults.push({
//         coretaxRecord: record,
//         dbRecord,
//         matchQuality: 'partial',
//         matchReason: 'Reference matches and buyer names are similar, but TIN is different',
//         actionNeeded: 'manual'
//       });
//       stats.partialMatches++;
//     } else {
//       // No reliable match
//       matchResults.push({
//         coretaxRecord: record,
//         dbRecord: null,
//         matchQuality: 'none',
//         matchReason: 'Reference found but no matching buyer information',
//         actionNeeded: 'manual'
//       });
//       stats.noMatches++;
//     }
//   }

//   return {
//     stats,
//     matchResults: matchResults
//       .sort((a, b) => {
//         // Sort by action needed (update first, then manual, then ignore)
//         const actionOrder = { update: 0, manual: 1, ignore: 2 };
//         return actionOrder[a.actionNeeded] - actionOrder[b.actionNeeded];
//       })
//       .map(match => ({
//         coretaxReference: match.coretaxRecord.Reference,
//         coretaxBuyer: match.coretaxRecord.BuyerName,
//         coretaxTIN: match.coretaxRecord.BuyerTIN,
//         coretaxInvoiceNumber: match.coretaxRecord.TaxInvoiceNumber,
//         coretaxDate: match.coretaxRecord.TaxInvoiceDate.split('T')[0],
//         dbId: match.dbRecord?.id || null,
//         dbReference: match.dbRecord?.referensi || null,
//         dbBuyer: match.dbRecord?.nama_pembeli || null,
//         dbTIN: match.dbRecord?.npwp_nik_pembeli || null,
//         dbInvoiceNumber: match.dbRecord?.nomor_faktur_pajak || null,
//         dbDate: match.dbRecord?.tanggal_faktur 
//           ? match.dbRecord.tanggal_faktur.toISOString().split('T')[0]
//           : null,
//         matchQuality: match.matchQuality,
//         matchReason: match.matchReason,
//         actionNeeded: match.actionNeeded
//       }))
//   };
// }

// /**
//  * Apply updates to the database based on selected records
//  */
// export async function applyInvoiceNumberUpdates(
//   recordsToUpdate: {
//     dbId: string;
//     coretaxInvoiceNumber: string;
//     coretaxStatus?: string;
//   }[]
// ) {
//   const results = {
//     successful: 0,
//     failed: 0,
//     errors: [] as string[]
//   };

//   for (const record of recordsToUpdate) {
//     try {
//       await taxDb.update(faktur)
//         .set({ 
//           nomor_faktur_pajak: record.coretaxInvoiceNumber,
//           ...(record.coretaxStatus ? {
//             status_faktur: mapCoretaxStatusToDbStatus(record.coretaxStatus)
//           } : {})
//         })
//         .where(eq(faktur.id, record.dbId));
      
//       results.successful++;
//     } catch (error) {
//       results.failed++;
//       results.errors.push(`Failed to update invoice ${record.dbId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   }

//   return results;
// }

// /**
//  * Maps Coretax status to database status enum
//  */
// function mapCoretaxStatusToDbStatus(coretaxStatus: string) {
//   switch (coretaxStatus) {
//     case 'APPROVED': return 'APPROVED';
//     case 'AMENDED': return 'AMENDED';
//     case 'CANCELED': return 'CANCELLED';
//     default: return 'DRAFT';
//   }
// }
// src/lib/utils/advanced-invoice-updater.ts
import { taxDb } from '@/lib/db';
import { eq, and, inArray } from 'drizzle-orm';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
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
  BuyerName: string;
}

/**
 * Interface for a database match result
 */
interface MatchResult {
  coretaxRecord: CoretaxRecord;
  dbRecord: typeof faktur.$inferSelect | null;
  matchQuality: 'exact' | 'partial' | 'none';
  matchReason: string;
  actionNeeded: 'update' | 'ignore' | 'manual';
}

/**
 * Preview changes before applying them
 */
export async function previewInvoiceNumberUpdates(fileBuffer: ArrayBuffer) {
  // Parse the Excel file
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json<CoretaxRecord>(worksheet);

  const stats = {
    totalRecords: records.length,
    recordsWithInvoiceNumber: 0,
    exactMatches: 0,
    partialMatches: 0,
    noMatches: 0,
    alreadyUpdated: 0
  };

  // Process each record with an invoice number
  const recordsToProcess = records.filter(record => record.TaxInvoiceNumber);
  stats.recordsWithInvoiceNumber = recordsToProcess.length;

  // Get unique references to optimize database queries
  const uniqueReferences = [...new Set(recordsToProcess.map(r => r.Reference))];
  
  // Fetch all potential matching records in a single query
  const potentialMatches = await taxDb.select()
    .from(faktur)
    .where(inArray(faktur.referensi, uniqueReferences));
  
  // Create a lookup map for faster access
  const referenceMap = new Map<string, typeof faktur.$inferSelect[]>();
  potentialMatches.forEach(match => {
    const ref = match.referensi;
    if (!referenceMap.has(ref)) {
      referenceMap.set(ref, []);
    }
    referenceMap.get(ref)!.push(match);
  });

  // Match each record
  const matchResults: MatchResult[] = [];
  
  for (const record of recordsToProcess) {
    // Find potential matches by reference
    const possibleMatches = referenceMap.get(record.Reference) || [];
    
    if (possibleMatches.length === 0) {
      // No match found at all
      matchResults.push({
        coretaxRecord: record,
        dbRecord: null,
        matchQuality: 'none',
        matchReason: 'No matching reference found in database',
        actionNeeded: 'manual'
      });
      stats.noMatches++;
      continue;
    }
    
    // Try to find exact match by reference + BuyerTIN
    const exactMatches = possibleMatches.filter(
      m => m.npwp_nik_pembeli === record.BuyerTIN
    );
    
    if (exactMatches.length === 1) {
      // Exact unique match
      const dbRecord = exactMatches[0];
      
      // Check if already updated
      if (dbRecord.nomor_faktur_pajak === record.TaxInvoiceNumber) {
        matchResults.push({
          coretaxRecord: record,
          dbRecord,
          matchQuality: 'exact',
          matchReason: 'Reference and BuyerTIN match, invoice number already updated',
          actionNeeded: 'ignore'
        });
        stats.alreadyUpdated++;
      } else {
        matchResults.push({
          coretaxRecord: record,
          dbRecord,
          matchQuality: 'exact',
          matchReason: 'Reference and BuyerTIN match',
          actionNeeded: 'update'
        });
        stats.exactMatches++;
      }
      continue;
    }
    
    if (exactMatches.length > 1) {
      // Multiple exact matches - try date
      const fakturDate = record.TaxInvoiceDate.split('T')[0];
      const dateMatches = exactMatches.filter(
        m => m.tanggal_faktur.toISOString().split('T')[0] === fakturDate
      );
      
      if (dateMatches.length === 1) {
        // Refined to single match with date
        const dbRecord = dateMatches[0];
        
        if (dbRecord.nomor_faktur_pajak === record.TaxInvoiceNumber) {
          matchResults.push({
            coretaxRecord: record,
            dbRecord,
            matchQuality: 'exact',
            matchReason: 'Reference, BuyerTIN, and date match, invoice number already updated',
            actionNeeded: 'ignore'
          });
          stats.alreadyUpdated++;
        } else {
          matchResults.push({
            coretaxRecord: record,
            dbRecord,
            matchQuality: 'exact',
            matchReason: 'Reference, BuyerTIN, and date match',
            actionNeeded: 'update'
          });
          stats.exactMatches++;
        }
      } else {
        // Still multiple matches or no matches with date
        matchResults.push({
          coretaxRecord: record,
          dbRecord: null,
          matchQuality: 'partial',
          matchReason: `Multiple matches found (${exactMatches.length}) with same Reference and BuyerTIN`,
          actionNeeded: 'manual'
        });
        stats.partialMatches++;
      }
      continue;
    }
    
    // Try partial match by reference and name similarity
    const partialMatches = possibleMatches.filter(
      m => m.nama_pembeli.toUpperCase().includes(record.BuyerName.toUpperCase()) ||
           record.BuyerName.toUpperCase().includes(m.nama_pembeli.toUpperCase())
    );
    
    if (partialMatches.length === 1) {
      const dbRecord = partialMatches[0];
      matchResults.push({
        coretaxRecord: record,
        dbRecord,
        matchQuality: 'partial',
        matchReason: 'Reference matches and buyer names are similar, but TIN is different',
        actionNeeded: 'manual'
      });
      stats.partialMatches++;
    } else {
      // No reliable match
      matchResults.push({
        coretaxRecord: record,
        dbRecord: null,
        matchQuality: 'none',
        matchReason: 'Reference found but no matching buyer information',
        actionNeeded: 'manual'
      });
      stats.noMatches++;
    }
  }

  return {
    stats,
    matchResults: matchResults
      .sort((a, b) => {
        // Sort by action needed (update first, then manual, then ignore)
        const actionOrder = { update: 0, manual: 1, ignore: 2 };
        return actionOrder[a.actionNeeded] - actionOrder[b.actionNeeded];
      })
      .map(match => ({
        coretaxReference: match.coretaxRecord.Reference,
        coretaxBuyer: match.coretaxRecord.BuyerName,
        coretaxTIN: match.coretaxRecord.BuyerTIN,
        coretaxInvoiceNumber: match.coretaxRecord.TaxInvoiceNumber,
        coretaxDate: match.coretaxRecord.TaxInvoiceDate.split('T')[0],
        coretaxStatus: match.coretaxRecord.TaxInvoiceStatus,
        dbId: match.dbRecord?.id || null,
        dbReference: match.dbRecord?.referensi || null,
        dbBuyer: match.dbRecord?.nama_pembeli || null,
        dbTIN: match.dbRecord?.npwp_nik_pembeli || null,
        dbInvoiceNumber: match.dbRecord?.nomor_faktur_pajak || null,
        dbStatus: match.dbRecord?.status_faktur || null,
        dbDate: match.dbRecord?.tanggal_faktur 
          ? match.dbRecord.tanggal_faktur.toISOString().split('T')[0]
          : null,
        matchQuality: match.matchQuality,
        matchReason: match.matchReason,
        actionNeeded: match.actionNeeded
      }))
  };
}

/**
 * Apply updates to the database based on selected records
 */
export async function applyInvoiceNumberUpdates(
  recordsToUpdate: {
    dbId: string;
    coretaxInvoiceNumber: string;
    coretaxStatus?: string;
  }[]
) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const record of recordsToUpdate) {
    try {
      await taxDb.update(faktur)
        .set({ 
          nomor_faktur_pajak: record.coretaxInvoiceNumber,
          ...(record.coretaxStatus ? {
            status_faktur: mapCoretaxStatusToDbStatus(record.coretaxStatus)
          } : {})
        })
        .where(eq(faktur.id, record.dbId));
      
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to update invoice ${record.dbId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
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