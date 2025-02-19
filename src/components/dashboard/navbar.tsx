// 'use client'

// import { useRouter } from 'next/navigation'
// import { useSession, signOut } from 'next-auth/react'
// import { useTheme } from 'next-themes'
// import { Button } from '@/components/ui/button'
// import { 
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from '@/components/ui/dropdown-menu'
// import { 
//   Building2, 
//   LogOut, 
//   User, 
//   Sun, 
//   Moon,
//   Settings,
//   ChevronDown
// } from 'lucide-react'
// import Link from 'next/link'
// import Image from 'next/image'

// export function Navbar() {
//   const router = useRouter()
//   const { data: session } = useSession()
//   const { theme, setTheme } = useTheme()
  
//   const selectedCompany = typeof window !== 'undefined' 
//     ? JSON.parse(localStorage.getItem('selectedCompany') || '{}')
//     : {}

//   const handleSignOut = async () => {
//     await signOut({ redirect: false })
//     localStorage.removeItem('selectedCompany')
//     router.push('/login')
//   }

//   const handleCompanySwitch = () => {
//     router.push('/user/company-selection')
//   }

//   return (
//     <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:border-border">
//       <div className="flex h-16 items-center justify-between px-4 md:px-6">
//         {/* Left section: Logo */}
//         <div className="flex items-center gap-4">
//           <Link href="/user/company-selection" className="flex items-center">
//             <Image
//               src="/images/logo/full_width_logo_maa.png"
//               alt="MAA Logo"
//               width={260}
//               height={160}
//               className="h-8 w-auto dark:brightness-200 dark:contrast-200"
//               priority
//             />
//           </Link>
//         </div>

//         {/* Right section: Company info, theme toggle, user menu */}
//         <div className="flex items-center space-x-4">
//           {/* Company Selector */}
//           {selectedCompany.company_name && (
//             <div className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-foreground dark:bg-primary/20">
//               <Building2 className="h-4 w-4" />
//               <span className="hidden md:inline">{selectedCompany.company_name}</span>
//             </div>
//           )}

//           {/* Theme Toggle */}
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             className="rounded-full hover:bg-accent hover:text-accent-foreground"
//           >
//             <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
//             <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
//             <span className="sr-only">Toggle theme</span>
//           </Button>

//           {/* User Menu */}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button 
//                 variant="ghost" 
//                 className="flex items-center gap-2 px-2 hover:bg-accent hover:text-accent-foreground"
//               >
//                 <User className="h-4 w-4" />
//                 <span className="hidden sm:inline">{session?.user?.username}</span>
//                 <ChevronDown className="h-4 w-4 opacity-50" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent 
//               align="end" 
//               className="w-56 bg-popover text-popover-foreground"
//             >
//               <DropdownMenuItem 
//                 onClick={handleCompanySwitch} 
//                 className="flex items-center hover:bg-accent hover:text-accent-foreground"
//               >
//                 <Building2 className="mr-2 h-4 w-4" />
//                 <span>Switch Company</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem 
//                 className="flex items-center hover:bg-accent hover:text-accent-foreground"
//               >
//                 <Settings className="mr-2 h-4 w-4" />
//                 <span>Settings</span>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem 
//                 onClick={handleSignOut} 
//                 className="flex items-center text-destructive hover:bg-destructive/10 hover:text-destructive"
//               >
//                 <LogOut className="mr-2 h-4 w-4" />
//                 <span>Logout</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </nav>
//   )
// }

'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
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
 Settings,
 ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
 const router = useRouter()
 const { data: session } = useSession()
 const { theme, setTheme } = useTheme()
 
 const [mounted, setMounted] = useState(false)
 const [selectedCompany, setSelectedCompany] = useState<any>(null)

 useEffect(() => {
   setMounted(true)
   const storedCompany = localStorage.getItem('selectedCompany')
   if (storedCompany) {
     setSelectedCompany(JSON.parse(storedCompany))
   }
 }, [])

 // Render loading state on server or during hydration
 if (!mounted) {
   return (
     <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
       <div className="flex h-16 items-center justify-between px-4 md:px-6">
         <div className="flex items-center gap-4">
           <div className="h-8 w-[260px] bg-gray-200 animate-pulse" />
         </div>
         <div className="flex items-center space-x-4">
           <div className="hidden md:block h-8 w-32 bg-gray-200 animate-pulse rounded-full" />
         </div>
       </div>
     </nav>
   )
 }

 const handleSignOut = async () => {
   await signOut({ redirect: false })
   localStorage.removeItem('selectedCompany')
   router.push('/login')
 }

 const handleCompanySwitch = () => {
   router.push('/user/company-selection')
 }

 return (
   <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:border-border">
     <div className="flex h-16 items-center justify-between px-4 md:px-6">
       {/* Left section: Logo */}
       <div className="flex items-center gap-4">
         <Link href="/user/company-selection" className="flex items-center">
           <Image
             src="/images/logo/full_width_logo_maa.png"
             alt="MAA Logo"
             width={260}
             height={160}
             className="h-8 w-auto dark:brightness-200 dark:contrast-200"
             priority
           />
         </Link>
       </div>

       {/* Right section: Company info, theme toggle, user menu */}
       <div className="flex items-center space-x-4">
         {/* Company Selector */}
         {selectedCompany?.company_name && (
           <button
             onClick={handleCompanySwitch}
             className="hidden md:flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-foreground dark:bg-primary/20"
           >
             <Building2 className="h-4 w-4" />
             <span className="hidden md:inline">{selectedCompany.company_name}</span>
           </button>
         )}

         {/* Theme Toggle */}
         {mounted && (
           <Button
             variant="ghost"
             size="icon"
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="rounded-full hover:bg-accent hover:text-accent-foreground"
           >
             <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
             <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
             <span className="sr-only">Toggle theme</span>
           </Button>
         )}

         {/* User Menu */}
         {mounted && (
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button 
                 variant="ghost" 
                 className="flex items-center gap-2 px-2 hover:bg-accent hover:text-accent-foreground"
               >
                 <User className="h-4 w-4" />
                 <span className="hidden sm:inline">{session?.user?.username}</span>
                 <ChevronDown className="h-4 w-4 opacity-50" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent 
               align="end" 
               className="w-56 bg-popover text-popover-foreground"
             >
               <DropdownMenuItem 
                 onClick={handleCompanySwitch} 
                 className="flex items-center hover:bg-accent hover:text-accent-foreground"
               >
                 <Building2 className="mr-2 h-4 w-4" />
                 <span>Switch Company</span>
               </DropdownMenuItem>
               <DropdownMenuItem 
                 className="flex items-center hover:bg-accent hover:text-accent-foreground"
               >
                 <Settings className="mr-2 h-4 w-4" />
                 <span>Settings</span>
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem 
                 onClick={handleSignOut} 
                 className="flex items-center text-destructive hover:bg-destructive/10 hover:text-destructive"
               >
                 <LogOut className="mr-2 h-4 w-4" />
                 <span>Logout</span>
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         )}
       </div>
     </div>
   </nav>
 )
}