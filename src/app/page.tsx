import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Clapperboard, Star } from 'lucide-react';
import { StreamCard } from '@/components/stream-card';
import { streams } from '@/lib/data';
import { TrendingTopics } from '@/components/trending-topics';

export default function Home() {
  const featuredStream = streams[0];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] rounded-2xl overflow-hidden">
        <Image
          src="https://picsum.photos/1600/900"
          alt="Featured stream"
          data-ai-hint="gameplay screenshot"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-4 border-primary">
              <AvatarImage src={featuredStream.userAvatar} />
              <AvatarFallback>{featuredStream.user.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{featuredStream.title}</h1>
              <p className="text-lg text-muted-foreground">{featuredStream.user}</p>
            </div>
          </div>
          <p className="max-w-2xl mb-6 text-lg">{`Join ${featuredStream.user} for an exciting live session. Don't miss out!`}</p>
          <Link href={`/stream/${featuredStream.id}`}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Clapperboard className="mr-2 h-5 w-5" /> Watch Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Trending Topics Section */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Trending Topics</h2>
        <TrendingTopics />
      </section>

      {/* Live Now Section */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Live Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {streams.slice(1, 5).map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      </section>
      
      {/* Recommended For You Section */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center">
            <Star className="w-7 h-7 mr-2 text-accent" />
            Recommended For You
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {streams.slice(5).map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      </section>
    </div>
  );
}
