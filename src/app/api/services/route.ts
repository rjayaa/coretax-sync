import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await prisma.t_L_EFW_TAX_MASTER_JASA.findMany({
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
    const formattedServices = services.map(item => ({
      id: item.id,
      name: `${item.bahasa || ''} / ${item.english || ''}`
    }));

    return NextResponse.json({
      success: true,
      services: formattedServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}