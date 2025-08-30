'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VideoPlayer } from '@/components/video-player';
import { streams, liveStreamStore } from '@/lib/data';
import { Clapperboard, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createStreamAction } from '@/app/actions';

export default function GoLivePage() {
  const categories = [...new Set(streams.map((s) => s.category))];
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamUrl, setStreamUrl] = React.useState('');
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | undefined>(undefined);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const rtcConnectionRef = React.useRef<RTCPeerConnection | null>(null);

  const { toast } = useToast();
  
  React.useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Store stream for WebRTC
        liveStreamStore.stream = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
        // Clean up stream when component unmounts
        if (liveStreamStore.stream) {
            liveStreamStore.stream.getTracks().forEach(track => track.stop());
            liveStreamStore.stream = null;
        }
    }
  }, [toast]);


  const handleCopyUrl = () => {
    navigator.clipboard.writeText(streamUrl);
    toast({
      title: 'Copied!',
      description: 'Stream URL copied to clipboard.',
    });
  };

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
    
    if (!liveStreamStore.stream) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Could not access your camera. Please ensure permissions are granted.',
        });
        return;
    }
    
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      rtcConnectionRef.current = peerConnection;

      liveStreamStore.stream.getTracks().forEach(track => peerConnection.addTrack(track, liveStreamStore.stream!));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          liveStreamStore.streamerIceCandidates.push(event.candidate);
        }
      };
      
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        if (state === 'connected') {
            setIsStreaming(true);
        }
        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
            setIsStreaming(false);
        }
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      liveStreamStore.offer = offer;

      const newStream = await createStreamAction({ title, description, category });
      const newUrl = `${window.location.origin}/stream/${newStream.id}`;
      setStreamUrl(newUrl);

      // This interval is a stand-in for a real signaling server
      const interval = setInterval(async () => {
        if (liveStreamStore.answer && peerConnection.signalingState !== 'closed' && peerConnection.currentRemoteDescription === null) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(liveStreamStore.answer));
          clearInterval(interval);
          
          liveStreamStore.viewerIceCandidates.forEach(candidate => {
            if (peerConnection.signalingState !== 'closed') {
              peerConnection.addIceCandidate(candidate);
            }
          });
        }
      }, 500);

      toast({
        title: 'You are live!',
        description: 'Your stream has started. Share the link with your viewers!',
      });
      setIsStreaming(true);

    } catch (error) {
      console.error('Error starting stream:', error);
      setIsStreaming(false);
      toast({
        variant: 'destructive',
        title: 'Streaming Error',
        description: 'An unexpected error occurred while trying to start the stream.',
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
              <Button type="submit" className="w-full" size="lg" disabled={isStreaming || hasCameraPermission === false}>
                <Clapperboard className="mr-2 h-5 w-5" />
                {isStreaming ? 'Streaming...' : 'Start Streaming'}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Stream Preview</h2>
            <VideoPlayer ref={videoRef} isLive={true} isPreview={true} />
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera and audio access to start streaming. Refresh the page after granting permissions.
                </AlertDescription>
              </Alert>
            )}
            {streamUrl && (
              <Card>
                  <CardHeader>
                      <CardTitle>Share Your Stream</CardTitle>
                      <CardDescription>
                          Your stream is live! Share this link with your viewers.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="flex items-center space-x-2">
                          <Input value={streamUrl} readOnly />
                          <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                              <Copy className="h-4 w-4" />
                          </Button>
                      </div>
                  </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
