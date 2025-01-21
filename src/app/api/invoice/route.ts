import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Decimal } from '@prisma/client/runtime/library';
import type { HeaderData, FakturData, DetailItem } from '@/types/tax-invoice';

// GET handler untuk mengambil daftar invoice dengan filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause based on date filter
    const where: any = {};
    if (startDate || endDate) {
      where.invoice_date = {};
      if (startDate) where.invoice_date.gte = new Date(startDate);
      if (endDate) where.invoice_date.lte = new Date(endDate);
    }

    const invoice = await prisma.t_L_EFW_TAX_INVOICE_HEADER.findMany({
      where,
      include: {
        T_L_EFW_TAX_MASTER_CUSTOMER: {
          select: {
            nama: true,
            npwp: true
          }
        },
        T_L_EFW_TAX_INVOICE_DETAIL: {
          select: {
            dpp: true,
            ppn: true
          }
        },
        T_L_EFW_TAX_INVOICE_STATUS: {
          select: {
            status: true
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        invoice_date: 'desc'
      }
    });

    // Transform data for frontend
    const transformedinvoice = invoice.map(invoice => ({
      id: invoice.id,
      invoice_date: invoice.invoice_date.toISOString(),
      customer: {
        nama: invoice.T_L_EFW_TAX_MASTER_CUSTOMER.nama,
        npwp: invoice.T_L_EFW_TAX_MASTER_CUSTOMER.npwp
      },
      invoice_type: invoice.invoice_type,
      details: invoice.T_L_EFW_TAX_INVOICE_DETAIL.map(detail => ({
        dpp: detail.dpp.toString(),
        ppn: detail.ppn.toString()
      })),
      status: invoice.T_L_EFW_TAX_INVOICE_STATUS[0]?.status || 'DRAFT'
    }));

    return NextResponse.json({
      success: true,
      invoice: transformedinvoice
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoice'
    }, { status: 500 });
  }
}

// POST handler untuk membuat invoice baru (existing code)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { headerData, fakturData, detailItems } = body as {
      headerData: HeaderData;
      fakturData: FakturData;
      detailItems: DetailItem[];
    };

    // Get customer based on NPWP
    const customer = await prisma.t_L_EFW_TAX_MASTER_CUSTOMER.findFirst({
      where: {
        npwp: fakturData.npwpPembeli
      }
    });

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 });
    }

    // Get company (using first for now)
    const company = await prisma.t_L_EFW_TAX_MASTER_COMPANY.findFirst();
    if (!company) {
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 });
    }

    try {
      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create header
        const invoice = await tx.t_L_EFW_TAX_INVOICE_HEADER.create({
          data: {
            company_id: company.id,
            customer_id: customer.id,
            transaction_type: headerData.jenisTransaksi,
            invoice_date: new Date(fakturData.tanggalFaktur),
            invoice_type: fakturData.jenisFaktur,
            transaction_code: fakturData.kodeTransaksi,
            additional_info: fakturData.keteranganTambahan || null,
            supporting_doc: fakturData.dokumenPendukung || null,
            reference: fakturData.referensi || null,
            facility_stamp: fakturData.capFasilitas || null,
            seller_idtku: fakturData.idTkuPenjual || null,
            buyer_doc_type: fakturData.jenisIdPembeli,
            buyer_country: fakturData.negaraPembeli,
            buyer_doc_number: fakturData.nomorDokumenPembeli || null,
            buyer_email: fakturData.emailPembeli || null,
            buyer_idtku: fakturData.idTkuPembeli || null,
            notes: fakturData.keterangan || null,
            ctrl: fakturData.ctrl || null,
            reference_dp_invoice: fakturData.referensiInvoiceDP || null,
            created_by: 'SYSTEM'
          }
        });

        // Create status
        await tx.t_L_EFW_TAX_INVOICE_STATUS.create({
          data: {
            invoice_id: invoice.id,
            status: 'DRAFT',
            created_by: 'SYSTEM'
          }
        });

        // Create details
        for (const item of detailItems) {
          await tx.t_L_EFW_TAX_INVOICE_DETAIL.create({
            data: {
              invoice_id: invoice.id,
              item_type: item.barangJasa === 'A' ? 'GOODS' : 'SERVICE',
              goods_id: item.barangJasa === 'A' ? item.goods_id : null,
              service_id: item.barangJasa === 'B' ? item.service_id : null,
              item_name: item.namaBarang,
              unit: item.satuanUkur,
              unit_price: new Decimal(item.hargaSatuan || '0'),
              quantity: new Decimal(item.jumlahBarang || '0'),
              total_price: new Decimal(item.hargaJualTotal || '0'),
              discount: new Decimal(item.potonganHarga || '0'),
              down_payment: new Decimal(item.uangMuka || '0'),
              dpp: new Decimal(item.dpp || '0'),
              dpp_other: new Decimal(item.dppNilaiLain || '0'),
              ppn_rate: new Decimal(item.tarifPpn || '0'),
              ppn: new Decimal(item.ppn || '0'),
              ppnbm_rate: new Decimal(item.tarifPpnbm || '0'),
              ppnbm: new Decimal(item.ppnbm || '0'),
              created_by: 'SYSTEM'
            }
          });
        }

        return invoice;
      });

      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (txError) {
      console.error('Transaction error:', txError);
      return NextResponse.json({
        success: false,
        error: 'Transaction failed',
        details: txError instanceof Error ? txError.message : String(txError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}