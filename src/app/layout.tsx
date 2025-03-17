// // src/app/layout.tsx
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import Sidebar from '@/components/Sidebar';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'Sistem Faktur & Coretax',
//   description: 'Manajemen faktur pajak dan integrasi dengan Coretax',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="id">
//       <body className={`${inter.className} bg-gray-100`}>
//         <div className="flex min-h-screen">
//           <Sidebar />
//           <main className="flex-1">{children}</main>
//         </div>
//       </body>
//     </html>
//   );
// }

// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
// import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/QueryProvider';
import { SessionProvider } from '@/components/SessionProvider';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistem Faktur & Coretax',
  description: 'Manajemen faktur pajak dan integrasi dengan Coretax',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100`}>
     <SessionProvider>
            <QueryProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1">{children}</main>
              </div>
              {/* <Toaster /> */}
            </QueryProvider>
          </SessionProvider>
        
      </body>
    </html>
  );
}