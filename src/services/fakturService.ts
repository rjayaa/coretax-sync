// /src/services/FakturService.ts

import { FakturData, DetailFakturData } from '@/types/faktur';

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResponse<T> {
  fakturs: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FakturWithDetails {
  faktur: FakturData & { id: string };
  details: DetailFakturData[];
}

export class FakturService {
  // Fungsi untuk mengkonversi nilai ke number dengan aman (mencegah NaN)
  private static safeNumber(value: any, defaultValue = 0): number | null {
    if (value === null || value === undefined || value === '') {
      return defaultValue; // Return default jika kosong
    }
    
    // Jika string, coba parse
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Jika NaN, kembalikan default
    return isNaN(numValue) ? defaultValue : numValue;
  }

  // Fungsi untuk memastikan nilai integer yang valid
  private static safeInteger(value: any, defaultValue = 0): number | null {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    // Jika string, coba parse
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    
    // Jika NaN, kembalikan default
    return isNaN(numValue) ? defaultValue : numValue;
  }

  // Transform DetailFakturData dari format frontend ke API
  static async saveDetailFaktur(detailData: DetailFakturData & { id_detail_faktur: string }): Promise<DetailFakturData> {
    try {
      console.log("Original detail data:", detailData);
      
      // Siapkan data yang akan dikirim ke API
      const apiData = {
        id_detail_faktur: detailData.id_detail_faktur,
        id_faktur: detailData.id_faktur,
        barang_or_jasa: detailData.barang_or_jasa || null,
        kode_barang_or_jasa: detailData.kode_barang_or_jasa || null,
        nama_barang_or_jasa: detailData.nama_barang_or_jasa || null,
        nama_satuan_ukur: detailData.nama_satuan_ukur,
        harga_satuan: FakturService.safeNumber(detailData.harga_satuan),
        // Handle jumlah_barang dan jumlah_jasa dengan aman
        jumlah_barang: detailData.barang_or_jasa === 'a' ? 
          FakturService.safeInteger(detailData.jumlah_barang_jasa, 1) : 
          null,
        jumlah_jasa: detailData.barang_or_jasa === 'b' ? 
          FakturService.safeInteger(detailData.jumlah_barang_jasa, 1) : 
          null,
        diskon_persen: FakturService.safeNumber(detailData.total_diskon, 0),
        dpp: FakturService.safeNumber(detailData.dpp),
        dpp_nilai_lain: FakturService.safeNumber(detailData.dpp_nilai_lain),
        tarif_ppn: FakturService.safeNumber(detailData.tarif_ppn, 12),
        ppn: FakturService.safeNumber(detailData.ppn),
        tarif_ppnbm: FakturService.safeNumber(detailData.tarif_ppnbm, 0),
        ppnbm: FakturService.safeNumber(detailData.ppnbm, 0)
      };
      
      console.log("Transformed data for API:", apiData);
      
      const response = await fetch('/api/detail-faktur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save detail faktur');
      }

      const responseData = await response.json();
      
      // Transform kembali ke format frontend
      const frontendData: DetailFakturData = {
        id_detail_faktur: responseData.id_detail_faktur,
        id_faktur: responseData.id_faktur,
        barang_or_jasa: responseData.barang_or_jasa || '',
        kode_barang_or_jasa: responseData.kode_barang_or_jasa || '',
        nama_barang_or_jasa: responseData.nama_barang_or_jasa || '',
        nama_satuan_ukur: responseData.nama_satuan_ukur || '',
        harga_satuan: responseData.harga_satuan?.toString() || '0',
        jumlah_barang_jasa: (responseData.barang_or_jasa === 'a' 
          ? responseData.jumlah_barang 
          : responseData.jumlah_jasa)?.toString() || '0',
        jumlah_barang: responseData.jumlah_barang?.toString() || '0',
        jumlah_jasa: responseData.jumlah_jasa?.toString() || '0',
        total_diskon: responseData.diskon_persen?.toString() || '0',
        dpp: responseData.dpp?.toString() || '0',
        dpp_nilai_lain: responseData.dpp_nilai_lain?.toString() || '0',
        tarif_ppn: responseData.tarif_ppn?.toString() || '12.00',
        ppn: responseData.ppn?.toString() || '0',
        tarif_ppnbm: responseData.tarif_ppnbm?.toString() || '0',
        ppnbm: responseData.ppnbm?.toString() || '0'
      };
      
      return frontendData;
    } catch (error) {
      console.error('Error saving detail faktur:', error);
      throw error;
    }
  }

  // Save a new faktur
  static async saveFaktur(fakturData: FakturData): Promise<FakturData & { id: string }> {
    try {
      const response = await fetch('/api/faktur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fakturData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save faktur');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving faktur:', error);
      throw error;
    }
  }

  // Get fakturs with pagination and filters
  static async getFakturs(params: PaginationParams = {}): Promise<PaginatedResponse<FakturData & { id: string }>> {
    const { page = 1, limit = 10, search = '', startDate, endDate } = params;
    
    let url = `/api/faktur?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (startDate && endDate) {
      url += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch fakturs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching fakturs:', error);
      throw error;
    }
  }

  // Get a single faktur by ID
  static async getFaktur(id: string): Promise<FakturData & { id: string }> {
    try {
      const response = await fetch(`/api/faktur/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch faktur');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching faktur with ID ${id}:`, error);
      throw error;
    }
  }

  // Get faktur details by faktur ID
  static async getFakturDetails(fakturId: string): Promise<DetailFakturData[]> {
    try {
      const response = await fetch(`/api/detail-faktur?fakturId=${fakturId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch faktur details');
      }
      
      const responseData = await response.json();
      
      // Transform API data to frontend format
      return responseData.map((detail: any): DetailFakturData => ({
        id_detail_faktur: detail.id_detail_faktur,
        id_faktur: detail.id_faktur,
        barang_or_jasa: detail.barang_or_jasa || '',
        kode_barang_or_jasa: detail.kode_barang_or_jasa || '',
        nama_barang_or_jasa: detail.nama_barang_or_jasa || '',
        nama_satuan_ukur: detail.nama_satuan_ukur || '',
        harga_satuan: detail.harga_satuan?.toString() || '0',
        jumlah_barang_jasa: (detail.barang_or_jasa === 'a' 
          ? detail.jumlah_barang 
          : detail.jumlah_jasa)?.toString() || '0',
        jumlah_barang: detail.jumlah_barang?.toString() || '0',
        jumlah_jasa: detail.jumlah_jasa?.toString() || '0',
        total_diskon: detail.diskon_persen?.toString() || '0',
        dpp: detail.dpp?.toString() || '0',
        dpp_nilai_lain: detail.dpp_nilai_lain?.toString() || '0',
        tarif_ppn: detail.tarif_ppn?.toString() || '12.00',
        ppn: detail.ppn?.toString() || '0',
        tarif_ppnbm: detail.tarif_ppnbm?.toString() || '0',
        ppnbm: detail.ppnbm?.toString() || '0'
      }));
    } catch (error) {
      console.error(`Error fetching details for faktur ID ${fakturId}:`, error);
      throw error;
    }
  }

  // Get a faktur with its details
  static async getFakturWithDetails(fakturId: string): Promise<FakturWithDetails> {
    try {
      const [faktur, details] = await Promise.all([
        FakturService.getFaktur(fakturId),
        FakturService.getFakturDetails(fakturId)
      ]);
      
      return { faktur, details };
    } catch (error) {
      console.error(`Error fetching faktur with details for ID ${fakturId}:`, error);
      throw error;
    }
  }

  // Update an existing faktur
  static async updateFaktur(id: string, fakturData: Partial<FakturData>): Promise<FakturData & { id: string }> {
    try {
      const response = await fetch(`/api/faktur/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fakturData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update faktur');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating faktur with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a detail faktur
  static async updateDetailFaktur(
    id: string, 
    detailData: Partial<DetailFakturData>
  ): Promise<DetailFakturData> {
    try {
      // Transform data for API - partial data handling
      const transformedData: any = {};
      
      // Transform numeric fields dengan penanganan NaN yang lebih baik
      if (detailData.harga_satuan !== undefined) 
        transformedData.harga_satuan = FakturService.safeNumber(detailData.harga_satuan);
      
      if (detailData.dpp !== undefined) 
        transformedData.dpp = FakturService.safeNumber(detailData.dpp);
      
      if (detailData.dpp_nilai_lain !== undefined) 
        transformedData.dpp_nilai_lain = FakturService.safeNumber(detailData.dpp_nilai_lain);
      
      if (detailData.ppn !== undefined) 
        transformedData.ppn = FakturService.safeNumber(detailData.ppn);
      
      if (detailData.tarif_ppn !== undefined) 
        transformedData.tarif_ppn = FakturService.safeNumber(detailData.tarif_ppn, 12);
      
      if (detailData.tarif_ppnbm !== undefined) 
        transformedData.tarif_ppnbm = FakturService.safeNumber(detailData.tarif_ppnbm, 0);
      
      if (detailData.ppnbm !== undefined) 
        transformedData.ppnbm = FakturService.safeNumber(detailData.ppnbm, 0);
      
      if (detailData.total_diskon !== undefined) 
        transformedData.diskon_persen = FakturService.safeNumber(detailData.total_diskon, 0);
      
      // Handle quantity fields
      if (detailData.jumlah_barang_jasa !== undefined) {
        if (detailData.barang_or_jasa === 'a') {
          transformedData.jumlah_barang = FakturService.safeInteger(detailData.jumlah_barang_jasa, 1);
        } else if (detailData.barang_or_jasa === 'b') {
          transformedData.jumlah_jasa = FakturService.safeInteger(detailData.jumlah_barang_jasa, 1);
        }
      }
      
      // Copy non-numeric fields directly
      if (detailData.nama_barang_or_jasa !== undefined) 
        transformedData.nama_barang_or_jasa = detailData.nama_barang_or_jasa;
      
      if (detailData.kode_barang_or_jasa !== undefined) 
        transformedData.kode_barang_or_jasa = detailData.kode_barang_or_jasa;
      
      if (detailData.nama_satuan_ukur !== undefined) 
        transformedData.nama_satuan_ukur = detailData.nama_satuan_ukur;
      
      if (detailData.barang_or_jasa !== undefined) 
        transformedData.barang_or_jasa = detailData.barang_or_jasa;
      
      const response = await fetch(`/api/detail-faktur/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update detail faktur');
      }

      const responseData = await response.json();
      
      // Transform kembali ke format frontend
      return {
        id_detail_faktur: responseData.id_detail_faktur,
        id_faktur: responseData.id_faktur,
        barang_or_jasa: responseData.barang_or_jasa || '',
        kode_barang_or_jasa: responseData.kode_barang_or_jasa || '',
        nama_barang_or_jasa: responseData.nama_barang_or_jasa || '',
        nama_satuan_ukur: responseData.nama_satuan_ukur || '',
        harga_satuan: responseData.harga_satuan?.toString() || '0',
        jumlah_barang_jasa: (responseData.barang_or_jasa === 'a' 
          ? responseData.jumlah_barang 
          : responseData.jumlah_jasa)?.toString() || '0',
        jumlah_barang: responseData.jumlah_barang?.toString() || '0',
        jumlah_jasa: responseData.jumlah_jasa?.toString() || '0',
        total_diskon: responseData.diskon_persen?.toString() || '0',
        dpp: responseData.dpp?.toString() || '0',
        dpp_nilai_lain: responseData.dpp_nilai_lain?.toString() || '0',
        tarif_ppn: responseData.tarif_ppn?.toString() || '12.00',
        ppn: responseData.ppn?.toString() || '0',
        tarif_ppnbm: responseData.tarif_ppnbm?.toString() || '0',
        ppnbm: responseData.ppnbm?.toString() || '0'
      };
    } catch (error) {
      console.error(`Error updating detail faktur with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a faktur
  static async deleteFaktur(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/faktur/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete faktur');
      }
    } catch (error) {
      console.error(`Error deleting faktur with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a detail faktur
  static async deleteDetailFaktur(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/detail-faktur/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete detail faktur');
      }
    } catch (error) {
      console.error(`Error deleting detail faktur with ID ${id}:`, error);
      throw error;
    }
  }
}