import { Play } from 'lucide-react';

export function VideoPlayer() {
  return (
    <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center border-2 border-primary/50 relative">
      <div className="text-center text-muted-foreground">
        <Play className="h-16 w-16 text-primary mx-auto animate-pulse" />
        <p>Live stream is loading...</p>
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
        Offline
      </div>
    </div>
  );
}
