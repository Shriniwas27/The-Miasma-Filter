import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamKey: string }> }  // ← Updated type
) {
  try {
    const { streamKey } = await params;  // ← Added await
    const playlistPath = path.join(process.cwd(), 'streams', streamKey, 'stream.m3u8');
    
    try {
      const playlist = await fs.readFile(playlistPath, 'utf-8');
      
      return new NextResponse(playlist, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (error) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
