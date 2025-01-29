// components/invoice/invoice-table.tsx
'use client'

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation'
const InvoiceTable = () => {
    const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Fetch customers data
  const { data: customers, isLoading: isLoadingCustomers } = useCustomers();

  useEffect(() => {
    const company = localStorage.getItem('selectedCompany');
    if (company) {
      setSelectedCompany(JSON.parse(company));
    }
  }, []);

  // Fetch invoices with filters
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', selectedCompany?.id, startDate, endDate, status, customerFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        companyId: selectedCompany?.id,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
        ...(customerFilter && { customerId: customerFilter })
      });

      const response = await fetch(`/api/invoices?${params}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.invoices;
    },
    enabled: !!selectedCompany?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Loading invoices...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Error loading invoices: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Daftar Faktur Pajak</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedCompany?.company_name}
            </p>
          </div>
          <Button onClick={() => router.push('/invoices/create')}>
            Buat Faktur Baru
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Filter Section */}
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
                placeholder="Start Date"
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
                placeholder="End Date"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="EXPORTED">Exported</SelectItem>
            </SelectContent>
          </Select>

          {/* Customer Filter */}
          <Select 
            value={customerFilter} 
            onValueChange={setCustomerFilter}
            disabled={isLoadingCustomers}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Filter Customer"} />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.nama} - {customer.npwp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => console.log('Export XML')}>
              Export XML
            </Button>
            <Button variant="outline" onClick={() => console.log('Export Excel')}>
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
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.number}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.npwp}</TableCell>
                  <TableCell>{invoice.type}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.dpp)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.ppn)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === 'DRAFT' ? 'bg-gray-100' :
                      invoice.status === 'PENDING' ? 'bg-yellow-100' :
                      invoice.status === 'APPROVED' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Export
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceTable;