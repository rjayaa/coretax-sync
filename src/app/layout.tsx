// import { QueryProvider } from '@/components/providers/query-provider'
// import { SessionProvider } from '@/components/providers/session-provider'
// import { ThemeProvider } from '@/components/providers/theme-provider'
// import './globals.css'

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <SessionProvider>
//             <QueryProvider>
//               {children}
//             </QueryProvider>
//           </SessionProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }


// src/app/layout.tsx
import { Toaster } from '@/components/ui/toaster'
import { QueryProvider } from '@/components/providers/query-provider'
import { SessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}