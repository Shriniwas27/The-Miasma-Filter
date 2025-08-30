import { notFound } from 'next/navigation';
import { streams } from '@/lib/data';
import { VideoPlayer } from '@/components/video-player';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/components/chat';
import { Eye, UserCircle } from 'lucide-react';

type StreamPageProps = {
  params: {
    id: string;
  };
};

export default function StreamPage({ params }: StreamPageProps) {
  const stream = streams.find((s) => s.id === params.id);

  if (!stream) {
    notFound();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)]">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-shrink-0">
          <VideoPlayer />
        </div>
        <div className="p-4 bg-card rounded-lg flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">{stream.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(stream.viewers)} viewers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stream.category}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={stream.userAvatar} />
                    <AvatarFallback>{stream.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{stream.user}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {stream.tags.map(tag => (
              <Badge key={tag} variant="outline" className="border-accent text-accent">{tag}</Badge>
            ))}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <h2 className="font-semibold text-lg text-foreground">About this stream</h2>
            <p>{stream.description}</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <Chat streamId={stream.id} />
      </div>
    </div>
  );
}
