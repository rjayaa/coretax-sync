"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, FileText, Table } from "lucide-react";
import * as XLSX from 'xlsx';

const TAB_LIST = ["header", "detail", "preview-xml", "preview-excel"] as const;
type TabType = typeof TAB_LIST[number];

const TaxInvoiceForm = () => {
  const [activeTab, setActiveTab] = useState<TabType>("header");
  
  // State untuk data faktur induk
  const [headerData, setHeaderData] = useState({
    npwpPenjual: "",
  });

  // State untuk data faktur
  const [fakturData, setFakturData] = useState({
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
    keterangan: "", // Tambahan untuk rekap internal
    ctrl: "", // Tambahan untuk rekap internal
  });

  // State untuk detail barang/jasa
  const [detailItems, setDetailItems] = useState([{
    barangJasa: "A",
    kodeBarang: "000000",
    namaBarang: "",
    satuanUkur: "UM.0002",
    hargaSatuan: "",
    jumlahBarang: "",
    totalDiskon: "0",
    dpp: "",
    dppNilaiLain: "",
    tarifPpn: "12",
    ppn: "",
    tarifPpnbm: "10",
    ppnbm: "",
    hargaJualTotal: "", // Tambahan untuk rekap internal
    uangMuka: "0", // Tambahan untuk rekap internal
    ppnUangMuka: "0", // Tambahan untuk rekap internal
  }]);

  const [xmlOutput, setXmlOutput] = useState("");
  const [error, setError] = useState("");

  // Handler untuk tabs
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

  // Generate XML output
  const generateXML = () => {
    try {
      const xmlTemplate = `<?xml version="1.0" encoding="utf-8"?>
<TaxInvoiceBulk xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <TIN>${headerData.npwpPenjual}</TIN>
  <ListOfTaxInvoice>
    <TaxInvoice>
      <TaxInvoiceDate>${fakturData.tanggalFaktur}</TaxInvoiceDate>
      <TaxInvoiceOpt>${fakturData.jenisFaktur}</TaxInvoiceOpt>
      <TrxCode>${fakturData.kodeTransaksi}</TrxCode>
      <AddInfo>${fakturData.keteranganTambahan}</AddInfo>
      <CustomDoc>${fakturData.dokumenPendukung}</CustomDoc>
      <RefDesc>${fakturData.referensi}</RefDesc>
      <FacilityStamp>${fakturData.capFasilitas}</FacilityStamp>
      <SellerIDTKU>${fakturData.idTkuPenjual}</SellerIDTKU>
      <BuyerTin>${fakturData.npwpPembeli}</BuyerTin>
      <BuyerDocument>${fakturData.jenisIdPembeli}</BuyerDocument>
      <BuyerCountry>${fakturData.negaraPembeli}</BuyerCountry>
      <BuyerDocumentNumber>${fakturData.nomorDokumenPembeli}</BuyerDocumentNumber>
      <BuyerName>${fakturData.namaPembeli}</BuyerName>
      <BuyerAdress>${fakturData.alamatPembeli}</BuyerAdress>
      <BuyerEmail>${fakturData.emailPembeli}</BuyerEmail>
      <BuyerIDTKU>${fakturData.idTkuPembeli}</BuyerIDTKU>
      <ListOfGoodService>
        ${detailItems.map(item => `
        <GoodService>
          <Opt>${item.barangJasa}</Opt>
          <Code>${item.kodeBarang}</Code>
          <Name>${item.namaBarang}</Name>
          <Unit>${item.satuanUkur}</Unit>
          <Price>${Number(item.hargaSatuan).toFixed(2)}</Price>
          <Qty>${item.jumlahBarang}</Qty>
          <TotalDiscount>${Number(item.totalDiskon).toFixed(2)}</TotalDiscount>
          <TaxBase>${Number(item.dpp).toFixed(2)}</TaxBase>
          <OtherTaxBase>${Number(item.dppNilaiLain).toFixed(2)}</OtherTaxBase>
          <VATRate>${item.tarifPpn}</VATRate>
          <VAT>${Number(item.ppn).toFixed(2)}</VAT>
          <STLGRate>${item.tarifPpnbm}</STLGRate>
          <STLG>${Number(item.ppnbm).toFixed(2)}</STLG>
        </GoodService>`).join('')}
      </ListOfGoodService>
    </TaxInvoice>
  </ListOfTaxInvoice>
</TaxInvoiceBulk>`;

      setXmlOutput(xmlTemplate);
    } catch (err: any) {
      setError('Error generating XML: ' + err.message);
    }
  };

  // Generate Excel untuk rekap internal
  const generateExcel = () => {
    try {
      // Flatten data untuk format excel
      const rows = detailItems.map((item, index) => ({
        'Baris': index + 1,
        'Tanggal Faktur': fakturData.tanggalFaktur,
        'Jenis Faktur': fakturData.jenisFaktur,
        'Kode FP': fakturData.kodeTransaksi,
        'Keterangan Tambahan': fakturData.keteranganTambahan,
        'Dokumen Pendukung': fakturData.dokumenPendukung,
        'Referensi': fakturData.referensi,
        'Cap Fasilitas': fakturData.capFasilitas,
        'ID TKU Penjual': fakturData.idTkuPenjual,
        'NPWP/NIK Pembeli': fakturData.npwpPembeli,
        'Jenis ID Pembeli': fakturData.jenisIdPembeli,
        'Negara Pembeli': fakturData.negaraPembeli,
        'Nomor Dokumen Pembeli': fakturData.nomorDokumenPembeli,
        'Nama Pembeli': fakturData.namaPembeli,
        'Alamat Pembeli': fakturData.alamatPembeli,
        'Email Pembeli': fakturData.emailPembeli,
        'ID TKU Pembeli': fakturData.idTkuPembeli,
        'Barang/Jasa': item.barangJasa,
        'Kode Barang Jasa': item.kodeBarang,
        'Nama Barang/Jasa': item.namaBarang,
        'Nama Satuan Ukur': item.satuanUkur,
        'Harga Satuan': item.hargaSatuan,
        'Jumlah Barang/Jasa': item.jumlahBarang,
        'Total Diskon': item.totalDiskon,
        'Harga Jual Total': item.hargaJualTotal,
        'DPP': item.dpp,
        'DPP Nilai Lain': item.dppNilaiLain,
        'Tarif PPN': item.tarifPpn,
        'PPN': item.ppn,
        'Uang Muka': item.uangMuka,
        'PPN Uang Muka': item.ppnUangMuka,
        'Tarif PPnBM': item.tarifPpnbm,
        'PPnBM': item.ppnbm,
        'Ctrl': fakturData.ctrl,
        'Keterangan': fakturData.keterangan
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekapan FP 2025");
      
      XLSX.writeFile(wb, "rekap_faktur_pajak.xlsx");
    } catch (err: any) {
      setError('Error generating Excel: ' + err.message);
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="header">Data Faktur</TabsTrigger>
            <TabsTrigger value="detail">Detail Barang/Jasa</TabsTrigger>
            <TabsTrigger value="preview-xml">Preview XML</TabsTrigger>
            <TabsTrigger value="preview-excel">Preview Excel</TabsTrigger>
          </TabsList>

          <TabsContent value="header" className="space-y-4">
            {/* Form fields untuk header tetap sama */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>NPWP Penjual</Label>
                <Input 
                  value={headerData.npwpPenjual}
                  onChange={(e) => setHeaderData(prev => ({ ...prev, npwpPenjual: e.target.value }))}
                  placeholder="Masukkan NPWP Penjual"
                />
              </div>
              {/* ... other header fields ... */}
            </div>
          </TabsContent>

          <TabsContent value="detail" className="space-y-4">
            {/* Form fields untuk detail dengan tambahan field untuk rekap */}
            <Button onClick={addDetailItem} variant="outline">
              Tambah Item
            </Button>
            {detailItems.map((item, index) => (
              <Card key={index} className="p-4">
                {/* ... existing detail fields ... */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Harga Jual Total</Label>
                    <Input 
                      type="number"
                      value={item.hargaJualTotal}
                      onChange={(e) => handleDetailChange(index, 'hargaJualTotal', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Uang Muka</Label>
                    <Input 
                      type="number"
                      value={item.uangMuka}
                      onChange={(e) => handleDetailChange(index, 'uangMuka', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="preview-xml" className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={generateXML} className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Generate XML
              </Button>
              {xmlOutput && (
                <Button onClick={downloadXML} variant="outline" className="flex-1">
                  Download XML
                </Button>
              )}
            </div>

            {xmlOutput && (
              <div className="border rounded p-4 bg-gray-50 h-96 overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">{xmlOutput}</pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview-excel" className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={generateExcel} className="flex-1">
                <Table className="mr-2 h-4 w-4" />
                Download Excel Rekap
              </Button>
            </div>

            <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Preview Data Rekap</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Baris</th>
                      <th className="border p-2 text-left">Tanggal</th>
                      <th className="border p-2 text-left">Nama Pembeli</th>
                      <th className="border p-2 text-left">NPWP</th>
                      <th className="border p-2 text-right">DPP</th>
                      <th className="border p-2 text-right">PPN</th>
                      <th className="border p-2 text-right">PPnBM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">{fakturData.tanggalFaktur}</td>
                        <td className="border p-2">{fakturData.namaPembeli}</td>
                        <td className="border p-2">{fakturData.npwpPembeli}</td>
                        <td className="border p-2 text-right">
                          {Number(item.dpp).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border p-2 text-right">
                          {Number(item.ppn).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border p-2 text-right">
                          {Number(item.ppnbm).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td colSpan={4} className="border p-2 text-right">Total:</td>
                      <td className="border p-2 text-right">
                        {detailItems.reduce((sum, item) => sum + Number(item.dpp), 0)
                          .toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border p-2 text-right">
                        {detailItems.reduce((sum, item) => sum + Number(item.ppn), 0)
                          .toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="border p-2 text-right">
                        {detailItems.reduce((sum, item) => sum + Number(item.ppnbm), 0)
                          .toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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

        {activeTab === "preview-excel" ? (
          <Button onClick={generateExcel} variant="default">
            <Table className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
        ) : activeTab === "preview-xml" ? (
          <div className="flex gap-2">
            <Button onClick={generateXML} variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Generate XML
            </Button>
            {xmlOutput && (
              <Button onClick={downloadXML}>
                Download XML
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleNext}
            disabled={activeTab === "preview-excel"}
            className="w-[100px]"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaxInvoiceForm;