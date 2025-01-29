// components/dashboard/navbar.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, LogOut, User } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const selectedCompany = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('selectedCompany') || '{}')
    : {}

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    localStorage.removeItem('selectedCompany')
    router.push('/login')
  }

  const handleCompanySwitch = () => {
    router.push('/company-selection')
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold">Tax Management System</h2>
          {selectedCompany.company_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{selectedCompany.company_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span>{session?.user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCompanySwitch}>
                <Building2 className="mr-2 h-4 w-4" />
                Switch Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}