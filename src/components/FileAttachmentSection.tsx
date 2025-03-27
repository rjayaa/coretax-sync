import React, { useState, useEffect, useRef } from 'react';
import { 
  Paperclip, RefreshCw, Download, Trash2, 
  FileText, FileImage, Eye, X, FileUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  original_filename: string;
  filename: string;
  file_type: string;
  file_size: number;
  description: string;
  uploaded_at: string;
}

interface FileAttachmentSectionProps {
  fakturId: string;
  readOnly?: boolean;
  fakturData?: any;
}

export default function FileAttachmentSection({ 
  fakturId, 
  readOnly = false,
  fakturData
}: FileAttachmentSectionProps) {
  // Attachment list states
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  
  // Fetch attachments whenever fakturId or refreshTrigger changes
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!fakturId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/faktur/${fakturId}/attachments`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal mengambil data lampiran');
        }
        
        const data = await response.json();
        setAttachments(data);
        
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data lampiran');
        console.error('Error fetching attachments:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttachments();
  }, [fakturId, refreshTrigger]);

  // File handling functions
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
    
    setUploadErrors(errorMessages);
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeSelectedFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.info('Pilih file terlebih dahulu');
      return;
    }
    
    setIsUploading(true);
    
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
        setRefreshTrigger(prev => prev + 1);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} file berhasil diupload, ${errorCount} file gagal`);
        setRefreshTrigger(prev => prev + 1);
        // Remove successful uploads from the list
        setFiles(files.slice(successCount));
      } else {
        toast.error('Semua file gagal diupload');
      }
      
    } catch (err: any) {
      console.error('Error during batch upload:', err);
      toast.error(`Error: ${err.message || 'Terjadi kesalahan saat mengupload file'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Attachment action handlers
  const handleDelete = async (attachmentId: string) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus file ini?');
    
    if (!confirmDelete) return;
    
    try {
      setDeleting(attachmentId);
      
      const response = await fetch(`/api/faktur/${fakturId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus file');
      }
      
      // Remove the file from the list
      setAttachments(attachments.filter(item => item.id !== attachmentId));
      toast.success('File berhasil dihapus');
      
    } catch (err: any) {
      console.error('Error deleting file:', err);
      toast.error(`Error: ${err.message || 'Gagal menghapus file'}`);
    } finally {
      setDeleting(null);
    }
  };
  
  const handleDownload = async (attachmentId: string) => {
    try {
      setDownloading(attachmentId);
      
      const downloadUrl = `/api/faktur/${fakturId}/attachments/${attachmentId}`;
      
      // Use fetch to check if the file is available first
      const response = await fetch(downloadUrl, { method: 'HEAD' }).catch(() => ({ ok: false }));
      
      if (!response.ok) {
        throw new Error('File tidak tersedia');
      }
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = ''; // Browser will use the name from Content-Disposition
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Mengunduh file...');
      
    } catch (err: any) {
      console.error('Error downloading file:', err);
      toast.error(`Error: ${err.message || 'Gagal mengunduh file'}`);
    } finally {
      setDownloading(null);
    }
  };
  
  const handlePreview = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewZoom(1);
    setPreviewRotation(0);
  };
  
  // Helper functions
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImage size={20} className="text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Display the cleaned filename without the UUID suffix
  const displayCleanFilename = (filename: string) => {
    // Remove the _[uuid-part].extension from the filename
    return filename.replace(/_[a-f0-9]{8}(\.[^.]+)$/, '$1');
  };
  
  // Render attachment list
  const renderAttachmentList = () => {
    if (loading) {
      return (
        <div className="py-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mx-auto mb-2"></div>
          <p>Memuat data lampiran...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Error: {error}
        </div>
      );
    }
    
    if (attachments.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          Belum ada lampiran untuk faktur ini.
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">File</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Asli</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diupload</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attachments.map((attachment) => (
              <tr key={attachment.id}>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getFileIcon(attachment.file_type)}
                    <span className="truncate max-w-xs">
                      {displayCleanFilename(attachment.filename)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {attachment.original_filename}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {formatFileSize(attachment.file_size)}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {formatDate(attachment.uploaded_at)}
                </td>
                <td className="px-3 py-2 text-sm text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {/* Preview Button */}
                    <Button
                      onClick={() => handlePreview(attachment)}
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-800"
                      title="Lihat file"
                    >
                      <Eye size={16} />
                    </Button>
                    
                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownload(attachment.id)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                      disabled={downloading === attachment.id}
                      title="Download file"
                    >
                      {downloading === attachment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                      ) : (
                        <Download size={16} />
                      )}
                    </Button>
                    
                    {/* Delete Button */}
                    {!readOnly && (
                      <Button
                        onClick={() => handleDelete(attachment.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        disabled={deleting === attachment.id}
                        title="Hapus file"
                      >
                        {deleting === attachment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render upload section
  const renderUploadSection = () => {
    if (readOnly) return null;
    
    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-sm font-medium mb-3">Upload Lampiran</h3>
        
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
              disabled={isUploading}
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
              disabled={isUploading || files.length === 0}
              className="flex items-center gap-2"
              size="sm"
            >
              {isUploading ? (
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
          {uploadErrors.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1">Error:</h4>
              <ul className="list-disc pl-5 text-sm text-red-600">
                {uploadErrors.map((error, index) => (
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
                        onClick={() => removeSelectedFile(index)}
                        className="p-1 rounded-full text-red-500 hover:bg-red-50"
                        disabled={isUploading}
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
  };
  
  // Preview modal component
  const PreviewModal = () => {
    if (!selectedAttachment) return null;
    
    const previewUrl = `/api/faktur/${fakturId}/attachments/${selectedAttachment.id}?preview=true`;
    
    const handlePreviewDownload = () => {
      if (!selectedAttachment) return;
      handleDownload(selectedAttachment.id);
    };
    
    const handleZoomIn = () => {
      setPreviewZoom(prev => Math.min(prev + 0.25, 3));
    };
    
    const handleZoomOut = () => {
      setPreviewZoom(prev => Math.max(prev - 0.25, 0.5));
    };
    
    const handleRotate = () => {
      setPreviewRotation(prev => (prev + 90) % 360);
    };
    
    const resetView = () => {
      setPreviewZoom(1);
      setPreviewRotation(0);
    };
    
    const renderPreviewContent = () => {
      if (previewLoading && !previewError) {
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mb-4"></div>
            <p>Memuat file...</p>
          </div>
        );
      }
      
      if (previewError) {
        return (
          <div className="text-center py-8 px-4">
            <p className="text-red-500 mb-4">{previewError}</p>
            <Button variant="outline" onClick={resetView}>Coba Lagi</Button>
          </div>
        );
      }
      
      if (selectedAttachment.file_type.startsWith('image/')) {
        // Image preview
        return (
          <div className="flex items-center justify-center w-full h-full min-h-[300px] overflow-auto">
            <img 
              src={previewUrl} 
              alt={selectedAttachment.filename} 
              className="max-w-full"
              style={{ 
                transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease'
              }}
              onLoad={() => setPreviewLoading(false)}
              onError={() => {
                setPreviewLoading(false);
                setPreviewError('Gagal memuat gambar');
              }}
            />
          </div>
        );
      } else if (selectedAttachment.file_type === 'application/pdf') {
        // PDF preview
        return (
          <div className="w-full h-[70vh]">
            <object 
              data={previewUrl} 
              type="application/pdf"
              className="w-full h-full border-0"
              onLoad={() => setPreviewLoading(false)}
              onError={() => {
                setPreviewLoading(false);
                setPreviewError('Gagal memuat PDF');
              }}
            >
              <p>Browser Anda tidak mendukung tampilan PDF. Silakan <a href={previewUrl} target="_blank" rel="noopener noreferrer">download file</a> untuk melihatnya.</p>
            </object>
          </div>
        );
      } else {
        // Unsupported file type
        setPreviewLoading(false);
        return (
          <div className="text-center py-8 px-4">
            <p className="mb-4">Pratinjau tidak tersedia untuk jenis file ini.</p>
            <Button onClick={handlePreviewDownload}>Download File</Button>
          </div>
        );
      }
    };
    
    return (
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between pr-0">
            <DialogTitle className="truncate max-w-[400px]">
              {displayCleanFilename(selectedAttachment.filename)}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {(selectedAttachment.file_type.startsWith('image/')) && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleZoomIn}
                    title="Perbesar"
                  >
                    <span className="sr-only">Perbesar</span>
                    <span>+</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleZoomOut}
                    title="Perkecil"
                  >
                    <span className="sr-only">Perkecil</span>
                    <span>-</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotate}
                    title="Putar"
                  >
                    <span className="sr-only">Putar</span>
                    <span>↻</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetView}
                    title="Reset tampilan"
                  >
                    Reset
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreviewDownload}
                title="Unduh file"
              >
                <Download size={16} className="mr-1" /> Unduh
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewOpen(false)}
                title="Tutup"
              >
                <X size={16} />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="mt-2 flex-1 overflow-hidden">
            {renderPreviewContent()}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Nama asli: {selectedAttachment.original_filename}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle>Dokumen Lampiran</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          title="Refresh daftar lampiran"
        >
          <RefreshCw size={16} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {renderUploadSection()}
        {renderAttachmentList()}
        <PreviewModal />
      </CardContent>
    </Card>
  );
}