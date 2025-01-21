import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Table, Search } from "lucide-react";
import { generateXML } from "@/lib/utils/xml-generator";

interface Invoice {
  id: string;
  invoice_date: string;
  customer: {
    nama: string;
    npwp: string;
  };
  invoice_type: string;
  details: {
    dpp: string;
    ppn: string;
  }[];
  status: string;
}

interface InvoiceListProps {
  onCreateNew: () => void;
}

const InvoiceList = ({ onCreateNew }: InvoiceListProps) => {
  const [invoice, setinvoice] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchinvoice();
  }, [dateRange]);

  const fetchinvoice = async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/invoice?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setinvoice(data.invoice);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewXML = async (id: string) => {
    try {
      const response = await fetch(`/api/invoice/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const { headerData, fakturData, detailItems } = data.invoice;
        const xmlContent = generateXML({ headerData, fakturData, detailItems });
        
        // Create and download XML file
        const blob = new Blob([xmlContent], { type: 'text/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faktur_${id}.xml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error generating XML:', error);
    }
  };

  const handleViewExcel = async (id: string) => {
    try {
      const response = await fetch(`/api/invoice/${id}/excel`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value);
  };

  const calculateTotalDPP = (invoice: Invoice) => {
    return invoice.details.reduce((sum, detail) => sum + Number(detail.dpp), 0);
  };

  const calculateTotalPPN = (invoice: Invoice) => {
    return invoice.details.reduce((sum, detail) => sum + Number(detail.ppn), 0);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Faktur Pajak</CardTitle>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Faktur Baru
        </Button>
      </CardHeader>

      <CardContent>
        {/* Date Filter */}
        <div className="mb-6 flex gap-4 items-end">
          <div>
            <Label>Tanggal Mulai</Label>
            <Input 
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                startDate: e.target.value
              }))}
            />
          </div>
          <div>
            <Label>Tanggal Akhir</Label>
            <Input 
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                endDate: e.target.value
              }))}
            />
          </div>
          <Button 
            variant="secondary"
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
          >
            Reset Filter
          </Button>
        </div>

        {/* invoice Table */}
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">Tanggal</th>
                <th className="py-3 px-4 text-left">Nama Pembeli</th>
                <th className="py-3 px-4 text-left">NPWP</th>
                <th className="py-3 px-4 text-left">Jenis Faktur</th>
                <th className="py-3 px-4 text-right">Total DPP</th>
                <th className="py-3 px-4 text-right">Total PPN</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    Loading...
                  </td>
                </tr>
              ) : invoice.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    Tidak ada data faktur
                  </td>
                </tr>
              ) : (
                invoice.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="py-3 px-4">{new Date(invoice.invoice_date).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4">{invoice.customer.nama}</td>
                    <td className="py-3 px-4">{invoice.customer.npwp}</td>
                    <td className="py-3 px-4">{invoice.invoice_type}</td>
                    <td className="py-3 px-4 text-right">
                      {formatIDR(calculateTotalDPP(invoice))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatIDR(calculateTotalPPN(invoice))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${invoice.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 
                          invoice.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewXML(invoice.id)}
                          title="Export XML"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewExcel(invoice.id)}
                          title="Export Excel"
                        >
                          <Table className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceList;