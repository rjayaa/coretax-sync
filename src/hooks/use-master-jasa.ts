'use client';

import { useState, useEffect } from 'react';
import { MasterDataJasa } from '@/types/barang-jasa';

export function useMasterDataJasa() {
    const [data, setData] = useState<MasterDataJasa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMasterDataJasa = async () => {
            try {
                const response = await fetch('/api/master/jasa');
                if (!response.ok) {
                    throw new Error('Failed to fetch master jasa');
                }
                const data = await response.json();
                setData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMasterDataJasa();
    }, []);

    return { data, isLoading, error };
}