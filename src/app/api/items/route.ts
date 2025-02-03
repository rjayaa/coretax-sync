// src/app/api/items/route.ts
import { NextResponse } from 'next/server'
import { taxDb } from '@/lib/db'
import { taxMasterBarang, taxMasterJasa } from '@/lib/db/schema/tax'
import { eq, or, like } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    let items = []
    
    if (type === 'goods') {
      items = await taxDb.select()
        .from(taxMasterBarang)
        .where(
          search 
            ? or(
                like(taxMasterBarang.bahasa, `%${search}%`),
                like(taxMasterBarang.english, `%${search}%`)
              )
            : undefined
        )
    } else if (type === 'services') {
      items = await taxDb.select()
        .from(taxMasterJasa)
        .where(
          search 
            ? or(
                like(taxMasterJasa.bahasa, `%${search}%`),
                like(taxMasterJasa.english, `%${search}%`)
              )
            : undefined
        )
    }

    // Langsung return semua items tanpa cek duplikasi
    return NextResponse.json({
      success: true,
      data: items
    })

  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}