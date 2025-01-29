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
      {/* <div className="mb-8">
        <h1 className="text-2xl font-bold">Select Company</h1>
        <p className="text-gray-500">Choose a company to manage its tax information</p>
      </div> */}
      <CompanySelector />
    </div>
  )
}