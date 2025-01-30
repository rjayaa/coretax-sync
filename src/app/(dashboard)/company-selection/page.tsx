// src/app/(dashboard)/company-selection/page.tsx
import { Metadata } from 'next'
import { CompanySelector } from '@/components/dashboard/company-selector'

export const metadata: Metadata = {
  title: 'Select Company - Tax Management System',
  description: 'Select a company to manage',
}

export default function CompanySelectionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container py-10">
        <CompanySelector />
      </div>
    </main>
  )
}