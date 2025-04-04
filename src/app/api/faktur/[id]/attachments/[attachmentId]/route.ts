//src/app/faktur/[id]/attachments/[attachmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, unlink, stat } from 'fs/promises';
import { db } from '@/lib/db';
import { fakturAttachments } from '@/lib/db/schema/attachments';
import { eq, and } from 'drizzle-orm';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'faktur-attachments');

// GET - Download or Preview a specific attachment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id: fakturId, attachmentId } = params;
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';
    
    console.log(`${isPreview ? 'Previewing' : 'Downloading'} file: fakturId=${fakturId}, attachmentId=${attachmentId}`);
    
    // Get the attachment metadata from the database
    const [attachment] = await db
      .select()
      .from(fakturAttachments)
      .where(eq(fakturAttachments.id, attachmentId))
      .limit(1);
    
    if (!attachment) {
      console.error('Attachment not found in database');
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }
    
    // Construct the file path
    const filePath = join(UPLOAD_DIR, attachment.file_path);
    console.log(`Full file path: ${filePath}`);
    
    // Check if file exists
    try {
      await stat(filePath);
    } catch (error) {
      console.error(`File not found at path: ${filePath}`, error);
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }
    
    // Read the file from the filesystem
    const fileBuffer = await readFile(filePath);
    console.log(`Successfully read file of size: ${fileBuffer.length} bytes`);
    
    // Use the "clean" filename without UUID for display/download
    const displayFilename = attachment.filename;
    
    // Set content disposition based on whether it's a preview or download
    const contentDisposition = isPreview 
      ? 'inline' 
      : `attachment; filename="${encodeURIComponent(displayFilename)}"`;
    
    // Return the file with appropriate headers based on file type
    const headers = {
      'Content-Type': attachment.file_type,
      'Content-Disposition': contentDisposition,
      'Content-Length': fileBuffer.length.toString(),
      // Add cache headers to avoid issues with preview loading
      'Cache-Control': isPreview ? 'public, max-age=300' : 'no-cache',
    };
    
    return new NextResponse(fileBuffer, { headers });
    
  } catch (error) {
    console.error('Error accessing file:', error);
    return NextResponse.json(
      { error: 'Failed to access file' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a specific attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const { id: fakturId, attachmentId } = params;
    
    console.log(`Deleting file: fakturId=${fakturId}, attachmentId=${attachmentId}`);
    
    // Get the attachment metadata from the database
    const [attachment] = await db
      .select()
      .from(fakturAttachments)
      .where(and(
        eq(fakturAttachments.id, attachmentId),
        eq(fakturAttachments.faktur_id, fakturId)
      ))
      .limit(1);
    
    if (!attachment) {
      console.error('Attachment not found in database');
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }
    
    // Construct the file path
    const filePath = join(UPLOAD_DIR, attachment.file_path);
    console.log(`Full file path: ${filePath}`);
    
    try {
      // Delete the file from the filesystem
      await unlink(filePath);
      console.log(`File deleted from filesystem: ${filePath}`);
      
      // Delete the metadata from the database
      await db
        .delete(fakturAttachments)
        .where(eq(fakturAttachments.id, attachmentId));
      console.log(`File metadata deleted from database`);
      
      return NextResponse.json({ success: true });
    } catch (fileError) {
      console.error('Error deleting file from filesystem:', fileError);
      
      // Even if the file delete fails, try to remove the database entry
      try {
        await db
          .delete(fakturAttachments)
          .where(eq(fakturAttachments.id, attachmentId));
        console.log(`File metadata deleted from database despite filesystem error`);
      } catch (dbError) {
        console.error('Error deleting file metadata from database:', dbError);
      }
      
      return NextResponse.json(
        { error: 'Failed to delete file from filesystem' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in delete handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}