// src/app/api/customers/[id]/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { taxMasterCustomer } from '@/lib/db/schema/tax'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await db.query.taxMasterCustomer.findFirst({
      where: eq(taxMasterCustomer.id, params.id)
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}