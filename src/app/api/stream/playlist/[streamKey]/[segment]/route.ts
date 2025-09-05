import { NextRequest } from 'next/server';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';

// Dynamic segment route: /api/stream/playlist/[streamKey]/[segment]
export async function GET(
  request: NextRequest,
  { params }: { params: { streamKey: string; segment: string } }
) {
  try {
    const { streamKey, segment } = params;

    // Only allow .ts files
    if (!segment.endsWith('.ts')) {
      return new Response(JSON.stringify({ error: 'Invalid segment' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const segmentPath = path.join(process.cwd(), 'streams', streamKey, segment);

    try {
      // Check existence first
      await fs.access(segmentPath);

      // Stream the file instead of reading whole buffer
      const fileStream = createReadStream(segmentPath);

      return new Response(fileStream as any, {
        headers: {
          'Content-Type': 'video/mp2t',
          'Access-Control-Allow-Origin': '*',
          // For live streams, you usually want no cache
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.log(`❌ Segment not found: ${segment}`);
        return new Response(JSON.stringify({ error: 'Segment not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      console.error('Segment read error:', err);
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('💥 Segment serve error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
