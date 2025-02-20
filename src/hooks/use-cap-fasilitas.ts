'use client';


import { CapFasilitas } from '@/types/cap-fasilitas';
import { useState, useEffect } from 'react';


export function useCapFasilitas(kodeTransaksi: string) {
  const [data, setData] = useState<CapFasilitas[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapFasilitas = async () => {
      if (!kodeTransaksi) {
        setData([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/references/cap-fasilitas?kodeTransaksi=${kodeTransaksi}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cap fasilitas');
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapFasilitas();
  }, [kodeTransaksi]);

  return { data, isLoading, error };
}