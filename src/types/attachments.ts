export interface FileAttachment {
  id: string;
  faktur_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_at: string;
  description?: string;
}