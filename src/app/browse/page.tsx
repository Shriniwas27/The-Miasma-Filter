import { StreamCard } from '@/components/stream-card';
import { streams } from '@/lib/data';

export default function BrowsePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Browse Streams</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} />
        ))}
      </div>
    </div>
  );
}
