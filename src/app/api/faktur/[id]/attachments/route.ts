//src/app/faktur/[id]/attachments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturAttachments } from '@/lib/db/schema/attachments';
import { eq, desc } from 'drizzle-orm';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'faktur-attachments');

// POST - Upload a file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    
    // Check if the folder exists, if not create it
    await mkdir(join(UPLOAD_DIR, fakturId), { recursive: true });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string || '';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Only PDF, JPG, and PNG are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    // Fetch faktur data for customized filename
    const [fakturData] = await db
      .select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
    
    if (!fakturData) {
      return NextResponse.json(
        { error: 'Faktur not found' },
        { status: 404 }
      );
    }
    
    // Create customized filename: "Referensi - nama_pembeli - Nomor_Faktur_Pajak"
    const referensi = fakturData.referensi || 'NoRef';
    const namaPembeli = fakturData.nama_pembeli || 'NoCust';
    const nomorFakturPajak = fakturData.nomor_faktur_pajak || 'NoInv';
    const fileExt = file.name.split('.').pop();
    
    // Custom file name for storage and display
    const customFileName = `${referensi} - ${namaPembeli} - ${nomorFakturPajak}`;
    
    // Clean the filename from characters that might cause issues with the filesystem
    const sanitizedFileName = customFileName
      .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid chars with dash
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique ID for the file in database
    const id = uuidv4();
    
    // For actual file storage, we need to make sure it's unique,
    // but we'll keep the UUID part invisible to the user in the display
    // We append a hidden field separator character before the UUID so it can be 
    // parsed but won't appear in most displays
    const storageFileName = `${sanitizedFileName}\u200B${id.substring(0, 8)}.${fileExt}`;
    const filePath = join(fakturId, storageFileName);
    
    // Save the file to the filesystem
    await writeFile(join(UPLOAD_DIR, filePath), buffer);
    
    // Store file metadata in the database
    await db.insert(fakturAttachments).values({
      id,
      faktur_id: fakturId,
      filename: `${sanitizedFileName}.${fileExt}`, // Display filename (without UUID)
      original_filename: file.name,
      file_path: filePath,           // Storage filename (with hidden UUID)
      file_type: file.type,
      file_size: file.size,
      description,
      uploaded_by: 'system', // You might want to get this from session/auth
      uploaded_at: new Date(),
    });
    
    return NextResponse.json({
      id,
      filename: `${sanitizedFileName}.${fileExt}`,
      original_filename: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET - List all attachments for a faktur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    
    const attachments = await db
      .select()
      .from(fakturAttachments)
      .where(eq(fakturAttachments.faktur_id, fakturId))
      .orderBy(desc(fakturAttachments.uploaded_at));
    
    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Error getting attachments:', error);
    return NextResponse.json(
      { error: 'Failed to get attachments' },
      { status: 500 }
    );
  }
}