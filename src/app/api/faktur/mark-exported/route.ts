// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect ke dashboard saat mengakses halaman root
  redirect('/dashboard');
}