'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCustomers } from '@/hooks/use-customer';
import { useInvoiceFilters } from '@/hooks/use-invoice-filters';
import { useInvoices } from '@/hooks/use-invoice';
import { FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export const InvoiceTable = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();
  const { 
    filters,
    updateFilters,
    clearFilters,
  } = useInvoiceFilters();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const { 
    data: invoicesData, 
    isLoading, 
    error 
  } = useInvoices(filters);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error as Error} />;
  }

  const invoices = invoicesData?.invoices || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle>Daftar Faktur Pajak</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Menampilkan {invoices.length} faktur
              </p>
            </div>
            <Button 
              onClick={() => router.push('/user/invoices/create')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Buat Faktur Baru
            </Button>
          </div>

          <div className="space-y-4">
            {mounted && (
              <InvoiceFilters 
                filters={filters}
                onFilterChange={updateFilters}
                customers={customers || []}
                isLoadingCustomers={isLoadingCustomers}
                onClearFilters={clearFilters}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TableContent invoices={invoices} />
      </CardContent>
    </Card>
  );
};

const LoadingState = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({ error }: { error: Error }) => (
  <Card>
    <CardContent className="p-6">
      <div className="text-red-500">Error: {error.message}</div>
    </CardContent>
  </Card>
);

export default InvoiceTable;