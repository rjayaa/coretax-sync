'use client'

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useCustomers } from '@/hooks/use-customer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, FileText, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";

const InvoiceTable = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ALL');
  const [customerFilter, setCustomerFilter] = useState('ALL');

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch customers data
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();

  // Fetch invoices with filters
  const { data: invoicesData, isLoading, error } = useQuery({
    queryKey: ['invoices', startDate, endDate, status, customerFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status !== 'ALL') params.append('status', status);
      if (customerFilter !== 'ALL') params.append('customerId', customerFilter);

      console.log('Fetching with params:', params.toString());
      
      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoices');
      }
      
      return data;
    },
    enabled: !!session?.user?.username && isMounted,
  });

  // Formatting functions
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'EXPORTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Clear filter function
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('ALL');
    setCustomerFilter('ALL');
  };

  // Loading and error states
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  const invoices = invoicesData?.invoices || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle>Daftar Faktur Pajak</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {invoices.length} faktur
            </p>
          </div>
          <Button 
            onClick={() => router.push('/invoices/create')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Buat Faktur Baru
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Date range filter */}
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  max={endDate || undefined}
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <span>-</span>
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                  min={startDate || undefined}
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Status filter */}
            <Select 
              value={status} 
              onValueChange={setStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="EXPORTED">Exported</SelectItem>
              </SelectContent>
            </Select>

            {/* Customer filter */}
            <Select 
              value={customerFilter} 
              onValueChange={setCustomerFilter}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={
                  isLoadingCustomers 
                    ? "Loading customers..." 
                    : "Filter Customer"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Customer</SelectItem>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.nama} - {customer.npwp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear filters */}
            {(startDate || endDate || status !== 'ALL' || customerFilter !== 'ALL') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-10"
              >
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => console.log('Export XML')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export XML
            </Button>
            <Button 
              variant="outline" 
              onClick={() => console.log('Export Excel')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>
      </CardHeader>
    <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal Faktur</TableHead>
                <TableHead>No Faktur</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>NPWP</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">DPP</TableHead>
                <TableHead className="text-right">PPN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!invoices || invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-muted-foreground">
                        Tidak ada data faktur
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell className="font-mono">{invoice.number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.company}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{invoice.npwp}</TableCell>
                    <TableCell>{invoice.type}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(invoice.dpp)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(invoice.ppn)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={getStatusBadgeColor(invoice.status)}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                        >
                          Detail
                        </Button>
                        {invoice.status === 'DRAFT' && (
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                          >
                            Edit
                          </Button>
                        )}
                        {invoice.status === 'APPROVED' && (
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => console.log('Export invoice', invoice.id)}
                          >
                            Export
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceTable;