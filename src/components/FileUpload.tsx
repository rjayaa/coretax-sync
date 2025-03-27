import React, { useState } from 'react';
import { Button } from './ui/button';
import { Paperclip, FileUp, X } from 'lucide-react';

interface FileUploadProps {
  fakturId: string;
  onUploadComplete: () => void;
}

export default function FileUpload({ fakturId, onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setDescription('');
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Silakan pilih file untuk diupload');
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      const response = await fetch(`/api/faktur/${fakturId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengupload file');
      }
      
      resetForm();
      onUploadComplete();
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengupload file');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Upload Lampiran</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Files (PDF, JPG, PNG)
          </label>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor="file"
              className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              <Paperclip size={16} />
              <span>{file ? file.name : 'Pilih File'}</span>
            </label>
            
            {file && (
              <button
                type="button"
                onClick={resetForm}
                className="p-1 rounded-full text-red-500 hover:bg-red-50"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {file && (
            <p className="text-xs text-gray-500 mt-1">
              Ukuran: {(file.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi (Opsional)
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Deskripsi dokumen"
          />
        </div>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={uploading} className="flex items-center gap-2">
            {uploading ? 'Mengupload...' : (
              <>
                <FileUp size={16} />
                <span>Upload</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}