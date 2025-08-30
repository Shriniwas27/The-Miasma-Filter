'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VideoPlayer } from '@/components/video-player';
import { streams } from '@/lib/data';
import { Clapperboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createStreamAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function GoLivePage() {
  const categories = [...new Set(streams.map((s) => s.category))];
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | undefined>(undefined);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleStartStreaming = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !description || !category) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out the title, description, and category for your stream.',
        });
        return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);

      const newStream = await createStreamAction({ title, description, category });
      toast({
        title: 'You are live!',
        description: 'Your stream has started and is now visible to others.',
      });
      // We could redirect to the new stream page, but for now let's stay here
      // router.push(`/stream/${newStream.id}`);

    } catch (error) {
      console.error('Error starting stream:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera and microphone permissions in your browser settings.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Go Live</h1>
        <p className="text-muted-foreground mt-2">Start your own broadcast to the world</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <form onSubmit={handleStartStreaming}>
          <Card>
            <CardHeader>
              <CardTitle>Stream Setup</CardTitle>
              <CardDescription>Configure your stream details before you start.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
                <Input id="title" placeholder="e.g., My Awesome Live Stream" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isStreaming} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Tell viewers about your stream." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} disabled={isStreaming} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={setCategory} value={category} disabled={isStreaming}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg" disabled={isStreaming}>
                <Clapperboard className="mr-2 h-5 w-5" />
                {isStreaming ? 'Streaming...' : 'Start Streaming'}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Stream Preview</h2>
            <VideoPlayer ref={videoRef} isLive={isStreaming} />
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera and audio access to start streaming.
                </AlertDescription>
              </Alert>
            )}
        </div>
      </div>
    </div>
  );
}
