import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Paperclip, FileUp, X, FileText, FileImage } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  fakturId: string;
  onUploadComplete: () => void;
}

export default function FileUpload({ fakturId, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const errorMessages: string[] = [];
    const validFiles: File[] = [];
    
    // Validate each file
    newFiles.forEach(file => {
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        errorMessages.push(`File "${file.name}" tidak valid. Hanya file PDF, JPG, dan PNG yang diizinkan.`);
        return;
      }
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        errorMessages.push(`File "${file.name}" terlalu besar. Ukuran maksimal adalah 10MB.`);
        return;
      }
      
      validFiles.push(file);
    });
    
    setErrors(errorMessages);
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.info('Pilih file terlebih dahulu');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload all files
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', ''); // Optional description
        
        try {
          const response = await fetch(`/api/faktur/${fakturId}/attachments`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Gagal mengupload ${file.name}`);
          }
          
          successCount++;
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err);
          errorCount++;
        }
      }
      
      // Show appropriate toast message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} file berhasil diupload`);
        setFiles([]);
        onUploadComplete();
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} file berhasil diupload, ${errorCount} file gagal`);
        onUploadComplete();
        // Remove successful uploads from the list
        // This is a simplification; in a real app, you'd track which files succeeded
        setFiles(files.slice(successCount));
      } else {
        toast.error('Semua file gagal diupload');
      }
      
    } catch (err: any) {
      console.error('Error during batch upload:', err);
      toast.error(`Error: ${err.message || 'Terjadi kesalahan saat mengupload file'}`);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload Lampiran</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="fileUploadInput"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            disabled={uploading}
          />
          <label
            htmlFor="fileUploadInput"
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50"
          >
            <Paperclip size={16} />
            <span>Pilih File</span>
          </label>
          
          <Button 
            onClick={uploadFiles} 
            disabled={uploading || files.length === 0}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Mengupload...</span>
              </>
            ) : (
              <>
                <FileUp size={16} />
                <span>Upload {files.length > 0 ? `(${files.length})` : ''}</span>
              </>
            )}
          </Button>
        </div>
        
        {/* File validation errors */}
        {errors.length > 0 && (
          <div className="mt-2 p-3 bg-red-50 rounded-md">
            <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
            <ul className="list-disc pl-5 text-sm text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* File list */}
        {files.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">File Terpilih:</h4>
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {files.map((file, index) => {
                const fileIcon = file.type.includes('pdf') ? 
                  <FileText size={16} className="text-red-500" /> : 
                  <FileImage size={16} className="text-blue-500" />;
                
                return (
                  <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      {fileIcon}
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-full text-red-500 hover:bg-red-50"
                      disabled={uploading}
                      title="Hapus file"
                    >
                      <X size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}