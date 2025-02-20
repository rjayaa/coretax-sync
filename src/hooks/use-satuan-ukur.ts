
'use client';

import { useState, useEffect } from 'react';
import { SatuanUkur } from "@/types/satuan-ukur";


export function useSatuanUkur() {
    const [data, setData] = useState<SatuanUkur[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSatuanUkur = async () => {
            try {
                const response = await fetch('/api/references/satuan-ukur');
                if (!response.ok) {
                    throw new Error('Failed to fetch satuan ukur');
                }
                const data = await response.json();
                setData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSatuanUkur();
    }, []);
    return { data, isLoading, error };
}
    
