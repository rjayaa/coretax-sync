'use client';


import { KeteranganTambahan } from '@/types/keterangan-tambahan';
import { useState, useEffect } from 'react';



export function useKeteranganTambahan(kodeTransaksi: string) {
  const [data, setData] = useState<KeteranganTambahan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeteranganTambahan = async () => {
      if (!kodeTransaksi) {
        setData([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/references/keterangan-tambahan?kodeTransaksi=${kodeTransaksi}`);
        if (!response.ok) {
          throw new Error('Failed to fetch keterangan tambahan');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeteranganTambahan();
  }, [kodeTransaksi]);

  return { data, isLoading, error };
}