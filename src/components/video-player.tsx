'use client';
import { Play, MicOff, VideoOff } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type VideoPlayerProps = {
  isLive?: boolean;
};

export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(({ isLive }, ref) => {
  const internalRef = React.useRef<HTMLVideoElement>(null);
  const videoRef = (ref || internalRef) as React.RefObject<HTMLVideoElement>;

  if (isLive) {
    return (
      <div className="w-full aspect-video bg-black rounded-xl border-2 border-primary relative">
        <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
        <div className="absolute bottom-4 left-4 text-xs text-white bg-red-600/90 px-2 py-1 rounded flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center border-2 border-primary/50 relative">
       <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
      <div className="text-center text-muted-foreground">
        <Play className="h-12 w-12 text-primary mx-auto" />
        <p className="mt-2">Stream is offline</p>
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
        Offline
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
