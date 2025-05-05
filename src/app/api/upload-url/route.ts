import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/utils/s3-upload';

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    const { uploadUrl, fileUrl } = await generatePresignedUrl(fileName, fileType);

    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
} 