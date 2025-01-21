import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const goods = await prisma.t_L_EFW_TAX_MASTER_BARANG.findMany({
      select: {
        id: true,
        english: true,
        bahasa: true
      },
      orderBy: {
        bahasa: 'asc'
      }
    });

    // Transform data to include both languages
    const formattedGoods = goods.map(item => ({
      id: item.id,
      name: `${item.bahasa || ''} / ${item.english || ''}`
    }));

    return NextResponse.json({
      success: true,
      goods: formattedGoods
    });
  } catch (error) {
    console.error('Error fetching goods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goods' },
      { status: 500 }
    );
  }
}