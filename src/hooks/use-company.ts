// hooks/use-company.ts
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Company = {
  company_code: string
  company_name: string
  is_active: boolean
}

export function useCompany() {
  const { data: session } = useSession()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  useEffect(() => {
    // Load selected company from localStorage on mount
    const stored = localStorage.getItem('selectedCompany')
    if (stored) {
      setSelectedCompany(JSON.parse(stored))
    }
  }, [])

  const selectCompany = (company: Company) => {
    localStorage.setItem('selectedCompany', JSON.stringify(company))
    setSelectedCompany(company)
  }

  const clearSelectedCompany = () => {
    localStorage.removeItem('selectedCompany')
    setSelectedCompany(null)
  }

  return {
    selectedCompany,
    selectCompany,
    clearSelectedCompany,
    companies: session?.user?.companies || []
  }
}