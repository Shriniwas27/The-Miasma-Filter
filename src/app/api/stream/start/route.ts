import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

declare global {
  var activeStreams: Map<string, any>;
}
global.activeStreams = global.activeStreams || new Map();

export async function POST(request: NextRequest) {
  try {
    console.log("🔴 API: Stream start endpoint called");
    const body = await request.json();
    const streamKey = body?.streamKey;
    console.log("🔑 Received stream key:", streamKey);

    if (!streamKey) {
      return NextResponse.json({ error: "Stream key required" }, { status: 400 });
    }
    if (global.activeStreams.has(streamKey)) {
      return NextResponse.json({ error: "Stream already active" }, { status: 409 });
    }

    const streamDir = path.join(process.cwd(), "streams", streamKey);
    await fs.mkdir(streamDir, { recursive: true });

    // prefer FFMPEG_PATH env var, fallback to 'ffmpeg'
    const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";

    const ffmpegArgs = [
      "-i",
      `rtmp://localhost:1935/live/${streamKey}`,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency",
      "-c:a",
      "aac",
      "-f",
      "hls",
      "-hls_time",
      "2",
      "-hls_list_size",
      "10",
      "-hls_flags",
      "delete_segments",
      "-hls_allow_cache",
      "0",
      "-hls_base_url",
      `/api/stream/playlist/${streamKey}/`,
      "-hls_segment_filename",
      path.join(streamDir, "segment_%03d.ts"),
      path.join(streamDir, "stream.m3u8"),
    ];

    console.log("🔧 Starting ffmpeg:", ffmpegPath, ffmpegArgs.join(" "));

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Keep track
    global.activeStreams.set(streamKey, {
      process: ffmpegProcess,
      startTime: Date.now(),
      directory: streamDir,
    });

    // Helper to cleanup listeners and map entry
    const cleanupProcess = (code?: number | null, signal?: NodeJS.Signals | null) => {
      try {
        // remove any listeners on stdio streams to free memory
        if (ffmpegProcess.stdout) ffmpegProcess.stdout.removeAllListeners();
        if (ffmpegProcess.stderr) ffmpegProcess.stderr.removeAllListeners();
      } catch (e) {}
      if (global.activeStreams.has(streamKey)) global.activeStreams.delete(streamKey);
      console.log(`FFmpeg process cleanup complete for ${streamKey}. exitCode=${code} signal=${signal}`);
    };

    ffmpegProcess.stdout?.on("data", (d) => {
      console.log(`[ffmpeg:${streamKey}] stdout:`, d.toString().trim());
    });

    ffmpegProcess.stderr?.on("data", (d) => {
      const output = d.toString().trim();
      console.log(`[ffmpeg:${streamKey}] stderr:`, output);
      // keep light-weight parsing for useful events
      if (output.includes("Input #0")) console.log("🎥 RTMP input detected");
      if (output.includes("Opening")) console.log("🔗 HLS segment opened");
    });

    ffmpegProcess.on("error", (err) => {
      console.error("FFmpeg process error:", err);
      cleanupProcess();
    });

    ffmpegProcess.on("exit", (code, signal) => {
      console.log(`FFmpeg exited for ${streamKey} code=${code} signal=${signal}`);
      cleanupProcess(code, signal);
    });

    ffmpegProcess.on("close", (code) => {
      console.log(`FFmpeg closed for ${streamKey} code=${code}`);
      cleanupProcess(code, null);
    });

    return NextResponse.json({
      success: true,
      message: "Stream started successfully",
      streamKey,
      playlistUrl: `/api/stream/playlist/${streamKey}`,
      watchUrl: `/watch/${streamKey}`,
      rtmpUrl: `rtmp://localhost:1935/live/${streamKey}`,
      instructions: "Start streaming to the RTMP URL using OBS or FFmpeg",
    });
  } catch (error: any) {
    console.error("💥 API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
