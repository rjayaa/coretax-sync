// app/(auth)/login/page.tsx
import Image from "next/image";
import { Metadata } from 'next';
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: 'Import Tax - Login',
  description: 'Tax Integration to CoreTaxs',
}

export default function LoginPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center">
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
      
      {/* Content Container */}
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-2xl p-6">
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
            <h1 className="text-2xl font-semibold text-white mb-2">Import Tax Login</h1>
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
          
          {/* Login Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-gray-300">
          &copy; {currentYear} Import Tax Portal{' '}
          <span className="text-red-500">❤</span> by Mineral Alam Abadi
        </div>
      </div>
    </div>
  );
}