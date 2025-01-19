// // src/lib/utils/xml-generator.ts

// export interface TaxInvoiceData {
//     TIN: string;
//     invoice: {
//       date: string;
//       opt: string;
//       trxCode: string;
//       addInfo: string;
//       customDoc: string;
//       refDesc: string;
//       facilityStamp: string;
//       sellerIDTKU: string;
//       buyerTin: string;
//       buyerDocument: string;
//       buyerCountry: string;
//       buyerDocumentNumber: string;
//       buyerName: string;
//       buyerAddress: string;
//       buyerEmail: string;
//       buyerIDTKU: string;
//       goods: {
//         opt: string;
//         code: string;
//         name: string;
//         unit: string;
//         price: string;
//         qty: string;
//         totalDiscount: string;
//         taxBase: string;
//         otherTaxBase: string;
//         vatRate: string;
//         vat: string;
//         stlgRate: string;
//         stlg: string;
//       }[];
//     };
//   }
  
//   export const generateTaxInvoiceXML = (data: TaxInvoiceData): string => {
//     // Format nomor dengan 2 desimal
//     const formatNumber = (num: string | number): string => {
//       return Number(num).toFixed(2);
//     };
  
//     const xmlTemplate = `<?xml version="1.0" encoding="utf-8"?>
//   <TaxInvoiceBulk xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
//     <TIN>${data.TIN}</TIN>
//     <ListOfTaxInvoice>
//       <TaxInvoice>
//         <TaxInvoiceDate>${data.invoice.date}</TaxInvoiceDate>
//         <TaxInvoiceOpt>${data.invoice.opt}</TaxInvoiceOpt>
//         <TrxCode>${data.invoice.trxCode}</TrxCode>
//         <AddInfo>${data.invoice.addInfo}</AddInfo>
//         <CustomDoc>${data.invoice.customDoc}</CustomDoc>
//         <RefDesc>${data.invoice.refDesc}</RefDesc>
//         <FacilityStamp>${data.invoice.facilityStamp}</FacilityStamp>
//         <SellerIDTKU>${data.invoice.sellerIDTKU}</SellerIDTKU>
//         <BuyerTin>${data.invoice.buyerTin}</BuyerTin>
//         <BuyerDocument>${data.invoice.buyerDocument}</BuyerDocument>
//         <BuyerCountry>${data.invoice.buyerCountry}</BuyerCountry>
//         <BuyerDocumentNumber>${data.invoice.buyerDocumentNumber}</BuyerDocumentNumber>
//         <BuyerName>${data.invoice.buyerName}</BuyerName>
//         <BuyerAdress>${data.invoice.buyerAddress}</BuyerAdress>
//         <BuyerEmail>${data.invoice.buyerEmail}</BuyerEmail>
//         <BuyerIDTKU>${data.invoice.buyerIDTKU}</BuyerIDTKU>
//         <ListOfGoodService>
//           ${data.invoice.goods.map(good => `
//           <GoodService>
//             <Opt>${good.opt}</Opt>
//             <Code>${good.code}</Code>
//             <Name>${good.name}</Name>
//             <Unit>${good.unit}</Unit>
//             <Price>${formatNumber(good.price)}</Price>
//             <Qty>${good.qty}</Qty>
//             <TotalDiscount>${formatNumber(good.totalDiscount)}</TotalDiscount>
//             <TaxBase>${formatNumber(good.taxBase)}</TaxBase>
//             <OtherTaxBase>${formatNumber(good.otherTaxBase)}</OtherTaxBase>
//             <VATRate>${good.vatRate}</VATRate>
//             <VAT>${formatNumber(good.vat)}</VAT>
//             <STLGRate>${good.stlgRate}</STLGRate>
//             <STLG>${formatNumber(good.stlg)}</STLG>
//           </GoodService>`).join('')}
//         </ListOfGoodService>
//       </TaxInvoice>
//     </ListOfTaxInvoice>
//   </TaxInvoiceBulk>`;
  
//     return xmlTemplate;
//   };

// src/lib/utils/xml-generator.ts
import type { HeaderData, FakturData, DetailItem } from "@/types/tax-invoice";

interface GenerateXMLProps {
  headerData: HeaderData;
  fakturData: FakturData;
  detailItems: DetailItem[];
}

export const generateXML = ({ headerData, fakturData, detailItems }: GenerateXMLProps): string => {
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

    return xmlTemplate;
  } catch (err) {
    throw new Error('Error generating XML: ' + (err as Error).message);
  }
};