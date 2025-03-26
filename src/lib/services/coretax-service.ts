
// src/lib/services/coretax-service.ts
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { coretaxData } from '@/lib/db/schema/coretax';
import { eq, sql, like, isNull, not, count, and, desc, or, sum } from 'drizzle-orm';

export type CoretaxSyncResult = {
  total: number;
  synced: number;
  notFound: number;
  updated: number;
  details: any[];
};

export class CoretaxService {
  /**
   * Process Excel file and sync data with database
   */
  static async syncFromExcel(fileBuffer: ArrayBuffer): Promise<CoretaxSyncResult> {
    // Result tracker
    const syncResults: CoretaxSyncResult = {
      total: 0,
      synced: 0,
      notFound: 0,
      updated: 0,
      details: []
    };
    
    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, {
        cellDates: true,
        cellStyles: true,
      });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(sheet);
      syncResults.total = data.length;
      
      // Status Coretax to Database mapping
      const statusMapping: Record<string, string> = {
        'CREATED': 'CREATED',
        'APPROVED': 'APPROVED',
        'AMENDED': 'AMENDED',
        'CANCELED': 'CANCELLED'
      };
      
      // First, sort data by CreationDate to process original records before amendments
      const sortedData = [...data].sort((a: any, b: any) => {
        const dateA = a.CreationDate ? new Date(a.CreationDate).getTime() : 0;
        const dateB = b.CreationDate ? new Date(b.CreationDate).getTime() : 0;
        return dateA - dateB; // Process older records first
      });
      
      // Process in batches to avoid transaction timeouts
      const batchSize = 25;
      for (let i = 0; i < sortedData.length; i += batchSize) {
        const batch = sortedData.slice(i, i + batchSize);
        // Process each row in the batch
        for (const row of batch) {
          await this.processCoretaxRow(row, statusMapping, syncResults);
        }
      }
      
      return syncResults;
    } catch (error) {
      console.error('Error in syncFromExcel:', error);
      throw error;
    }
  }
  
  /**
   * Process a single row from Coretax Excel export
   */
  private static async processCoretaxRow(row: any, statusMapping: Record<string, string>, syncResults: CoretaxSyncResult) {
    try {
      // First, check if we've already processed this record
      const existingRecord = await db.select()
        .from(coretaxData)
        .where(eq(coretaxData.record_id, row.RecordId))
        .limit(1);
      
      // Store record in coretaxData table (update or insert)
      if (existingRecord.length > 0) {
        await this.updateCoretaxRecord(existingRecord[0], row);
      } else {
        await this.insertCoretaxRecord(row);
      }
      
      // Now handle various matching strategies in order of reliability
      const matchResult = await this.matchAndUpdateFaktur(row, statusMapping, syncResults);
      
      // If no match was found by any strategy, record it
      if (!matchResult) {
        syncResults.notFound++;
        syncResults.details.push({
          reference: row.Reference,
          status: 'not_found',
          coretaxRecordId: row.RecordId,
          taxInvoiceNumber: row.TaxInvoiceNumber || '(Belum Ada)',
          taxInvoiceStatus: row.TaxInvoiceStatus
        });
      }
    } catch (error) {
      console.error('Error processing row:', error, row);
      throw error;
    }
  }

  /**
   * Update an existing coretax record
   */
  private static async updateCoretaxRecord(existingRecord: any, row: any) {
    await db.update(coretaxData)
      .set({
        aggregate_identifier: row.AggregateIdentifier,
        seller_taxpayer_aggregate_id: row.SellerTaxpayerAggregateIdentifier,
        buyer_taxpayer_aggregate_id: row.BuyerTaxpayerAggregateIdentifier,
        created_by_seller: row.CreatedBySeller === 'true',
        seller_tin: row.SellerTIN,
        buyer_tin: row.BuyerTIN,
        document_number: row.DocumentNumber || '',
        seller_taxpayer_name: row.SellerTaxpayerName,
        buyer_taxpayer_name: row.BuyerTaxpayerName,
        buyer_taxpayer_name_clear: row.BuyerTaxpayerNameClear,
        buyer_name: row.BuyerName,
        tax_invoice_code: row.TaxInvoiceCode,
        tax_invoice_number: row.TaxInvoiceNumber || '',
        tax_invoice_date: row.TaxInvoiceDate ? new Date(row.TaxInvoiceDate) : null,
        tax_invoice_period: row.TaxInvoicePeriod,
        tax_invoice_year: row.TaxInvoiceYear,
        tax_invoice_status: row.TaxInvoiceStatus,
        buyer_status: row.BuyerStatus || '',
        selling_price: row.SellingPrice,
        other_tax_base: row.OtherTaxBase,
        vat: row.VAT,
        stlg: row.STLG,
        signer: row.Signer || '',
        downpayment_parent_identifier: row.DownpaymentParentIdentifier,
        downpayment_sum: row.DownpaymentSum,
        amended_record_id: row.AmendedRecordId || '',
        valid: row.Valid === 'true',
        reported_by_buyer: row.ReportedByBuyer === 'true',
        reported_by_seller: row.ReportedBySeller === 'true',
        reported_by_vat_collector: row.ReportedByVATCollector === 'true',
        last_updated_date: row.LastUpdatedDate ? new Date(row.LastUpdatedDate) : null,
        creation_date: row.CreationDate ? new Date(row.CreationDate) : null,
        period_credit: row.PeriodCredit || '',
        year_credit: row.YearCredit || '',
        input_invoice_status: row.InputInvoiceStatus || '',
        document_form_number: row.DocumentFormNumber || '',
        document_form_aggregate_id: row.DocumentFormAggregateIdentifier || '',
        e_sign_status: row.ESignStatus || '',
        amended_document_form_number: row.AmendedDocumentFormNumber || '',
        amended_document_form_aggregate_id: row.AmendedDocumentFormAggregateIdentifier || '',
        is_show_cancel_in_grid: row.IsShowCancelInGrid === 'true',
        reference: row.Reference,
        channel_code: row.ChannelCode,
        display_name: row.DisplayName,
        is_migrated: row.IsMigrated === 'true',
        sync_date: new Date(),
      })
      .where(eq(coretaxData.record_id, row.RecordId));
  }

  /**
   * Insert a new coretax record
   */
  private static async insertCoretaxRecord(row: any) {
    await db.insert(coretaxData).values({
      record_id: row.RecordId,
      aggregate_identifier: row.AggregateIdentifier,
      seller_taxpayer_aggregate_id: row.SellerTaxpayerAggregateIdentifier,
      buyer_taxpayer_aggregate_id: row.BuyerTaxpayerAggregateIdentifier,
      created_by_seller: row.CreatedBySeller === 'true',
      seller_tin: row.SellerTIN,
      buyer_tin: row.BuyerTIN,
      document_number: row.DocumentNumber || '',
      seller_taxpayer_name: row.SellerTaxpayerName,
      buyer_taxpayer_name: row.BuyerTaxpayerName,
      buyer_taxpayer_name_clear: row.BuyerTaxpayerNameClear,
      buyer_name: row.BuyerName,
      tax_invoice_code: row.TaxInvoiceCode,
      tax_invoice_number: row.TaxInvoiceNumber || '',
      tax_invoice_date: row.TaxInvoiceDate ? new Date(row.TaxInvoiceDate) : null,
      tax_invoice_period: row.TaxInvoicePeriod,
      tax_invoice_year: row.TaxInvoiceYear,
      tax_invoice_status: row.TaxInvoiceStatus,
      buyer_status: row.BuyerStatus || '',
      selling_price: row.SellingPrice,
      other_tax_base: row.OtherTaxBase,
      vat: row.VAT,
      stlg: row.STLG,
      signer: row.Signer || '',
      downpayment_parent_identifier: row.DownpaymentParentIdentifier,
      downpayment_sum: row.DownpaymentSum,
      amended_record_id: row.AmendedRecordId || '',
      valid: row.Valid === 'true',
      reported_by_buyer: row.ReportedByBuyer === 'true',
      reported_by_seller: row.ReportedBySeller === 'true',
      reported_by_vat_collector: row.ReportedByVATCollector === 'true',
      last_updated_date: row.LastUpdatedDate ? new Date(row.LastUpdatedDate) : null,
      creation_date: row.CreationDate ? new Date(row.CreationDate) : null,
      period_credit: row.PeriodCredit || '',
      year_credit: row.YearCredit || '',
      input_invoice_status: row.InputInvoiceStatus || '',
      document_form_number: row.DocumentFormNumber || '',
      document_form_aggregate_id: row.DocumentFormAggregateIdentifier || '',
      e_sign_status: row.ESignStatus || '',
      amended_document_form_number: row.AmendedDocumentFormNumber || '',
      amended_document_form_aggregate_id: row.AmendedDocumentFormAggregateIdentifier || '',
      is_show_cancel_in_grid: row.IsShowCancelInGrid === 'true',
      reference: row.Reference,
      channel_code: row.ChannelCode,
      display_name: row.DisplayName,
      is_migrated: row.IsMigrated === 'true',
      sync_date: new Date(),
    });
  }

  /**
   * Match and update faktur using multiple strategies
   * Returns true if a match was found and updated
   */
  private static async matchAndUpdateFaktur(row: any, statusMapping: Record<string, string>, syncResults: CoretaxSyncResult): Promise<boolean> {
    // Try these strategies in order:
    // 1. Already linked faktur (by coretax_record_id)
    // 2. Exact reference match
    // 3. Partial reference match
    // 4. Invoice number match
    // 5. Buyer & seller info match with similar date
    
    // 1. Check if this record is already linked to a faktur
    const linkedFaktur = await db.select()
      .from(faktur)
      .where(eq(faktur.coretax_record_id, row.RecordId))
      .limit(1);
    
    if (linkedFaktur.length > 0) {
      await this.updateFakturFromCoretax(linkedFaktur[0], row, statusMapping, syncResults);
      return true;
    }
    
    // 2. Try exact reference match
    const referenceMatches = await db.select()
      .from(faktur)
      .where(eq(faktur.referensi, row.Reference))
      .limit(2); // Get up to 2 to check for duplicates
    
    if (referenceMatches.length === 1) {
      await this.updateFakturFromCoretax(referenceMatches[0], row, statusMapping, syncResults);
      return true;
    }
    else if (referenceMatches.length > 1) {
      // If multiple matches, try to find the one that's not already synced
      const unsynced = referenceMatches.find(f => !f.coretax_record_id);
      if (unsynced) {
        await this.updateFakturFromCoretax(unsynced, row, statusMapping, syncResults);
        return true;
      } else {
        // All are synced, use the one with matching status if possible
        const matchingStatus = referenceMatches.find(f =>
          f.status_faktur === statusMapping[row.TaxInvoiceStatus]
        );
        if (matchingStatus) {
          await this.updateFakturFromCoretax(matchingStatus, row, statusMapping, syncResults);
          return true;
        } else {
          // Just use the first one
          await this.updateFakturFromCoretax(referenceMatches[0], row, statusMapping, syncResults);
          return true;
        }
      }
    }
    
    // 3. Try partial reference match with different patterns
    const referenceCore = this.extractReferenceCore(row.Reference);
    if (referenceCore) {
      const partialMatches = await db.select()
        .from(faktur)
        .where(like(faktur.referensi, `%${referenceCore}%`))
        .limit(1);
        
      if (partialMatches.length > 0) {
        await this.updateFakturFromCoretax(partialMatches[0], row, statusMapping, syncResults);
        return true;
      }
    }
    
    // 4. Try invoice number match (if we have an invoice number)
    if (row.TaxInvoiceNumber && row.TaxInvoiceNumber.trim() !== '') {
      const invoiceMatches = await db.select()
        .from(faktur)
        .where(eq(faktur.nomor_faktur_pajak, row.TaxInvoiceNumber))
        .limit(1);
        
      if (invoiceMatches.length > 0) {
        await this.updateFakturFromCoretax(invoiceMatches[0], row, statusMapping, syncResults);
        return true;
      }
    }
    
    // 5. Try matching based on NPWP and buyer data with date proximity
    // This is a last resort for when references don't match
    if (row.BuyerTIN && row.SellerTIN) {
      // Get the invoice date as a date object
      const invoiceDate = row.TaxInvoiceDate ? new Date(row.TaxInvoiceDate) : null;
      
      if (invoiceDate) {
        // Look for unsynced fakturs with the same seller and buyer, within a 3 day window
        // and that haven't been synced with Coretax yet
        const dateStart = new Date(invoiceDate);
        dateStart.setDate(dateStart.getDate() - 3);
        
        const dateEnd = new Date(invoiceDate);
        dateEnd.setDate(dateEnd.getDate() + 3);
        
        const possibleMatches = await db.select()
          .from(faktur)
          .where(and(
            eq(faktur.npwp_penjual, row.SellerTIN),
            eq(faktur.npwp_nik_pembeli, row.BuyerTIN),
            isNull(faktur.coretax_record_id),
            sql`tanggal_faktur BETWEEN ${dateStart.toISOString()} AND ${dateEnd.toISOString()}`
          ))
          .limit(1);
          
        if (possibleMatches.length > 0) {
          await this.updateFakturFromCoretax(possibleMatches[0], row, statusMapping, syncResults);
          return true;
        }
      }
    }
    
    // No match found by any method
    return false;
  }
  
  /**
   * Update a faktur with data from Coretax
   */
  private static async updateFakturFromCoretax(matchedFaktur: any, row: any, statusMapping: Record<string, string>, syncResults: CoretaxSyncResult) {
    // Check if this is a new sync or an update for this faktur
    const isNewSync = !matchedFaktur.coretax_record_id;
    
    // Update faktur with data from Coretax
    await db.update(faktur)
      .set({
        tanggal_faktur: row.TaxInvoiceDate? new Date(row.TaxInvoiceDate) : null,
        nomor_faktur_pajak: row.TaxInvoiceNumber || '',
        status_faktur: statusMapping[row.TaxInvoiceStatus] as any,
        coretax_record_id: row.RecordId,
        is_uploaded_to_coretax: true,
        last_sync_date: new Date(),
      })
      .where(eq(faktur.id, matchedFaktur.id));
    
    // Update coretaxData with local faktur ID
    await db.update(coretaxData)
      .set({ local_faktur_id: matchedFaktur.id })
      .where(eq(coretaxData.record_id, row.RecordId));
    
    // Update faktur detail dengan data dari Coretax
    await this.updateFakturDetail(matchedFaktur.id, row);
    
    // Track the result
    if (isNewSync) {
      syncResults.synced++;
    } else {
      syncResults.updated++;
    }
    
    syncResults.details.push({
      reference: row.Reference,
      status: 'synced',
      fakturId: matchedFaktur.id,
      coretaxRecordId: row.RecordId,
      taxInvoiceNumber: row.TaxInvoiceNumber || '(Belum Ada)',
      taxInvoiceStatus: row.TaxInvoiceStatus
    });
    
    // If this is an amended faktur, handle the relationship
    if (row.AmendedRecordId) {
      await this.processAmendedRecord(matchedFaktur.id, row.AmendedRecordId, syncResults);
    }
  }
  
  /**
   * Process amended faktur relationships
   */
  private static async processAmendedRecord(currentFakturId: string, amendedRecordId: string, syncResults: CoretaxSyncResult) {
    // Find the original Coretax data
    const originalCoretaxData = await db.select()
      .from(coretaxData)
      .where(eq(coretaxData.record_id, amendedRecordId))
      .limit(1);
    
    if (originalCoretaxData.length > 0 && originalCoretaxData[0].local_faktur_id) {
      // Update faktur to add reference to original faktur
      await db.update(faktur)
        .set({ amended_from_faktur_id: originalCoretaxData[0].local_faktur_id })
        .where(eq(faktur.id, currentFakturId));
        
      syncResults.updated++;
    } else {
      // Try to find if there's a faktur already linked to this amendedRecordId
      const relatedFaktur = await db.select()
        .from(faktur)
        .where(eq(faktur.coretax_record_id, amendedRecordId))
        .limit(1);
        
      if (relatedFaktur.length > 0) {
        // Update faktur to add reference to original faktur
        await db.update(faktur)
          .set({ amended_from_faktur_id: relatedFaktur[0].id })
          .where(eq(faktur.id, currentFakturId));
          
        syncResults.updated++;
      }
    }
  }
  
  /**
   * Extract core part of reference for partial matching
   * Example: "009-2/MMS-SII/II/2025" -> "MMS-SII"
   */
  private static extractReferenceCore(reference: string): string | null {
    // Try the standard format first: XXX-X/YYY-ZZZ/XX/XXXX
    let match = reference.match(/\d+-\d+\/([A-Z]+-[A-Z]+)\/[A-Z]+\/\d+/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Try alternative format: XXX-X/YYY-ZZZ-X-XXXXX/XX/XXXX
    match = reference.match(/\d+-\d+\/([A-Z]+-[A-Z]+-[A-Z]-\d+)\/[A-Z]+\/\d+/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Try another format: XXX/XXX/YYY-ZZZ/XX/XXXX
    match = reference.match(/\d+\/\d+\/([A-Z]+-[A-Z]+)\/[A-Z]+\/\d+/);
    if (match && match[1]) {
      return match[1];
    }
    
    // If all else fails, extract any part that looks like "XXX-YYY"
    match = reference.match(/([A-Z]+-[A-Z]+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Get sync status metrics
   */
  static async getSyncStatus() {
    try {
      // Count total fakturs
      const totalFakturResult = await db
        .select({ count: count() })
        .from(faktur);
      const totalFaktur = totalFakturResult[0].count;
      
      // Count synced fakturs
      const syncedFakturResult = await db
        .select({ count: count() })
        .from(faktur)
        .where(not(isNull(faktur.coretax_record_id)));
      const syncedFaktur = syncedFakturResult[0].count;
      
      // Get latest sync date
      const latestSyncResult = await db
        .select({ date: sql`MAX(sync_date)` })
        .from(coretaxData);
      const latestSync = latestSyncResult[0].date;
      
      // Count by status
      const statusCountsResult = await db
        .select({
          status: faktur.status_faktur,
          count: count(),
        })
        .from(faktur)
        .groupBy(faktur.status_faktur);
      
      // Count by sync status
      const syncedCount = await db
        .select({ count: count() })
        .from(faktur)
        .where(not(isNull(faktur.coretax_record_id)));
        
      const notSyncedCount = await db
        .select({ count: count() })
        .from(faktur)
        .where(isNull(faktur.coretax_record_id));
      
      const syncStatus = {
        synced: syncedCount[0].count,
        notSynced: notSyncedCount[0].count
      };
      
      // Format status counts
      const statusCounts = statusCountsResult.map(item => ({
        status: item.status,
        count: item.count
      }));
      
      // Get recent sync activity
      const recentSyncActivity = await db
        .select({
          record_id: coretaxData.record_id,
          reference: coretaxData.reference,
          tax_invoice_number: coretaxData.tax_invoice_number,
          tax_invoice_status: coretaxData.tax_invoice_status,
          sync_date: coretaxData.sync_date
        })
        .from(coretaxData)
        .orderBy(desc(coretaxData.sync_date))
        .limit(5);

      return {
        total: totalFaktur,
        synced: syncedFaktur,
        notSynced: totalFaktur - syncedFaktur,
        syncPercentage: totalFaktur > 0 ? Math.round((syncedFaktur / totalFaktur) * 100) : 0,
        latestSync,
        statusCounts,
        syncStatus,
        recentActivity: recentSyncActivity
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }
  
  /**
   * Get Coretax details by record ID
   */
  static async getCoretaxDataById(recordId: string) {
    try {
      const data = await db.select()
        .from(coretaxData)
        .where(eq(coretaxData.record_id, recordId))
        .limit(1);
        
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting Coretax data by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get all faktur amendements
   */
  static async getAmendedFakturs(fakturId: string) {
    try {
      return await db.select()
        .from(faktur)
        .where(eq(faktur.amended_from_faktur_id, fakturId));
    } catch (error) {
      console.error('Error getting amended fakturs:', error);
      throw error;
    }
  }

  /**
   * Update faktur detail dengan data dari Coretax
   */
  private static async updateFakturDetail(fakturId: string, row: any) {
    try {
      // Ambil semua detail faktur untuk faktur yang sedang diupdate
      const detailItems = await db.select()
        .from(fakturDetail)
        .where(eq(fakturDetail.id_faktur, fakturId));
      
      if (detailItems.length === 0) {
        console.log(`Tidak ada item detail untuk faktur ID: ${fakturId}`);
        return;
      }

      // Konversi nilai dari Excel ke angka
      const sellingPrice = parseFloat(row.SellingPrice) || 0;
      const otherTaxBase = parseFloat(row.OtherTaxBase) || 0;
      const vat = parseFloat(row.VAT) || 0;

      // Jika hanya ada satu item detail, update langsung
      if (detailItems.length === 1) {
        await db.update(fakturDetail)
          .set({
            harga_satuan: sellingPrice,
            dpp_nilai_lain: otherTaxBase,
            ppn: vat
          })
          .where(eq(fakturDetail.id_detail_faktur, detailItems[0].id_detail_faktur));
        return;
      }

      // Jika ada beberapa item detail, hitung total DPP saat ini
      const totalDppResult = await db.select({
        total: sum(fakturDetail.dpp)
      })
        .from(fakturDetail)
        .where(eq(fakturDetail.id_faktur, fakturId));
      
      const totalDpp = totalDppResult[0]?.total || 0;

      // Update setiap item detail secara proporsional
      for (const item of detailItems) {
        // Hitung proporsi berdasarkan DPP
        const proportion = totalDpp > 0 ? item.dpp / totalDpp : 1 / detailItems.length;
        
        // Distribusikan nilai secara proporsional
        const itemSellingPrice = proportion * sellingPrice;
        const itemOtherTaxBase = proportion * otherTaxBase;
        const itemVat = proportion * vat;
        
        // Update item detail
        await db.update(fakturDetail)
          .set({
            harga_satuan: itemSellingPrice,
            dpp_nilai_lain: itemOtherTaxBase,
            ppn: itemVat
          })
          .where(eq(fakturDetail.id_detail_faktur, item.id_detail_faktur));
      }
    } catch (error) {
      console.error(`Error updating faktur detail for faktur ID: ${fakturId}`, error);
    }
  }

  /**
   * Find fakturs that failed to sync
   */
  static async getUnmatchedFakturs() {
    try {
      // Get the most recent upload
      const latestSyncResult = await db
        .select({ date: sql`MAX(sync_date)` })
        .from(coretaxData);
      
      if (!latestSyncResult[0].date) {
        return [];
      }
      
      const latestSync = new Date(latestSyncResult[0].date);
      // Get records from last 24 hours
      const syncCutoff = new Date(latestSync);
      syncCutoff.setHours(syncCutoff.getHours() - 24);
      
      // Find coretax records without a local faktur match from the recent upload
      const unmatchedRecords = await db
        .select({
          record_id: coretaxData.record_id,
          reference: coretaxData.reference,
          tax_invoice_number: coretaxData.tax_invoice_number,
          tax_invoice_status: coretaxData.tax_invoice_status,
          sync_date: coretaxData.sync_date
        })
        .from(coretaxData)
        .where(and(
          isNull(coretaxData.local_faktur_id),
          sql`sync_date >= ${syncCutoff.toISOString()}`
        ))
        .limit(100);
      
      return unmatchedRecords;
    } catch (error) {
      console.error('Error getting unmatched fakturs:', error);
      throw error;
    }
  }

  /**
   * Manually link a Coretax record to a faktur
   */
  static async linkCoretaxToFaktur(coretaxRecordId: string, fakturId: string) {
    try {
      // Check if both records exist
      const coretaxRecord = await this.getCoretaxDataById(coretaxRecordId);
      if (!coretaxRecord) {
        throw new Error('Record Coretax tidak ditemukan');
      }
      
      const fakturRecord = await db.select()
        .from(faktur)
        .where(eq(faktur.id, fakturId))
        .limit(1);
        
      if (fakturRecord.length === 0) {
        throw new Error('Faktur tidak ditemukan');
      }
      
      // Update the faktur with Coretax data
      await db.update(faktur)
        .set({
          nomor_faktur_pajak: coretaxRecord.tax_invoice_number || '',
          status_faktur: coretaxRecord.tax_invoice_status as any,
          coretax_record_id: coretaxRecord.record_id,
          is_uploaded_to_coretax: true,
          last_sync_date: new Date(),
        })
        .where(eq(faktur.id, fakturId));
      
      // Update the Coretax data with local faktur ID
      await db.update(coretaxData)
        .set({ local_faktur_id: fakturId })
        .where(eq(coretaxData.record_id, coretaxRecordId));
      
      // If this is an amended record, handle that relationship
      if (coretaxRecord.amended_record_id) {
        await this.processAmendedRecord(fakturId, coretaxRecord.amended_record_id, {
          total: 0,
          synced: 0,
          notFound: 0,
          updated: 0,
          details: []
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error linking Coretax to faktur:', error);
      throw error;
    }
  }
  // Tambahkan ke src/lib/services/coretax-service.ts
// Perbarui di src/lib/services/coretax-service.ts

static async getRelatedTransactions(fakturId: string) {
  try {
    // Dapatkan faktur target
    const targetFaktur = await db.select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
    
    if (targetFaktur.length === 0) {
      throw new Error('Faktur tidak ditemukan');
    }
    
    const referensi = targetFaktur[0].referensi;
    
    // Jika tidak ada referensi, return early
    if (!referensi) {
      return {
        original: targetFaktur[0],
        related: [],
        chain: [],
        detailItems: {}
      };
    }
    
    // Parse referensi untuk mendapatkan bagian utama
    const parts = this.parseReferencePattern(referensi);
    
    if (!parts) {
      return {
        original: targetFaktur[0],
        related: [],
        chain: [],
        detailItems: {}
      };
    }
    
    // Cari semua faktur dengan prefix, partner, dan periode yang sama
    const relatedFakturs = await db.select()
      .from(faktur)
      .where(
        and(
          like(faktur.referensi, `${parts.prefix}-%/${parts.partner}/${parts.period}`),
        )
      )
      .orderBy(faktur.tanggal_faktur);
    
    // Buat rantai transaksi
    let chain = [...relatedFakturs];
    
    // Urutkan berdasarkan tipe transaksi (1 = DP, 2 = Pelunasan)
    chain = chain.sort((a, b) => {
      const typeA = this.parseReferencePattern(a.referensi || "")?.type || "0";
      const typeB = this.parseReferencePattern(b.referensi || "")?.type || "0";
      return parseInt(typeA) - parseInt(typeB);
    });
    
    // Objek untuk menyimpan detail item untuk setiap transaksi
    const detailItems: Record<string, any[]> = {};
    
    // Ambil informasi keuangan detail untuk setiap item dalam rantai
    const detailedChain = await Promise.all(chain.map(async (item) => {
      // Dapatkan detail faktur
      const details = await db.select()
        .from(fakturDetail)
        .where(eq(fakturDetail.id_faktur, item.id));
      
      // Simpan detail item untuk faktur ini
      detailItems[item.id] = details;
      
      // Hitung total dengan aman
      const totalDPP = details.reduce((sum, detail) => {
        const dppValue = parseFloat(detail.dpp.toString());
        return sum + (isNaN(dppValue) ? 0 : dppValue);
      }, 0);
      
      const totalPPN = details.reduce((sum, detail) => {
        const ppnValue = parseFloat(detail.ppn.toString());
        return sum + (isNaN(ppnValue) ? 0 : ppnValue);
      }, 0);
      
      // Dapatkan tipe transaksi
      const parsedRef = this.parseReferencePattern(item.referensi || "");
      const transactionType = parsedRef?.type === "1" ? "DP" : "Pelunasan";
      
      return {
        ...item,
        detailCount: details.length,
        totalDPP,
        totalPPN,
        grandTotal: totalDPP + totalPPN,
        transactionType
      };
    }));
    
    return {
      original: targetFaktur[0],
      related: relatedFakturs.filter(item => item.id !== fakturId),
      chain: detailedChain,
      detailItems: detailItems
    };
  } catch (error) {
    console.error('Error getting related transactions:', error);
    throw error;
  }
}

  /**
   * Helper untuk parsing format referensi
   */
  private static parseReferencePattern(referensi: string) {
    // Pola: "059-1/MMS-OSS/II/2025"
    const regex = /^(\d+)-(\d+)\/([^\/]+)\/(.+)$/;
    const match = referensi.match(regex);
  
    if (!match) return null;
  
    return {
      prefix: match[1],      // "059"
      type: match[2],        // "1" atau "2" 
      partner: match[3],     // "MMS-OSS"
      period: match[4]       // "II/2025"
    };
  }
}