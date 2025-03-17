// src/components/Loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Memuat data...</p>
      </div>
    </div>
  );
}