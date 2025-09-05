"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface StreamInfo {
  streamKey: string;
  rtmpUrl: string;
  status: "idle" | "starting" | "live" | "stopping";
  startTime?: Date;
  id?: number; // for /stream/{id} page
}

export default function GoLivePage() {
  const categories = ["Gaming", "Music", "Tech"]; // replace with your own categories
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [streamInfo, setStreamInfo] = React.useState<StreamInfo>({
    streamKey: "uplglkfqmtl52f0w4lj6",
    rtmpUrl: "rtmp://localhost:1935/live/",
    status: "idle",
    id: 1, // simulate DB ID
  });

  const { toast } = useToast();

  const startStream = async () => {
    if (!streamInfo.streamKey) return;

    setStreamInfo((prev) => ({
      ...prev,
      status: "starting",
      startTime: new Date(),
    }));

    try {
      const response = await fetch("/api/stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamKey: streamInfo.streamKey }),
      });

      if (response.ok) {
        setStreamInfo((prev) => ({ ...prev, status: "live" }));
        toast({
          title: "Stream started",
          description: "Your stream is live!",
        });
      } else {
        setStreamInfo((prev) => ({ ...prev, status: "idle" }));
      }
    } catch (error) {
      console.error("Failed to start stream:", error);
      setStreamInfo((prev) => ({ ...prev, status: "idle" }));
    }
  };

  const stopStream = async () => {
    setStreamInfo((prev) => ({ ...prev, status: "stopping" }));

    try {
      await fetch("/api/stream/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamKey: streamInfo.streamKey }),
      });
    } finally {
      setStreamInfo((prev) => ({
        ...prev,
        status: "idle",
        startTime: undefined,
      }));
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Go Live</h1>
        <p className="text-muted-foreground mt-2">
          Start your own broadcast to the world
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <form>
          <Card>
            <CardHeader>
              <CardTitle>Stream Setup</CardTitle>
              <CardDescription>
                Configure your stream details before you start.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., My Awesome Live Stream"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={streamInfo.status === "live"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your stream."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={streamInfo.status === "live"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={setCategory}
                  value={category}
                  disabled={streamInfo.status === "live"}
                >
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
              {streamInfo.status === "idle" ? (
                <button
                  type="button"
                  onClick={startStream}
                  disabled={!streamInfo.streamKey}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 font-medium"
                >
                  Start Streaming
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopStream}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                >
                  End Stream
                </button>
              )}
            </CardFooter>
          </Card>
        </form>

        {/* Stream details card, visible when live */}
        {streamInfo.status === "live" && (
          <Card>
            <CardHeader>
              <CardTitle>Stream Details</CardTitle>
              <CardDescription>
                Share this info with your viewers or paste into OBS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Watch page link */}
              <div className="space-y-1">
                <Label>Watch Link</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`${window.location.origin}/stream/${streamInfo.id}`}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleCopy(
                        `${window.location.origin}/stream/${streamInfo.id}`,
                        "Watch Link"
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-1">
                <Label>Stream Key</Label>
                <div className="flex items-center space-x-2">
                  <Input value={streamInfo.streamKey} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleCopy(streamInfo.streamKey, "Stream Key")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* RTMP URL */}
              <div className="space-y-1">
                <Label>RTMP URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`${streamInfo.rtmpUrl}${streamInfo.streamKey}`}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleCopy(
                        `${streamInfo.rtmpUrl}${streamInfo.streamKey}`,
                        "RTMP URL"
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
