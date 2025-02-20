'use client';

import { useState, useEffect } from 'react';
import { MasterDataCustomer } from '@/types/customer';


export function useMasterCustomer() {
    const [data, setData] = useState<MasterDataCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMasterCustomer = async () => {
            try {
                const response = await fetch('/api/customers');
                if (!response.ok) {
                    throw new Error('Failed to fetch master customer');
                }
                const data = await response.json();
                setData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMasterCustomer();
    }, []);
    return { data, isLoading, error };
}


