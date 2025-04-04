// app/(auth)/login/page.tsx
import Image from "next/image";
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: 'Coretax Sync MAA',
  description: 'Manajemen faktur pajak dan integrasi dengan Coretax MAA',
};

export default function LoginPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/images/background/bg-login-maa.jpg"
        alt="Background"
        fill
        priority
        className="object-cover"
      />
      
      {/* Overlay with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[6px]" />
      
      {/* Content Container - Centered both horizontally and vertically */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-md px-4 relative z-10">
          <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-2xl p-6 w-full">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo/full_width_logo_maa.png"
                alt="MAA Logo"
                width={260}
                height={160}
                priority
                className="relative"  
              />
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Coretax Sync</h1>
              <div className="flex items-center justify-center gap-2 text-gray-200">
                Tax Integration to CoreTax
                <Image 
                  src="/images/logo/logo-djp.png" 
                  alt="DJP Logo" 
                  width={98} 
                  height={98}
                />
              </div>
            </div>
            
            {/* Login Form with Suspense boundary */}
            <Suspense fallback={<div className="text-white text-center py-4">Loading form...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 text-sm text-gray-300">
            &copy; {currentYear} Coretax Sync{' '}
            <span className="text-red-500">❤</span> by Mineral Alam Abadi
          </div>
        </div>
      </div>
    </div>
  );
}