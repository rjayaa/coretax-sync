'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FakturForm from '@/components/FakturForm';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/ErrorDisplay';
import { FakturData } from '@/types/faktur';
import FileAttachmentList from '@/components/FileAttachmentList';

interface EditFakturPageProps {
  params: { id: string };
}

export default function EditFakturPage({ params }: EditFakturPageProps) {
  const router = useRouter();
  const [faktur, setFaktur] = useState<FakturData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentRefresh, setAttachmentRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/faktur/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch faktur data');
        }
        
        const data = await response.json();
        setFaktur(data);
      } catch (err: any) {
        console.error('Error fetching faktur:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data faktur');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  const handleSubmit = async (fakturData: FakturData, files?: File[]) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Step 1: Update the faktur data
      const updateResponse = await fetch(`/api/faktur/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fakturData),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update faktur');
      }
      
      // Step 2: If we have files, upload them
      if (files && files.length > 0) {
        // Upload each file one by one
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('description', ''); // Optional description
          
          const fileResponse = await fetch(`/api/faktur/${params.id}/attachments`, {
            method: 'POST',
            body: formData,
          });
          
          if (!fileResponse.ok) {
            console.error('Failed to upload file:', file.name);
            // We continue even if one file fails
          }
        }
        
        // Refresh the attachment list
        setAttachmentRefresh(!attachmentRefresh);
      }
      
      // Step 3: Redirect to the faktur detail page
      router.push(`/faktur/${params.id}`);
      
    } catch (err: any) {
      console.error('Error updating faktur:', err);
      setError(err.message || 'Terjadi kesalahan saat memperbarui faktur');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error && !faktur) {
    return (
      <ErrorDisplay
        message={error}
        onRetry={() => router.push(`/faktur/${params.id}`)}
      />
    );
  }

  if (!faktur) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Faktur Tidak Ditemukan</h2>
          <p className="text-yellow-600">Data faktur dengan ID {params.id} tidak ditemukan.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Faktur</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Kembali
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <FakturForm 
          initialData={faktur} 
          isEdit={true} 
          onSubmit={handleSubmit} 
        />
        
        {/* Existing Attachments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Dokumen Lampiran Saat Ini</h2>
          <FileAttachmentList 
            fakturId={params.id} 
            refresh={attachmentRefresh}
            readOnly={faktur.status_faktur === 'APPROVED'}
          />
        </div>
      </div>
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-center">Menyimpan faktur dan mengupload lampiran...</p>
          </div>
        </div>
      )}
    </div>
  );
}