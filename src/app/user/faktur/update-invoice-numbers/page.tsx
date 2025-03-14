// src/app/faktur/update-invoice-numbers/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileCheck, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface UpdateStats {
  totalRecords: number;
  recordsWithInvoiceNumber: number;
  matchedRecords: number;
  updatedRecords: number;
  notFoundRecords: number;
}

export default function UpdateInvoiceNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UpdateStats | null>(null);
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
      setIsUploading(true);
      setError(null);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API route
      const response = await fetch('/api/faktur/update-invoice-numbers', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating invoice numbers');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Update Invoice Numbers from Coretax</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Coretax Export</CardTitle>
          <CardDescription>
            Upload the Excel file exported from Coretax to update invoice numbers in the system.
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
                  disabled={isUploading}
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
            
            <Button type="submit" className="mt-4" disabled={!file || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Processing...' : 'Update Invoice Numbers'}
              {!isUploading && <Upload className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green-500" />
              Update Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold">{result.totalRecords}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Records with Invoice Numbers</p>
                <p className="text-2xl font-bold">{result.recordsWithInvoiceNumber}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Matched Records</p>
                <p className="text-2xl font-bold">{result.matchedRecords}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-gray-500">Updated Records</p>
                <p className="text-2xl font-bold text-green-600">{result.updatedRecords}</p>
              </div>
              <div className="border rounded p-3 col-span-2">
                <p className="text-sm text-gray-500">Records Not Found</p>
                <p className="text-2xl font-bold text-amber-600">{result.notFoundRecords}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-gray-500">
              {result.updatedRecords} records were successfully updated with invoice numbers.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Upload Another File
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}