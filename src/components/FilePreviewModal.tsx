import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fakturId: string;
  attachment: {
    id: string;
    filename: string;
    file_type: string;
    original_filename: string;
  } | null;
}

export default function FilePreviewModal({ 
  open, 
  onOpenChange, 
  fakturId, 
  attachment 
}: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const handleDownload = () => {
    if (!attachment) return;
    
    try {
      const downloadUrl = `/api/faktur/${fakturId}/attachments/${attachment.id}`;
      
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
    }
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };
  
  const renderPreviewContent = () => {
    if (!attachment) return null;
    
    const previewUrl = `/api/faktur/${fakturId}/attachments/${attachment.id}?preview=true`;
    
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mb-4"></div>
          <p>Memuat file...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-8 px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={resetView}>Coba Lagi</Button>
        </div>
      );
    }
    
    if (attachment.file_type.startsWith('image/')) {
      // Image preview
      return (
        <div className="flex items-center justify-center w-full h-full min-h-[300px] overflow-auto">
          <img 
            src={previewUrl} 
            alt={attachment.filename} 
            className="max-w-full"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Gagal memuat gambar');
            }}
          />
        </div>
      );
    } else if (attachment.file_type === 'application/pdf') {
      // PDF preview
      return (
        <div className="w-full h-[70vh]">
          <iframe 
            src={previewUrl} 
            title={attachment.filename}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Gagal memuat PDF');
            }}
          />
        </div>
      );
    } else {
      // Unsupported file type
      return (
        <div className="text-center py-8 px-4">
          <p className="mb-4">Pratinjau tidak tersedia untuk jenis file ini.</p>
          <Button onClick={handleDownload}>Download File</Button>
        </div>
      );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between pr-0">
          <DialogTitle className="truncate max-w-[400px]">
            {attachment?.filename || 'Preview File'}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {(attachment?.file_type.startsWith('image/')) && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  title="Perbesar"
                >
                  <ZoomIn size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  title="Perkecil"
                >
                  <ZoomOut size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRotate}
                  title="Putar"
                >
                  <RotateCw size={16} />
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
              onClick={handleDownload}
              title="Unduh file"
            >
              <Download size={16} className="mr-1" /> Unduh
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
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
          <p>Nama asli: {attachment?.original_filename}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}