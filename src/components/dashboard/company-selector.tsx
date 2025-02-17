'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, ChevronRight, Building } from 'lucide-react'
import { cn } from '@/lib/utils'
import { taxMasterCompany } from '@/lib/db/schema/master'
import type { InferSelectModel } from 'drizzle-orm'

type Company = InferSelectModel<typeof taxMasterCompany>

export function CompanySelector() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative">
            <Building2 className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 mx-auto bg-primary/10 blur-xl rounded-full" />
          </div>
          <p className="text-muted-foreground text-sm">Loading companies...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleCompanySelect = (companyData: Company) => {
    try {
      // Validate required fields
      if (!companyData?.company_code || !companyData?.company_name) {
        console.error('Invalid company data:', companyData)
        return
      }

      // Store company data with proper type
      const companyToStore = {
        company_code: companyData.company_code,
        company_name: companyData.company_name,
        npwp_company: companyData.npwp_company || '',
        status: companyData.status
      }

      localStorage.setItem('selectedCompany', JSON.stringify(companyToStore))
      router.push('/user/faktur')
    } catch (error) {
      console.error('Error selecting company:', error)
    }
  }

  const assignedCompanies = session?.user?.companies || []

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background blur-3xl -z-10" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Company Selection
            </h1>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-lg">
              Select a company to manage invoices and tax documents
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground/80">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                <span>User ID:</span>
                <code className="font-mono text-xs text-primary">
                  {session?.user?.idnik}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{assignedCompanies.length} companies assigned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {assignedCompanies.length === 0 ? (
          <Card className="border-dashed bg-card/50 col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <Building2 className="h-16 w-16 text-muted-foreground/30" />
                <div className="absolute inset-0 h-16 w-16 bg-muted-foreground/5 blur-xl rounded-full" />
              </div>
              <div className="mt-6 text-center space-y-2">
                <p className="text-muted-foreground font-medium">
                  No Companies Assigned
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Please contact your administrator for access
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          assignedCompanies.map((company) => (
            <Card
              key={company.company_code}
              className={cn(
                "transition-all duration-300 cursor-pointer group overflow-hidden",
                "hover:shadow-lg hover:shadow-primary/5",
                "hover:border-primary/20 hover:bg-accent/30",
                "dark:hover:border-primary/30 dark:hover:bg-accent/50"
              )}
              onClick={() => handleCompanySelect(company)}
            >
              <CardContent className="p-6 relative">
                <div className="relative flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-colors duration-300",
                      "bg-primary/10 group-hover:bg-primary/20",
                      "dark:bg-primary/20 dark:group-hover:bg-primary/30"
                    )}>
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg leading-none">
                        {company.company_name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Code:</span>
                          <code className="px-2 py-0.5 rounded-md bg-muted font-mono text-xs">
                            {company.company_code}
                          </code>
                        </div>
                        {company.npwp_company && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">NPWP:</span>
                            <code className="px-2 py-0.5 rounded-md bg-muted font-mono text-xs">
                              {company.npwp_company}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "h-5 w-5 text-primary/40 transition-all duration-300",
                    "group-hover:translate-x-0.5 group-hover:text-primary"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}