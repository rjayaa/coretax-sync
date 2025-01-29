// app/(dashboard)/company-selection/page.tsx
import { Metadata } from 'next'
import { CompanySelector } from '@/components/dashboard/company-selector'

export const metadata: Metadata = {
  title: 'Select Company - Tax Management System',
  description: 'Select a company to manage',
}

export default function CompanySelectionPage() {
  return (
    <div className="container py-10">
    
      <CompanySelector />
    </div>
  )
}