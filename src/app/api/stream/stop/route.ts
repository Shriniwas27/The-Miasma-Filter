import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Same activeStreams reference as start route
declare global {
  var activeStreams: Map<string, any>;
}
global.activeStreams = global.activeStreams || new Map();

export async function POST(request: NextRequest) {
  try {
    const { streamKey } = await request.json();

    if (!streamKey) {
      return NextResponse.json({ error: 'Stream key required' }, { status: 400 });
    }

    const streamInfo = global.activeStreams.get(streamKey);
    if (!streamInfo) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const proc = streamInfo.process;
    const streamDir: string = streamInfo.directory;

    console.log(`🛑 Stopping stream: ${streamKey}`);

    // Ask FFmpeg to exit gracefully
    try {
      proc.kill('SIGTERM');
    } catch (e) {
      console.warn('⚠️ Failed to send SIGTERM:', e);
    }

    // Wait up to 5s for process exit
    const exited = await new Promise<boolean>((resolve) => {
      let resolved = false;

      const finish = (ok: boolean) => {
        if (!resolved) {
          resolved = true;
          resolve(ok);
        }
      };

      proc.once('exit', () => finish(true));
      proc.once('close', () => finish(true));

      setTimeout(() => finish(false), 5000);
    });

    if (!exited) {
      console.warn(`⚠️ FFmpeg did not exit in time for ${streamKey}, killing forcefully`);
      try {
        proc.kill('SIGKILL');
      } catch (e) {
        console.error('❌ Failed to SIGKILL:', e);
      }
    }

    // Clean up event listeners to avoid leaks
    try {
      proc.stdout?.removeAllListeners();
      proc.stderr?.removeAllListeners();
    } catch (e) {}

    // Remove from activeStreams
    global.activeStreams.delete(streamKey);

    // Archive stream directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveBase = path.join(process.cwd(), 'archives');
    const archiveDir = path.join(archiveBase, `${streamKey}_${timestamp}`);

    try {
      await fs.mkdir(archiveBase, { recursive: true });
      await fs.rename(streamDir, archiveDir);
      console.log(`📦 Stream archived to: ${archiveDir}`);
    } catch (err) {
      console.error('⚠️ Archive error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Stream stopped and archived',
      archiveLocation: archiveDir,
    });

  } catch (error) {
    console.error('💥 Stop stream error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
