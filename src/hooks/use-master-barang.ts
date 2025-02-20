'use client';

import { useState, useEffect } from 'react';
import { MasterDataBarang } from '@/types/barang-jasa';

export function useMasterDataBarang() {
    const [data, setData] = useState<MasterDataBarang[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMasterDataBarang = async () => {
            try {
                const response = await fetch('/api/master/barang');
                if (!response.ok) {
                    throw new Error('Failed to fetch master barang');
                }
                const data = await response.json();
                setData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMasterDataBarang();
    }, []);

    return { data, isLoading, error };
}