'use client';

import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import { streams, liveStreamStore } from '@/lib/data';
import { VideoPlayer } from '@/components/video-player';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/components/chat';
import { Eye } from 'lucide-react';

export default function StreamPage() {
  const params = useParams();
  const id = params.id as string;
  const [stream, setStream] = React.useState<typeof streams[0] | undefined>(undefined);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const rtcConnectionRef = React.useRef<RTCPeerConnection | null>(null);

  React.useEffect(() => {
    // Attempt to find the stream immediately
    const initialStream = streams.find((s) => s.id === id);
    if (initialStream) {
      setStream(initialStream);
      return;
    }

    // If not found, poll for a short period to handle new streams
    const interval = setInterval(() => {
      const foundStream = streams.find((s) => s.id === id);
      if (foundStream) {
        setStream(foundStream);
        clearInterval(interval);
      }
    }, 100);
    
    // If stream is not found after a few seconds, give up.
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!streams.find((s) => s.id === id)) {
          // notFound() can't be called in a useEffect cleanup on unmount
          // but we can ensure it is only called when component is mounted
          if (videoRef.current) {
            notFound();
          }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [id]);
  
  React.useEffect(() => {
    if (!stream?.isLive || !liveStreamStore.offer || rtcConnectionRef.current) return;
      
    // --- Start WebRTC Setup (Viewer side) ---
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    rtcConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this candidate to the streamer via signaling server
        liveStreamStore.viewerIceCandidates.push(event.candidate);
      }
    };
    
    peerConnection.ontrack = (event) => {
      if (videoRef.current && videoRef.current.srcObject !== event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    const setupViewer = async () => {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(liveStreamStore.offer!));
        
        // Add streamer ICE candidates that might have been gathered
        liveStreamStore.streamerIceCandidates.forEach(candidate => {
          peerConnection.addIceCandidate(candidate).catch(e => console.error("Error adding ICE candidate: ", e));
        });

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // In a real app, send this answer to the streamer via signaling server
        liveStreamStore.answer = answer;

      } catch (error) {
        console.error("Error setting up viewer connection:", error);
      }
    };

    setupViewer();
    // --- End WebRTC Setup ---
    
    return () => {
        if (rtcConnectionRef.current) {
            rtcConnectionRef.current.close();
            rtcConnectionRef.current = null;
        }
        // Clean up signaling store for next stream
        liveStreamStore.offer = null;
        liveStreamStore.answer = null;
        liveStreamStore.streamerIceCandidates = [];
        liveStreamStore.viewerIceCandidates = [];
    }
  }, [stream]);


  if (!stream) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading stream...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)]">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-shrink-0">
          <VideoPlayer ref={videoRef} isLive={stream.isLive} />
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
