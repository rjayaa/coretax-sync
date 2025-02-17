import useSWR from 'swr';
import { FakturData } from '@/types/faktur';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useFaktur = (filters?: any) => {
  const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : '';
  const { data, error, isLoading, mutate } = useSWR(
    `/api/faktur${queryString}`,
    fetcher
  );

  return {
    data,
    isLoading,
    error,
    mutate
  };
};