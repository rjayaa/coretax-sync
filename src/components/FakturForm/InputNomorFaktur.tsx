// components/FakturForm/InputNomorFaktur.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FakturData } from '@/types/faktur';
import { FakturService } from '@/services/fakturService';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NomorFakturInputProps {
  fakturData: FakturData & { id: string };
  onSuccess: (updatedFaktur: FakturData & { id: string }) => void;
}

const NomorFakturInput: React.FC<NomorFakturInputProps> = ({ fakturData, onSuccess }) => {
  const [nomorFaktur, setNomorFaktur] = useState<string>(fakturData.nomor_faktur_pajak || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomorFaktur || nomorFaktur.trim() === '') {
      setError('Nomor faktur pajak tidak boleh kosong');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update faktur dengan nomor faktur pajak baru
      const updatedFaktur = await FakturService.updateFaktur(fakturData.id, {
        ...fakturData,
        nomor_faktur_pajak: nomorFaktur
      });
      
      onSuccess(updatedFaktur);
    } catch (error: any) {
      console.error('Error updating nomor faktur pajak:', error);
      setError(error.message || 'Gagal memperbarui nomor faktur pajak');
      
      toast({
        title: "Error",
        description: "Gagal memperbarui nomor faktur pajak",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Input Nomor Faktur Pajak</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomor_faktur_pajak">
              Nomor Faktur Pajak
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nomor_faktur_pajak"
              value={nomorFaktur}
              onChange={(e) => setNomorFaktur(e.target.value)}
              placeholder="Masukkan nomor faktur pajak"
              className="w-full"
              required
            />
            <p className="text-sm text-muted-foreground">
              Masukkan nomor faktur pajak yang diperoleh dari CoreTax setelah upload data.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NomorFakturInput;