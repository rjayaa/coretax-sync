'use client';

import { KodeTransaksi } from '@/types/kode-transaksi';
import { useState, useEffect } from 'react';


export function useKodeTransaksi() {
  const [data, setData] = useState<KodeTransaksi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKodeTransaksi = async () => {
      try {
        const response = await fetch('/api/references/kode-transaksi');
        if (!response.ok) {
          throw new Error('Failed to fetch kode transaksi');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKodeTransaksi();
  }, []);

  return { data, isLoading, error };
}