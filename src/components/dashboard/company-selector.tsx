// components/dashboard/company-selector.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export function CompanySelector() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Debug log untuk melihat session data
  useEffect(() => {
    console.log('Session:', session)
    console.log('User:', session?.user)
    console.log('Companies:', session?.user?.companies)
  }, [session])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

const handleCompanySelect = (companyData: any) => {
  localStorage.setItem('selectedCompany', JSON.stringify(companyData))
  router.push('/invoices') // Update ini dari '/dashboard' ke '/invoices'
}

  // Loading state
  if (status === 'loading') {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <p>Loading companies...</p>
      </div>
    )
  }

  // Get assigned companies from session
  const assignedCompanies = session?.user?.companies || []

  // Debug log untuk companies yang akan di-render
  // console.log('Companies to render:', assignedCompanies)

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Select Company</h1>
        <p className="text-gray-500">
          Select a company to manage ({assignedCompanies.length} companies assigned)
        </p>
        {/* Debug info */}
        <p className="text-xs text-gray-400">User IDNIK: {session?.user?.idnik}</p>
      </div>

      {assignedCompanies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No companies assigned to your account.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignedCompanies.map((company) => (
            <Card
              key={company.company_code}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleCompanySelect(company)}
            >
              <CardContent className="flex items-center p-6">
                <div className="p-2 bg-gray-100 rounded-lg mr-4">
                  <Building2 className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">{company.company_name}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Code: {company.company_code}</p>
                    {company.npwp_company && (
                      <p className="text-sm text-gray-500">NPWP: {company.npwp_company}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}