import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileText, FileImage, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import FilePreviewModal from './FilePreviewModal';

interface Attachment {
  id: string;
  original_filename: string;
  filename: string;  // This is now the formatted filename stored on upload
  file_type: string;
  file_size: number;
  description: string;
  uploaded_at: string;
}

interface FileAttachmentListProps {
  fakturId: string;
  refresh: boolean;
  readOnly?: boolean;
}

export default function FileAttachmentList({ fakturId, refresh, readOnly = false }: FileAttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  
  useEffect(() => {
    const fetchAttachments = async () => {
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
  }, [fakturId, refresh]);
  
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
      
      const result = await response.json();
      
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
  };
  
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
    <>
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
                    <span className="truncate max-w-xs">{attachment.filename}</span>
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
      
      {/* Preview Modal */}
      <FilePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fakturId={fakturId}
        attachment={selectedAttachment}
      />
    </>
  );
}