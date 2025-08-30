'use client';
import { Play, MicOff, VideoOff, Camera } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type VideoPlayerProps = {
  isLive?: boolean;
  isPreview?: boolean;
};

export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(({ isLive, isPreview }, ref) => {
  const internalRef = React.useRef<HTMLVideoElement>(null);
  const videoRef = (ref || internalRef) as React.RefObject<HTMLVideoElement>;
  const [hasStream, setHasStream] = React.useState(false);

  React.useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // If there's a stream, update our state
      const checkStream = () => {
        if (videoElement.srcObject) {
          setHasStream(true);
        }
      };

      // Check initially and also when the srcObject changes
      checkStream();
      const observer = new MutationObserver(checkStream);
      observer.observe(videoElement, { attributes: true, attributeFilter: ['srcObject'] });

      return () => observer.disconnect();
    }
  }, [videoRef]);

  const showPlaceholder = isPreview ? !hasStream : !isLive;

  return (
    <div className={cn("w-full aspect-video bg-black rounded-xl border-2 relative flex items-center justify-center", 
        isLive ? "border-primary" : "border-primary/50"
    )}>
      <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
      
      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground bg-black/80">
          {isPreview ? (
            <>
              <Camera className="h-12 w-12 text-primary mx-auto" />
              <p className="mt-2">Camera preview will appear here</p>
            </>
          ) : (
            <>
              <Play className="h-12 w-12 text-primary mx-auto" />
              <p className="mt-2">Stream is offline</p>
            </>
          )}
        </div>
      )}
      
      {isLive && !isPreview && (
        <div className="absolute bottom-4 left-4 text-xs text-white bg-red-600/90 px-2 py-1 rounded flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE
        </div>
      )}

      {!isLive && !isPreview && (
        <div className="absolute bottom-4 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
            Offline
        </div>
      )}

    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
