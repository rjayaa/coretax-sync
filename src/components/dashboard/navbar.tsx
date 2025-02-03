'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  Building2, 
  LogOut, 
  User, 
  Sun, 
  Moon,
  LayoutDashboard,
  FileText,
  Settings,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  
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
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/company-selection" className="flex items-center space-x-2">
            <Image
              src="/images/logo/full_width_logo_maa.png"
              alt="MAA Logo"
               width={260}
              height={160}
              className="rounded"
            />
            {/* <span className="hidden font-bold sm:inline-block">
              Tax Management System
            </span> */}
          </Link>

         
         
        </div>

        <div className="flex items-center gap-4">
          {/* Company Selector */}
          {selectedCompany.company_name && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm">
              <Building2 className="h-4 w-4" />
              <span>{selectedCompany.company_name}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block">{session?.user?.username}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleCompanySwitch}>
                <Building2 className="mr-2 h-4 w-4" />
                Switch Company
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
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