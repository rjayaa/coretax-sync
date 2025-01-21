"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft } from "lucide-react";
import HeaderForm from "./header-form";
import DetailForm from "./detail-form";
import PreviewXML from "./preview-xml";
import PreviewExcel from "./preview-excel";
import { generateXML } from "@/lib/utils/xml-generator";
// import { generateExcel } from "@/lib/utils/excel-generator";
import { DEFAULT_DETAIL_ITEM, TAB_LIST, TRANSACTION_TYPES } from "@/lib/constants/tax-invoice";
import type { HeaderData, FakturData, DetailItem, TransactionType, } from "@/types/tax-invoice";

type TabType = typeof TAB_LIST[number];

export default function TaxInvoiceForm() {
  const [activeTab, setActiveTab] = useState<TabType>("header");
  const [error, setError] = useState("");

  // State untuk data faktur
    // State untuk data faktur
    const [headerData, setHeaderData] = useState<HeaderData>({
      npwpPenjual: "",
      jenisTransaksi: "FULL_PAYMENT"
    });

  const [fakturData, setFakturData] = useState<FakturData>({
    tanggalFaktur: "",
    jenisFaktur: "Normal",
    kodeTransaksi: "",
    keteranganTambahan: "",
    dokumenPendukung: "",
    referensi: "",
    capFasilitas: "",
    idTkuPenjual: "",
    npwpPembeli: "",
    jenisIdPembeli: "TIN",
    negaraPembeli: "IDN",
    nomorDokumenPembeli: "",
    namaPembeli: "",
    alamatPembeli: "",
    emailPembeli: "",
    idTkuPembeli: "",
    keterangan: "",
    ctrl: "",
    referensiInvoiceDP: ""
  });

  const [detailItems, setDetailItems] = useState<DetailItem[]>([DEFAULT_DETAIL_ITEM]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleNext = () => {
    const currentIndex = TAB_LIST.indexOf(activeTab);
    if (currentIndex < TAB_LIST.length - 1) {
      setActiveTab(TAB_LIST[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = TAB_LIST.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TAB_LIST[currentIndex - 1]);
    }
  };

  // Handlers untuk data
  const handleHeaderChange = (field: keyof HeaderData, value: string) => {
    setHeaderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFakturChange = (field: keyof FakturData, value: string) => {
    setFakturData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTaxes = (
    hargaSatuan: number,
    jumlahBarang: number,
    potonganHarga: number,
    uangMuka: number = 0,
    dikurangiUangMuka: number = 0
  ) => {
    // Hitung harga jual total
    const hargaJualTotal = hargaSatuan * jumlahBarang;

    // Tentukan DPP berdasarkan jenis transaksi
    let dpp = 0;
    if (headerData.jenisTransaksi === 'DOWN_PAYMENT') {
      dpp = uangMuka;
    } else if (headerData.jenisTransaksi === 'REMAINING_PAYMENT') {
      dpp = hargaJualTotal - dikurangiUangMuka;
    } else {
      dpp = hargaJualTotal;
    }
    dpp = dpp - potonganHarga;

    // Hitung DPP Nilai Lain (DPP * 11/12)
    const dppNilaiLain = (dpp * 11) / 12;

    // Hitung PPN (DPP Nilai Lain * 12%)
    const ppn = dppNilaiLain * 0.12;

    // Hitung PPnBM (DPP * 10%)
    const ppnbm = dpp * 0.1;

    return {
      hargaJualTotal: hargaJualTotal.toFixed(2),
      dpp: dpp.toFixed(2),
      dppNilaiLain: dppNilaiLain.toFixed(2),
      ppn: ppn.toFixed(2),
      ppnbm: ppnbm.toFixed(2)
    };
  };

  const handleDetailChange = (index: number, field: keyof DetailItem, value: string) => {
    setDetailItems(prev => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };

      // Kalkulasi ulang jika field yang mempengaruhi perhitungan berubah
      if (['hargaSatuan', 'jumlahBarang', 'potonganHarga', 'uangMuka', 'dikurangiUangMuka'].includes(field)) {
        const hargaSatuan = Number(newItems[index].hargaSatuan) || 0;
        const jumlahBarang = Number(newItems[index].jumlahBarang) || 0;
        const potonganHarga = Number(newItems[index].potonganHarga) || 0;
        const uangMuka = Number(newItems[index].uangMuka) || 0;
        const dikurangiUangMuka = Number(newItems[index].dikurangiUangMuka) || 0;

        const { hargaJualTotal, dpp, dppNilaiLain, ppn, ppnbm } = calculateTaxes(
          hargaSatuan,
          jumlahBarang,
          potonganHarga,
          uangMuka,
          dikurangiUangMuka
        );

        newItems[index] = {
          ...newItems[index],
          hargaJualTotal,
          dpp,
          dppNilaiLain,
          ppn,
          ppnbm
        };
      }

      return newItems;
    });
  };

  const handleAddItem = () => {
    setDetailItems(prev => [...prev, { ...DEFAULT_DETAIL_ITEM }]);
  };

  const handleRemoveItem = (index: number) => {
    if (detailItems.length > 1) {
      setDetailItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  
  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headerData,
          fakturData,
          detailItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const data = await response.json();
      // Redirect ke list
      window.location.href = '/';

    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Input Faktur Pajak</CardTitle>
        <CardDescription>
          Form input data faktur pajak untuk CoreTax dan rekap internal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabType)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="header">Data Faktur</TabsTrigger>
            <TabsTrigger value="detail">Detail Barang/Jasa</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <HeaderForm 
              headerData={headerData}
              fakturData={fakturData}
              onHeaderChange={handleHeaderChange}
              onFakturChange={handleFakturChange}
            />
          </TabsContent>

          <TabsContent value="detail">
            <DetailForm 
              items={detailItems}
              transactionType={headerData.jenisTransaksi}
              
              onItemChange={handleDetailChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={activeTab === "header"}
          className="w-[100px]"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {activeTab === "detail" ? (
          <Button onClick={handleSubmit} variant="default">
            Save
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-[100px]"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}