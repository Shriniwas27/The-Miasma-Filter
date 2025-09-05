'use client';

import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import { streams, liveStreamStore } from '@/lib/data';
import StreamPlayer from '@/components/StreamPlayer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/components/chat';
import { Eye } from 'lucide-react';
import { ContentValidationToast } from '@/components/ContentValidationToast'

export default function StreamPage() {
  const params = useParams();
  const id = params.id as string;
  const [stream, setStream] = React.useState<(typeof streams)[0] | undefined>(undefined);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const rtcConnectionRef = React.useRef<RTCPeerConnection | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isLive, setIsLive] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    }
  }, []);

  React.useEffect(() => {
    // Attempt to find the stream immediately
    const initialStream = streams.find((s) => s.id === id);
    if (initialStream) {
      setStream(initialStream);
      setIsLive(initialStream.isLive);
      return;
    }

    // If not found, poll for a short period to handle new streams
    const interval = setInterval(() => {
      const foundStream = streams.find((s) => s.id === id);
      if (foundStream) {
        setStream(foundStream);
        setIsLive(foundStream.isLive);
        clearInterval(interval);
      }
    }, 100);
    
    // If stream is not found after a few seconds, give up.
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (isMounted && !streams.find((s) => s.id === id)) {
        notFound();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [id, isMounted]);
  
  React.useEffect(() => {
    if (!stream?.isLive || !liveStreamStore.offer || rtcConnectionRef.current) return;
      
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    rtcConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        liveStreamStore.viewerIceCandidates.push(event.candidate);
      }
    };
    
    peerConnection.ontrack = (event) => {
      if (videoRef.current && videoRef.current.srcObject !== event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.play().catch(e => console.error("Error playing stream:", e));
      }
    };

    peerConnection.onconnectionstatechange = () => {
        setIsLive(peerConnection.connectionState === 'connected');
    }

    const setupViewer = async () => {
      try {
        if (peerConnection.signalingState === 'stable') {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(liveStreamStore.offer!));
          
          liveStreamStore.streamerIceCandidates.forEach(candidate => {
            peerConnection.addIceCandidate(candidate).catch(e => console.error("Error adding ICE candidate: ", e));
          });

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          liveStreamStore.answer = answer;
        }

      } catch (error) {
        console.error("Error setting up viewer connection:", error);
      }
    };

    setupViewer();
    
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

  const streamKey = "uplglkfqmtl52f0w4lj6";
  const streamUrl = `/api/stream/playlist/${streamKey}`;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)]">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-shrink-0">
          <StreamPlayer 
              streamUrl={streamUrl} 
              isLive={true}
              streamKey={streamKey}
            />
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
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 gap-1">
        <ContentValidationToast /> 
        <Chat streamId={stream.id} />
      </div>
    </div>
  );
}
