'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface StreamPlayerProps {
  streamUrl: string;
  isLive: boolean;
  streamKey: string;
}

export default function StreamPlayer({ streamUrl, isLive, streamKey }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const mountedRef = useRef(true); // guard to avoid setState after unmount
  const copyTimeoutRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  // ensure mountedRef is accurate
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // HLS setup + cleanup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // reset any previous error/loading state
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Helper to safely set state only if mounted
    const safeSetLoading = (v: boolean) => { if (mountedRef.current) setLoading(v); };
    const safeSetError = (msg: string | null) => { if (mountedRef.current) setError(msg); };

    // If Hls.js is supported, use it
    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        enableWorker: true,
      });

      hlsRef.current = hls;

      const onManifestParsed = () => {
        safeSetLoading(false);
        // try to autoplay — swallow promise if blocked
        video.play().catch(() => {/* autoplay blocked */});
      };

      const onError = (_event: any, data: any) => {
        console.error('HLS error:', data);
        safeSetError('Stream temporarily unavailable');
        safeSetLoading(false);
      };

      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.on(Hls.Events.ERROR, onError);

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      // cleanup function
      return () => {
        try {
          // remove listeners we registered
          hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
          hls.off(Hls.Events.ERROR, onError);
        } catch (e) { /* ignore */ }

        // destroy hls and null ref
        try {
          hls.destroy();
        } catch (e) { /* ignore */ }
        if (hlsRef.current === hls) hlsRef.current = null;

        // pause video and clear sources
        try {
          video.pause();
        } catch (e) {}
        // avoid retaining media resource
        try {
          // if video.srcObject used anywhere else, clear it
          // @ts-ignore
          video.srcObject = null;
          video.removeAttribute('src');
        } catch (e) {}
      };
    }

    // Fallback: native HLS (Safari)
    const onLoadedData = () => { safeSetLoading(false); };
    const onVideoError = () => { safeSetError('Playback error'); };

    video.src = streamUrl;
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onVideoError);

    // try autoplay
    video.play().catch(() => {/* autoplay blocked */});

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onVideoError);
      try { video.pause(); } catch (e) {}
      try {
        // @ts-ignore
        video.srcObject = null;
        video.removeAttribute('src');
      } catch (e) {}
    };
  }, [streamUrl]);

  // Mock viewer count — guarded by mountedRef
  useEffect(() => {
    if (!isLive) return;
    const id = window.setInterval(() => {
      if (!mountedRef.current) return;
      setViewerCount(Math.floor(Math.random() * 50) + 10);
    }, 3000);

    return () => clearInterval(id);
  }, [isLive]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <div className="relative aspect-video">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-white text-sm">Loading stream...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <div className="text-6xl mb-4">📡</div>
              <p className="text-lg mb-2">{error}</p>
              <p className="text-sm text-gray-400">Stream Key: {streamKey}</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          className="w-full h-full object-cover"
          poster="/stream-placeholder.jpg"
        />

        {isLive && !error && (
          <>
            <div className="absolute top-4 left-4">
              <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-full">
                🔴 LIVE
              </span>
            </div>

            <div className="absolute top-4 right-4">
              <span className="bg-black bg-opacity-75 text-white px-3 py-1 text-sm rounded-full">
                👀 {viewerCount} viewers
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
