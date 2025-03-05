import React from 'react';

interface ExportStatusProps {
  exporting: { type: string, status: boolean };
}

export const ExportStatus: React.FC<ExportStatusProps> = ({ exporting }) => {
  if (!exporting.status) {
    return null;
  }
  
  return (
    <div className="bg-primary/10 text-primary rounded-md p-2 mt-2 mb-4 flex items-center justify-center text-sm animate-pulse">
      <span>Sedang mengexport {exporting.type === 'faktur' ? 'format faktur' : 'rekapan internal'}, mohon tunggu...</span>
    </div>
  );
};