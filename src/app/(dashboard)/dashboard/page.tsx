// app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useCompany } from '@/hooks/use-company'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedCompany } = useCompany()

  useEffect(() => {
    // Redirect to company selection if no company is selected
    if (!selectedCompany) {
      router.push('/company-selection')
    }
  }, [selectedCompany, router])

  if (!selectedCompany) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Managing {selectedCompany.company_name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Company Code</dt>
                <dd>{selectedCompany.company_code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>{selectedCompany.is_active ? 'Active' : 'Inactive'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Add more cards/sections as needed */}
      </div>
    </div>
  )
}