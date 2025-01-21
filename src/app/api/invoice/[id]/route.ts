// src/app/api/invoice/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateXML } from '@/lib/utils/xml-generator';
// import { generateExcel } from '@/lib/utils/excel-generator';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.t_L_EFW_TAX_INVOICE_HEADER.findUnique({
      where: {
        id: params.id
      },
      include: {
        T_L_EFW_TAX_MASTER_CUSTOMER: true,
        T_L_EFW_TAX_INVOICE_DETAIL: {
          include: {
            T_L_EFW_TAX_MASTER_BARANG: true,
            T_L_EFW_TAX_MASTER_JASA: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }

    // Transform data for XML generation
    const data = {
      headerData: {
        npwpPenjual: invoice.T_L_EFW_TAX_MASTER_CUSTOMER.npwp,
        jenisTransaksi: invoice.transaction_type
      },
      fakturData: {
        tanggalFaktur: invoice.invoice_date.toISOString().split('T')[0],
        jenisFaktur: invoice.invoice_type,
        kodeTransaksi: invoice.transaction_code,
        keteranganTambahan: invoice.additional_info || '',
        dokumenPendukung: invoice.supporting_doc || '',
        referensi: invoice.reference || '',
        capFasilitas: invoice.facility_stamp || '',
        idTkuPenjual: invoice.seller_idtku || '',
        npwpPembeli: invoice.T_L_EFW_TAX_MASTER_CUSTOMER.npwp,
        jenisIdPembeli: invoice.buyer_doc_type,
        negaraPembeli: invoice.buyer_country,
        nomorDokumenPembeli: invoice.buyer_doc_number || '',
        namaPembeli: invoice.T_L_EFW_TAX_MASTER_CUSTOMER.nama,
        alamatPembeli: invoice.T_L_EFW_TAX_MASTER_CUSTOMER.jalan || '',
        emailPembeli: invoice.buyer_email || '',
        idTkuPembeli: invoice.buyer_idtku || '',
        keterangan: invoice.notes || '',
        ctrl: invoice.ctrl || '',
        referensiInvoiceDP: invoice.reference_dp_invoice || ''
      },
      detailItems: invoice.T_L_EFW_TAX_INVOICE_DETAIL.map(detail => ({
        barangJasa: detail.item_type === 'GOODS' ? 'A' : 'B',
        kodeBarang: '000000',
        namaBarang: detail.item_name,
        satuanUkur: detail.unit,
        hargaSatuan: detail.unit_price.toString(),
        jumlahBarang: detail.quantity.toString(),
        hargaJualTotal: detail.total_price.toString(),
        potonganHarga: detail.discount.toString(),
        uangMuka: detail.down_payment.toString(),
        dpp: detail.dpp.toString(),
        dppNilaiLain: detail.dpp_other.toString(),
        tarifPpn: detail.ppn_rate.toString(),
        ppn: detail.ppn.toString(),
        tarifPpnbm: detail.ppnbm_rate.toString(),
        ppnbm: detail.ppnbm.toString(),
        goods_id: detail.goods_id || '',
        service_id: detail.service_id || ''
      }))
    };

    if (request.headers.get('Accept') === 'application/xml') {
      // Return XML
      const xmlContent = generateXML(data);
      return new NextResponse(xmlContent, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename=faktur_${params.id}.xml`
        }
      });
    } else if (request.headers.get('Accept') === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Return Excel
      // const excelBuffer = await generateExcel(data);
      // return new NextResponse(excelBuffer, {
      //   headers: {
      //     'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      //     'Content-Disposition': `attachment; filename=rekap_${params.id}.xlsx`
      //   }
      // });
    }

    // Return JSON by default
    return NextResponse.json({
      success: true,
      invoice: data
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoice'
    }, { status: 500 });
  }
}