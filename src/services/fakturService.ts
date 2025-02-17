import { FakturData, DetailFakturData } from '@/types/faktur';

export class FakturService {
  static async saveFaktur(fakturData: FakturData & { id: string }) {
    try {
      const response = await fetch('/api/faktur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fakturData),
      });

      if (!response.ok) {
        throw new Error('Failed to save faktur');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving faktur:', error);
      throw error;
    }
  }

  static async saveDetailFaktur(detailData: DetailFakturData & { id_detail_faktur: string }) {
    try {
      const response = await fetch('/api/detail-faktur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailData),
      });

      if (!response.ok) {
        throw new Error('Failed to save detail');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving detail:', error);
      throw error;
    }
  }
}
