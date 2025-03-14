// src/app/faktur/amendment-tracking/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileCheck, AlertCircle, History } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface InvoiceRelation {
  invoiceNumber: string;
  amendedInvoiceNumber: string | null;
  status: string;
  reference: string;
  date: string;
}

interface InvoiceChain {
  reference: string;
  invoices: {
    invoiceNumber: string;
    status: string;
    date: string;
    isLatest: boolean;
  }[];
}

interface ProcessResult {
  totalRecords: number;
  amendedRecords: number;
  uniqueReferences: number;
  invoiceChains: InvoiceChain[];
}

export default function AmendmentTrackingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API route
      const response = await fetch('/api/faktur/process-amendments', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error processing amendments');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'AMENDED': return 'bg-amber-100 text-amber-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Invoice Amendment Tracking</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Coretax Export</CardTitle>
          <CardDescription>
            Upload the Excel file from Coretax to analyze invoice amendment chains.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="file">Coretax Export File (Excel)</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="mt-4" disabled={!file || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : 'Analyze Amendments'}
              <History className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-blue-500" />
              Amendment Analysis Results
            </CardTitle>
            <CardDescription>
              Showing invoice amendment chains from your Coretax export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold">{result.totalRecords}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Amended Records</p>
                <p className="text-2xl font-bold text-amber-600">{result.amendedRecords}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Unique References</p>
                <p className="text-2xl font-bold text-blue-600">{result.uniqueReferences}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-3">Amendment Chains</h3>
            <Accordion type="multiple" className="w-full">
              {result.invoiceChains.map((chain, index) => (
                <AccordionItem value={`chain-${index}`} key={index}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span className="font-medium">{chain.reference}</span>
                        <Badge className="ml-3 bg-amber-100 text-amber-800">
                          {chain.invoices.length} version{chain.invoices.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(chain.invoices[0].status)}>
                        {chain.invoices[0].status}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Version</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chain.invoices.map((invoice, i) => (
                            <TableRow key={i} className={invoice.isLatest ? 'bg-blue-50' : ''}>
                              <TableCell className="font-medium">
                                {invoice.invoiceNumber}
                                {invoice.isLatest && (
                                  <Badge className="ml-2 bg-blue-100 text-blue-800">Latest</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">v{chain.invoices.length - i}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">
                Showing amendment relationships for {result.invoiceChains.length} invoice references
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            >
              Upload Another File
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}