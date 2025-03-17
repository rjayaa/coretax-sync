// src/components/ErrorDisplay.tsx
type ErrorDisplayProps = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 p-6 rounded-lg shadow-md mx-auto max-w-lg">
      <div className="flex items-center mb-4">
        <div className="bg-red-100 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-700">Terjadi Kesalahan</h2>
      </div>
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}